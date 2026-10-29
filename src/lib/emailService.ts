import { db } from '@/db';
import { writeBackendLog } from '@/lib/backendLogger';
import { siteSettings, emailDeliveryLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getResponsiveEmailTemplateHtml, getSharedEmailTemplateHtml, renderSharedEmailTemplateHtml, formatFieldLabel } from './emailTemplate';
import { dedupeRecipientChannels, includesRecipient } from './emailRecipients';
import { recipientsForForm } from './formEmailRules';
import { resolveSubmissionSubject } from './emailSubject';
import { getSmtpRuntimeConfig } from './smtpRuntimeConfig';

export { getResponsiveEmailTemplateHtml, formatFieldLabel };

export type FormEmailAudit = {
  formName: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  html: string;
  status: 'Delivered' | 'Failed' | 'Pending';
};

/**
 * Server-only Form Submission Dual Email Dispatcher.
 * One admin message is sent with To/CC/BCC arrays. A separate submitter
 * confirmation is optional and is skipped when the submitter is already in
 * the admin recipient set.
 */
export async function dispatchFormEmails(
  formName: string,
  submittedData: Record<string, any>,
  providedUserEmail?: string,
  onAuditSnapshot?: (audit: FormEmailAudit) => Promise<void> | void,
): Promise<{ adminSent: boolean; userSent: boolean; error?: string; audit?: FormEmailAudit }> {
  let lastAudit: FormEmailAudit | undefined;

  const persistAuditSnapshot = async (audit: FormEmailAudit) => {
    lastAudit = audit;
    if (!onAuditSnapshot) return;
    try {
      await onAuditSnapshot(audit);
    } catch (auditError) {
      console.error('[Email Dispatcher] Failed to persist enquiry email snapshot:', auditError);
    }
  };

  try {
    // 1. Fetch saved email settings from DB or defaults
    let adminRecipientEmail = '';
    let adminCcEmail = '';
    let adminBccEmail = '';
    const smtpConfig = getSmtpRuntimeConfig();
    const smtpHost = smtpConfig.host;
    const smtpPort = smtpConfig.port;
    const smtpUser = smtpConfig.user;
    const smtpPass = smtpConfig.password;
    const fromNameEnv = (process.env.MAIL_FROM_NAME || process.env.SMTP_FROM_NAME || '').trim();
    const fromEmailEnv = (process.env.MAIL_FROM_EMAIL || process.env.SMTP_FROM || '').trim();
    const replyToEnv = (process.env.MAIL_REPLY_TO || '').trim();
    let fromEmail = fromEmailEnv || smtpConfig.senderEmail;
    let fromName = fromNameEnv || 'British Hajj Travel UK';
    let replyTo = replyToEnv;
    let subjectPattern = '[form_name]';
    let savedFormsConfig: any = null;

    try {
      const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'forms_settings')).limit(1);
      if (res && res.length > 0) {
        const config = JSON.parse(res[0].value);
        savedFormsConfig = config;
        const saved = config?.emailConfigs || {};
        fromName = fromNameEnv || String(saved.fromName || '').trim() || 'British Hajj Travel UK';
        // From must be the mailbox or a verified sender alias. Environment values take precedence.
        const savedFrom = String(saved.fromEmail || '').trim();
        fromEmail = fromEmailEnv || ((savedFrom.toLowerCase() === smtpUser.toLowerCase()) ? savedFrom : '') || smtpUser;
        replyTo = replyToEnv || String(saved.replyTo || '').trim();
        subjectPattern = String(saved.emailSubjectLine || '').trim() || '[form_name]';

        // Form-specific recipient routing. Each form is stored independently; legacy grouped rules remain readable.
        const formRoutingRules: Array<{ id: string; forms: string[]; sendTo: string; cc: string; bcc?: string }> =
          config?.emailConfigs?.formRoutingRules || [];

        const formKeyMap: Record<string, string> = {
          'BAAN Holding Hajj Interest Form': 'baanHoldingHajjForm',
          'Get a Free Quote Form': 'quoteForm',
          'Homepage Hero Banner — Get a Free Quote Form': 'quoteForm',
          'Package Detail Page Booking Form': 'packageDetailForm',
          'Umrah Package Booking Form': 'packageDetailForm',
          'Package Detail Booking Form': 'packageDetailForm',
          'Umrah Package Detail Page — Booking Form': 'packageDetailForm',
          'Umrah Package Booking — Popup Modal Form': 'packageDetailForm',
          'Umrah Package Booking Form (Detail Page & Popup Modal)': 'packageDetailForm',
          'Hajj Package Detail Page — Booking Form': 'hajjPackageDetailForm',
          'Hajj Package Booking — Popup Modal Form': 'hajjPackageDetailForm',
          'Hajj Package Booking Form (Detail Page & Popup Modal)': 'hajjPackageDetailForm',
          'Hajj Package Booking Form': 'hajjPackageDetailForm',
          'Hajj Page — Customize Your Hajj Package Form': 'hajjCustomizeForm',
          'Hajj Customize Form': 'hajjCustomizeForm',
          'Contact Us Form': 'contact',
          'Contact Inquiry Form': 'contact',
          'Contact Page — Enquiry Form': 'contact',
          'Package Inquiry Form': 'packageInquiry',
          'Pilgrimage Package — Custom Inquiry Form': 'packageInquiry',
          'Visa Consultation Form': 'visaConsultation',
          'Visa Services — Consultation Form': 'visaConsultation',
          'Umrah Visa Order Form': 'umrahVisaOrder',
          'Flight Booking Form': 'flightInquiry',
          'Flights Booking Inquiry Form': 'flightInquiry',
          'Flights Page — Booking Inquiry Form': 'flightInquiry',
          'Drop Us A Message Form': 'dropUsMessage',
          'Drop Us A Message': 'dropUsMessage',
          'General — Drop Us A Message Form': 'dropUsMessage',
          'Blog Detail Page — Sidebar Booking Form': 'blogSidebarForm',
          'Blog Detail Page': 'blogSidebarForm',
        };
        const mappedKey = formKeyMap[formName] || formName;

        // Explicit routing only: never synthesize recipient addresses.
        // A blank TO, CC, or BCC remains blank, even if older form data has an email.
        if (Array.isArray(config?.emailConfigs?.formRoutingRules)) {
          const recipients = recipientsForForm(formRoutingRules, mappedKey);
          adminRecipientEmail = recipients.to.join(', ');
          adminCcEmail = recipients.cc.join(', ');
          adminBccEmail = recipients.bcc.join(', ');
        } else {
          // Older installations may have explicit per-form recipient maps.
          // Never fall back to formsData.recipientEmail or a default SMTP_TO.
          adminRecipientEmail = String(config?.emailConfigs?.formRoutes?.[mappedKey] || '');
          adminCcEmail = String(config?.emailConfigs?.formCcRoutes?.[mappedKey] || '');
          adminBccEmail = String(config?.emailConfigs?.formBccRoutes?.[mappedKey] || '');
        }
      }
    } catch (configurationError) {
      console.error('[Email Dispatcher] Form routing settings could not be read:', configurationError);
    }

    const recipientChannels = dedupeRecipientChannels(adminRecipientEmail, adminCcEmail, adminBccEmail);
    if (![...recipientChannels.to, ...recipientChannels.cc, ...recipientChannels.bcc].length) {
      return { adminSent: false, userSent: false, error: 'No TO, CC or BCC recipients configured for this form; no admin email was sent.' };
    }
    adminRecipientEmail = recipientChannels.to.join(', ');
    adminCcEmail = recipientChannels.cc.join(', ');
    adminBccEmail = recipientChannels.bcc.join(', ');
    const logRecipients = [...recipientChannels.to, ...recipientChannels.cc, ...recipientChannels.bcc].join(', ').slice(0, 255);

    // Determine user email
    const userEmail =
      providedUserEmail ||
      submittedData.email ||
      submittedData.emailAddress ||
      submittedData.userEmail ||
      '';

    const isValidUserEmail = typeof userEmail === 'string' && /\S+@\S+\.\S+/.test(userEmail.trim());
    const userAlreadyReceivesAdminCopy = isValidUserEmail
      ? includesRecipient(recipientChannels, userEmail.trim())
      : false;

    // One master layout for every form. The form name and submission fields are
    // injected at send time; obsolete per-form templates are never selected.
    const sharedTemplate = getSharedEmailTemplateHtml(savedFormsConfig?.emailTemplateHtml);
    const adminHtml = renderSharedEmailTemplateHtml(sharedTemplate, formName, submittedData, false)!;
    const userHtml = isValidUserEmail
      ? renderSharedEmailTemplateHtml(sharedTemplate, formName, submittedData, true)!
      : '';

    // Auto-Selected Generic Subjects
    const adminSubject = resolveSubmissionSubject(subjectPattern, formName, submittedData);
    const userSubject = `We received your ${formName} submission | British Hajj Travel UK`;
    const emailAuditBase: FormEmailAudit = {
      formName,
      to: recipientChannels.to,
      cc: recipientChannels.cc,
      bcc: recipientChannels.bcc,
      subject: adminSubject,
      html: adminHtml,
      status: 'Pending',
    };

    // Persist the exact admin email body before SMTP is attempted. This guarantees
    // the Form Enquiries view retains what was prepared even if SMTP later fails.
    await persistAuditSnapshot(emailAuditBase);

    // 2. Check if SMTP Credentials exist
    if (!smtpConfig.configured || !fromEmail) {
      console.error('[Email Dispatcher] SMTP is not configured.');
      await writeBackendLog({severity:'error',category:'Email Delivery',source:'emailService',message:'SMTP is not configured. Check server-side mail settings.'});
      try {
        await db.insert(emailDeliveryLogs).values({
          formId: formName,
          status: 'Failed',
          sentTo: logRecipients,
          details: 'SMTP is not configured.',
        });
      } catch (logErr) {
        console.error('[Email Dispatcher] Failed to log missing SMTP configuration:', logErr);
      }

      const failedAudit: FormEmailAudit = { ...emailAuditBase, status: 'Failed' };
      await persistAuditSnapshot(failedAudit);
      return {
        adminSent: false,
        userSent: false,
        error: 'SMTP is not configured.',
        audit: failedAudit,
      };
    }

    // Dynamically import nodemailer server-side to prevent bundler errors in Client Components
    const nodemailer = await import('nodemailer');

    // 3. Setup Nodemailer Transporter with Connection Pooling & Fast Timeouts (Forced IPv4)
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpConfig.secure,
      family: 4,
      pool: true,
      maxConnections: 3,
      connectionTimeout: 8000,
      greetingTimeout: 6000,
      socketTimeout: 10000,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    } as any);

    // Prepare Email #1 (Admin) with optional CC and BCC
    const adminMailOptions: Record<string, any> = {
      from: { name: fromName, address: fromEmail },
      ...(isValidMailAddress(replyTo || userEmail) ? { replyTo: replyTo || userEmail.trim() } : {}),
      ...(recipientChannels.to.length ? { to: recipientChannels.to } : {}),
      subject: adminSubject,
      html: adminHtml,
      text: `A new inquiry was submitted via ${formName}.`,
    };
    if (adminCcEmail) {
      adminMailOptions.cc = recipientChannels.cc;
    }
    if (adminBccEmail) {
      adminMailOptions.bcc = recipientChannels.bcc;
    }
    const adminPromise = transporter.sendMail(adminMailOptions);

    // Prepare Email #2 (User, if email is valid)
    const userPromise = (isValidUserEmail && userHtml && !userAlreadyReceivesAdminCopy)
      ? transporter.sendMail({
        from: { name: fromName, address: fromEmail },
        ...(isValidMailAddress(replyTo) ? { replyTo } : {}),
        to: userEmail.trim(),
        subject: userSubject,
        html: userHtml,
        text: `Thank you for contacting British Hajj Travel UK. We have received your inquiry submitted via ${formName}.`,
      })
      : Promise.resolve(null);

    // Dispatch both emails in parallel simultaneously
    const [adminResult, userResult] = await Promise.allSettled([adminPromise, userPromise]);

    let adminSent = false;
    let userSent = false;

    if (adminResult.status === 'fulfilled') {
      adminSent = true;
      console.log(`✅ [Email Dispatcher] Admin notification sent to ${adminRecipientEmail}`);
      try {
        await db.insert(emailDeliveryLogs).values({
          formId: formName,
          status: 'Delivered',
          sentTo: logRecipients,
          details: 'Notification sent successfully via SMTP',
        });
      } catch (logErr) { console.error('Failed to log admin email success', logErr); }
    } else {
      console.error('[Email Dispatcher] Failed to send admin email:', adminResult.reason?.message || adminResult.reason);
      await writeBackendLog({severity:'error',category:'Email Delivery',source:'emailService',message:'Admin notification SMTP delivery failed.'});
      try {
        await db.insert(emailDeliveryLogs).values({
          formId: formName,
          status: 'Failed',
          sentTo: logRecipients,
          details: adminResult.reason?.message || 'SMTP Error',
        });
      } catch (logErr) { console.error('Failed to log admin email error', logErr); }
    }

    if (userResult.status === 'fulfilled' && userResult.value !== null) {
      userSent = true;
      console.log(`✅ [Email Dispatcher] User confirmation sent to ${userEmail}`);
      try {
        await db.insert(emailDeliveryLogs).values({
          formId: formName,
          status: 'Delivered',
          sentTo: userEmail.trim(),
          details: 'User confirmation sent successfully via SMTP',
        });
      } catch (logErr) { console.error('Failed to log user email success', logErr); }
    } else if (userResult.status === 'rejected') {
      console.error('[Email Dispatcher] Failed to send user confirmation:', userResult.reason?.message || userResult.reason);
      await writeBackendLog({severity:'warning',category:'Email Delivery',source:'emailService',message:'User confirmation SMTP delivery failed.'});
      try {
        await db.insert(emailDeliveryLogs).values({
          formId: formName,
          status: 'Failed',
          sentTo: userEmail.trim(),
          details: userResult.reason?.message || 'SMTP Error',
        });
      } catch (logErr) { console.error('Failed to log user email error', logErr); }
    } else {
      console.log(`ℹ️ [Email Dispatcher] No user email entered. User confirmation email skipped.`);
    }

    const finalAudit: FormEmailAudit = { ...emailAuditBase, status: adminSent ? 'Delivered' : 'Failed' };
    await persistAuditSnapshot(finalAudit);

    return {
      adminSent,
      userSent,
      error: !adminSent || (isValidUserEmail && !userAlreadyReceivesAdminCopy && !userSent)
        ? getEmailDeliveryError(adminResult, userResult)
        : undefined,
      audit: finalAudit,
    };
  } catch (err: any) {
    console.error('dispatchFormEmails error:', err);
    await writeBackendLog({severity:'error',category:'Email Delivery',source:'emailService',message:'Unexpected email dispatcher exception.'});
    try {
      const fallbackRecipient = submittedData.email || submittedData.emailAddress || submittedData.userEmail || 'unknown';
      await db.insert(emailDeliveryLogs).values({
        formId: formName,
        status: 'Failed',
        sentTo: String(fallbackRecipient),
        details: err?.message || 'Unexpected email dispatcher error',
      });
    } catch (logErr) {
      console.error('[Email Dispatcher] Failed to log dispatcher error:', logErr);
    }

    if (lastAudit) {
      const failedAudit: FormEmailAudit = { ...lastAudit, status: 'Failed' };
      await persistAuditSnapshot(failedAudit);
      return { adminSent: false, userSent: false, error: 'Email delivery was unsuccessful; the enquiry was saved.', audit: failedAudit };
    }

    return { adminSent: false, userSent: false, error: 'Email delivery was unsuccessful; the enquiry was saved.' };
  }
}


function getEmailDeliveryError(
  adminResult: PromiseSettledResult<unknown>,
  userResult: PromiseSettledResult<unknown>,
): string {
  const reasons = [adminResult, userResult]
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .map((result) => result.reason);

  const accountDisabled = reasons.some((reason) =>
    String(reason?.message || reason).toLowerCase().includes('outbound sending is disabled'),
  );

  if (accountDisabled) {
    return 'Email could not be sent because outbound SMTP sending is disabled for the configured mailbox. Contact the email provider to re-enable outbound sending.';
  }

  return 'Email delivery failed. Check the email delivery logs for details.';
}

function isValidMailAddress(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.trim());
}
