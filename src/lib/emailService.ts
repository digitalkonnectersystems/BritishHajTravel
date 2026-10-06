import { db } from '@/db';
import { siteSettings, emailDeliveryLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getResponsiveEmailTemplateHtml, formatFieldLabel } from './emailTemplate';
import { dedupeRecipientChannels, includesRecipient } from './emailRecipients';

export { getResponsiveEmailTemplateHtml, formatFieldLabel };

/**
 * Server-only Form Submission Dual Email Dispatcher
 * Sends Email #1 to Admin + Email #2 to User (if user email provided)
 */
export async function dispatchFormEmails(
  formName: string,
  submittedData: Record<string, any>,
  providedUserEmail?: string
): Promise<{ adminSent: boolean; userSent: boolean; error?: string }> {
  try {
    // 1. Fetch saved email settings from DB or defaults
    let adminRecipientEmail = process.env.SMTP_TO || 'saudivisa@britishhajjtravel.com';
    let adminCcEmail = '';
    let adminBccEmail = '';
    let smtpHost = process.env.SMTP_HOST || '';
    let smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    let smtpUser = process.env.SMTP_USER || '';
    let smtpPass = process.env.SMTP_PASS || '';
    const authenticatedSender = (process.env.SMTP_USER || '').trim().toLowerCase();
    let fromEmail = (process.env.SMTP_FROM || authenticatedSender || 'no-reply@digitalkonnecter.com').trim();
    let savedFormsConfig: any = null;

    try {
      const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'forms_settings')).limit(1);
      if (res && res.length > 0) {
        const config = JSON.parse(res[0].value);
        savedFormsConfig = config;
        if (config?.emailConfigs?.sendToEmail) {
          adminRecipientEmail = config.emailConfigs.sendToEmail;
        }
        if (config?.emailConfigs?.fromEmail) {
          const configuredFromEmail = String(config.emailConfigs.fromEmail).trim();
          if (
            !authenticatedSender ||
            configuredFromEmail.toLowerCase() === authenticatedSender
          ) {
            fromEmail = configuredFromEmail;
          } else {
            console.warn(
              `[Email Dispatcher] Ignoring stored From address ${configuredFromEmail}; it does not match the authenticated SMTP user.`
            );
          }
        }

        // Form-specific recipient routing — new formRoutingRules (multi-form per rule)
        const formRoutingRules: Array<{ id: string; forms: string[]; sendTo: string; cc: string; bcc?: string }> =
          config?.emailConfigs?.formRoutingRules || [];

        const formKeyMap: Record<string, string> = {
          'Get a Free Quote Form': 'quoteForm',
          'Homepage Hero Banner — Get a Free Quote Form': 'quoteForm',
          'Package Detail Page Booking Form': 'packageDetailForm',
          'Package Detail Booking Form': 'packageDetailForm',
          'Umrah Package Detail Page — Booking Form': 'packageDetailForm',
          'Umrah Package Booking — Popup Modal Form': 'packageDetailForm',
          'Umrah Package Booking Form (Detail Page & Popup Modal)': 'packageDetailForm',
          'Hajj Package Detail Page — Booking Form': 'hajjPackageDetailForm',
          'Hajj Package Booking — Popup Modal Form': 'hajjPackageDetailForm',
          'Hajj Package Booking Form (Detail Page & Popup Modal)': 'hajjPackageDetailForm',
          'Hajj Page — Customize Your Hajj Package Form': 'hajjCustomizeForm',
          'Contact Us Form': 'contact',
          'Contact Page — Enquiry Form': 'contact',
          'Package Inquiry Form': 'packageInquiry',
          'Pilgrimage Package — Custom Inquiry Form': 'packageInquiry',
          'Visa Consultation Form': 'visaConsultation',
          'Visa Services — Consultation Form': 'visaConsultation',
          'Umrah Visa Order Form': 'umrahVisaOrder',
          'Flight Booking Form': 'flightInquiry',
          'Flights Page — Booking Inquiry Form': 'flightInquiry',
          'Drop Us A Message Form': 'dropUsMessage',
          'Drop Us A Message': 'dropUsMessage',
          'General — Drop Us A Message Form': 'dropUsMessage',
          'Blog Detail Page — Sidebar Booking Form': 'blogSidebarForm',
        };
        const mappedKey = formKeyMap[formName] || formName;

        // Find rule that includes this form key
        const matchedRule = formRoutingRules.find(r => r.forms.includes(mappedKey));
        if (matchedRule) {
          if (matchedRule.sendTo?.trim()) adminRecipientEmail = matchedRule.sendTo.trim();
          if (matchedRule.cc?.trim()) adminCcEmail = matchedRule.cc.trim();
          if (matchedRule.bcc?.trim()) adminBccEmail = matchedRule.bcc.trim();
        } else {
          // Fallback: legacy formRoutes / formCcRoutes
          const formRoutes = config?.emailConfigs?.formRoutes || {};
          const formCcRoutes = config?.emailConfigs?.formCcRoutes || {};
          const formBccRoutes = config?.emailConfigs?.formBccRoutes || {};
          if (formRoutes[mappedKey]?.trim()) {
            adminRecipientEmail = formRoutes[mappedKey].trim();
          } else if (config?.formsData?.[mappedKey]?.recipientEmail) {
            adminRecipientEmail = config.formsData[mappedKey].recipientEmail.trim();
          }
          if (formCcRoutes[mappedKey]?.trim()) {
            adminCcEmail = formCcRoutes[mappedKey].trim();
          }
          if (formBccRoutes[mappedKey]?.trim()) {
            adminBccEmail = formBccRoutes[mappedKey].trim();
          }
        }
      }
    } catch {
      // Fallback to defaults
    }

    const recipientChannels = dedupeRecipientChannels(adminRecipientEmail, adminCcEmail, adminBccEmail);
    if (recipientChannels.to.length === 0) {
      return { adminSent: false, userSent: false, error: 'No valid admin recipient email is configured.' };
    }
    adminRecipientEmail = recipientChannels.to.join(', ');
    adminCcEmail = recipientChannels.cc.join(', ');
    adminBccEmail = recipientChannels.bcc.join(', ');

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

    // Build Admin & User Email HTML. A custom per-form template is used only when
    // it contains supported live-data tokens, preventing sample preview data from
    // ever being sent to a real customer.
    const mappedTemplateKey = resolveEmailTemplateKey(formName, submittedData);
    const configuredTemplate = savedFormsConfig?.emailTemplates?.[mappedTemplateKey];
    const adminHtml = renderConfiguredTemplate(configuredTemplate, formName, submittedData, false)
      || getResponsiveEmailTemplateHtml(formName, submittedData, false);
    const userHtml = isValidUserEmail
      ? (renderConfiguredTemplate(configuredTemplate, formName, submittedData, true) || getResponsiveEmailTemplateHtml(formName, submittedData, true))
      : '';

    // Auto-Selected Generic Subjects
    const adminSubject = `[British Hajj Travel UK] ${formName}`;
    const userSubject = `Thank you for Contacting British Hajj Travel UK — ${formName} Received`;

    // 2. Check if SMTP Credentials exist
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error(
        `[Email Dispatcher] SMTP is not configured.`
      );
      try {
        await db.insert(emailDeliveryLogs).values({
          formId: formName,
          status: 'Failed',
          sentTo: adminRecipientEmail,
          details: 'SMTP is not configured.',
        });
      } catch (logErr) {
        console.error('[Email Dispatcher] Failed to log missing SMTP configuration:', logErr);
      }

      return {
        adminSent: false,
        userSent: false,
        error: 'SMTP is not configured.',
      };
    }

    // Dynamically import nodemailer server-side to prevent bundler errors in Client Components
    const nodemailer = await import('nodemailer');

    // 3. Setup Nodemailer Transporter with Connection Pooling & Fast Timeouts (Forced IPv4)
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
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
      from: `"${formName} - British Hajj Travel" <${fromEmail}>`,
      to: adminRecipientEmail,
      subject: adminSubject,
      html: adminHtml,
      text: `A new inquiry was submitted via ${formName}.`,
    };
    if (adminCcEmail) {
      adminMailOptions.cc = adminCcEmail;
    }
    if (adminBccEmail) {
      adminMailOptions.bcc = adminBccEmail;
    }
    const adminPromise = transporter.sendMail(adminMailOptions);

    // Prepare Email #2 (User, if email is valid)
    const userPromise = (isValidUserEmail && userHtml && !userAlreadyReceivesAdminCopy)
      ? transporter.sendMail({
        from: `"British Hajj Travel UK" <${fromEmail}>`,
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
          sentTo: adminRecipientEmail,
          details: 'Notification sent successfully via SMTP',
        });
      } catch (logErr) { console.error('Failed to log admin email success', logErr); }
    } else {
      console.error(`❌ [Email Dispatcher] Failed to send Admin email:`, adminResult.reason?.message || adminResult.reason);
      try {
        await db.insert(emailDeliveryLogs).values({
          formId: formName,
          status: 'Failed',
          sentTo: adminRecipientEmail,
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
      console.error(`❌ [Email Dispatcher] Failed to send User email to ${userEmail}:`, userResult.reason?.message || userResult.reason);
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

    return {
      adminSent,
      userSent,
      error: !adminSent || (isValidUserEmail && !userAlreadyReceivesAdminCopy && !userSent)
        ? getEmailDeliveryError(adminResult, userResult)
        : undefined,
    };
  } catch (err: any) {
    console.error('dispatchFormEmails error:', err);
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

    return { adminSent: false, userSent: false, error: err.message };
  }
}


function resolveEmailTemplateKey(formName: string, submittedData: Record<string, any>): string {
  const value = String(formName || '').toLowerCase();
  const packageContext = `${submittedData.packageName || ''} ${submittedData.packageType || ''} ${submittedData.visaTitle || ''}`.toLowerCase();
  if (value.includes('blog')) return 'Blog Detail Page';
  if (value.includes('flight')) return 'Flights Booking Inquiry Form';
  if (value.includes('umrah visa')) return 'Umrah Visa Order Form';
  if (value.includes('visa')) return 'Visa Consultation Form';
  if (value.includes('hajj') && value.includes('custom')) return 'Hajj Customize Form';
  if (value.includes('package') && value.includes('inquiry')) return 'Package Inquiry Form';
  if (value.includes('package') && (value.includes('detail') || value.includes('booking'))) {
    return packageContext.includes('hajj') ? 'Hajj Package Booking Form' : 'Umrah Package Booking Form';
  }
  if (value.includes('drop us')) return 'Drop Us A Message Form';
  if (value.includes('contact')) return 'Contact Inquiry Form';
  if (value.includes('quote')) return packageContext.includes('hajj') ? 'Hajj Customize Form' : 'Get a Free Quote Form';
  return formName;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderConfiguredTemplate(template: unknown, formName: string, submittedData: Record<string, any>, isUserEmail: boolean): string | null {
  if (typeof template !== 'string' || !template.trim()) return null;
  const supportedTokens = ['{{FORM_NAME}}', '{{SUBMISSION_ROWS}}', '{{SUBMISSION_DATE}}', '{{SUBMITTER_NAME}}', '{{EMAIL_AUDIENCE}}'];
  if (!supportedTokens.some((token) => template.includes(token))) return null;

  const rows = Object.entries(submittedData)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `<tr><td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:700;vertical-align:top">${escapeHtml(formatFieldLabel(key))}</td><td style="padding:8px 12px;border:1px solid #e2e8f0">${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}</td></tr>`)
    .join('');

  const submitterName = submittedData.fullName || submittedData.name || submittedData.customerName || 'Customer';
  return template
    .replaceAll('{{FORM_NAME}}', escapeHtml(formName))
    .replaceAll('{{SUBMISSION_ROWS}}', rows)
    .replaceAll('{{SUBMISSION_DATE}}', escapeHtml(new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })))
    .replaceAll('{{SUBMITTER_NAME}}', escapeHtml(submitterName))
    .replaceAll('{{EMAIL_AUDIENCE}}', isUserEmail ? 'Customer Confirmation' : 'Admin Notification');
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
