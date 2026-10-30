'use server';
import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { sitePages, enquiries } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { dispatchFormEmails, type FormEmailAudit } from '@/lib/emailService';
import type { FormEmailTemplatePair } from '@/lib/formEmailTemplates';
import { recordPublicEnquiry } from '@/lib/publicEnquiryAudit';
import { findBuilderNode } from '@/lib/customSectionSettings';

const VALID_KEY = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;
const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitPageBuilderFormAction(input: {
  pageId: number; sectionId: string; blockId: string;
  fields: Record<string, string>; honeypot?: string;
}): Promise<{ success: boolean; error?: string; reference?: string; emailWarning?: string }> {
  try {
    if (input.honeypot) return { success: true }; // bot trap, no CRM write
    if (!Number.isSafeInteger(input.pageId) || input.pageId <= 0 || !input.sectionId || !input.blockId) {
      return { success: false, error: 'Invalid form reference.' };
    }
    const row = await db.select({ sections: sitePages.sections, slug: sitePages.slug, status: sitePages.status })
      .from(sitePages).where(eq(sitePages.id, input.pageId)).limit(1);
    const page = row[0];
    if (!page || page.status !== 'published') return { success: false, error: 'The form is unavailable.' };
    let sections: any[] = [];
    try { sections = JSON.parse(page.sections || '[]'); } catch { return { success: false, error: 'Form configuration is invalid.' }; }
    const section = sections.find(s => s?.id === input.sectionId && s?.type === 'Custom Layout Builder' && !s.hidden && s.visible !== false);
    const candidate = findBuilderNode(section?.data?.blocks, input.blockId);
    const block = candidate?.type === 'form' ? candidate : undefined;
    if (!block) return { success: false, error: 'This form is no longer active.' };
    const definitions = Array.isArray(block.fields) ? block.fields.slice(0, 20) : [];
    if (!definitions.length || !definitions.some((f: any) => f.key === 'email')) return { success: false, error: 'Form requires an email field.' };
    const incoming = input.fields && typeof input.fields === 'object' ? input.fields : {};
    const clean: Record<string, string> = {};
    for (const field of definitions) {
      if (!VALID_KEY.test(String(field.key || ''))) return { success: false, error: 'Invalid form field configuration.' };
      const value = String(incoming[field.key] ?? '').trim();
      if (value.length > 2000) return { success: false, error: 'A field exceeds the allowed length.' };
      if (field.required && !value) return { success: false, error: `${field.label || field.key} is required.` };
      if (field.type === 'email' && value && !MAIL_RE.test(value)) return { success: false, error: 'Please enter a valid email.' };
      clean[field.key] = value;
    }
    if (!MAIL_RE.test(clean.email || '') || (clean.fullName || '').trim().length < 2) {
      return { success: false, error: 'Full name and valid email are required.' };
    }
    const reference = `PB-${randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`;
    const formName = String(block.title || 'Custom Website Form').slice(0, 160);
    const labelled = Object.fromEntries(definitions.map((f: any) => [String(f.label || f.key), clean[f.key] || '']));
    const content = JSON.stringify({ source: page.slug, sectionId: input.sectionId, form: formName, fields: labelled });
    if (content.length > 12000) return { success: false, error: 'The form response is too long.' };
    await db.insert(enquiries).values({
      enquiryNumber: reference,
      type: 'general_contact',
      fullName: clean.fullName,
      email: clean.email,
      phone: (clean.phone || '').slice(0, 50),
      sourceForm: `Page Builder: ${formName}`.slice(0, 255),
      message: content,
      status: 'new',
    });
    await recordPublicEnquiry(`Page Builder: ${formName}`, reference);
    const submittedData: Record<string, string> = {
      ...clean,
      ...Object.fromEntries(definitions.map((f: any) => [String(f.label || f.key), clean[f.key] || ''])),
      enquiryNumber: reference,
      fullName: clean.fullName, email: clean.email, phone: clean.phone || '',
      message: content,
    };
    const emailTemplates: FormEmailTemplatePair | undefined = block.emailTemplates;
    const result = await dispatchFormEmails(formName, submittedData, clean.email,
      async (audit: FormEmailAudit) => {
        await db.update(enquiries).set({
          emailTo: audit.to.join(', '), emailCc: audit.cc.join(', '), emailBcc: audit.bcc.join(', '),
          emailSubject: audit.subject, emailHtml: audit.html, emailDeliveryStatus: audit.status,
        }).where(eq(enquiries.enquiryNumber, reference));
      }, emailTemplates);
    revalidatePath('/admin/enquiries');
    return { success: true, reference, emailWarning: result.error };
  } catch (error) {
    console.error('[Page Builder Form] Submission failed:', error);
    return { success: false, error: 'Unable to save your enquiry. Please try again.' };
  }
}
