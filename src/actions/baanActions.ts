'use server';
import { db } from '@/db';
import { siteSettings, enquiries } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentSession } from '@/lib/auth';
import { dispatchFormEmails } from '@/lib/emailService';
import { defaultBaanContent, type BaanContent } from '@/lib/baanContent';

type ReadResult = { content: BaanContent; databaseAvailable: boolean };

/** Only log diagnostic information to the server, never expose DB errors to site visitors. */
function logBaanDatabaseError(operation: string, error: unknown): void {
  const outer = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  const nested = outer.cause && typeof outer.cause === 'object'
    ? outer.cause as Record<string, unknown>
    : outer;
  console.error(`[BAAN] ${operation} database error`, {
    code: nested.code ?? outer.code ?? 'unknown',
    errno: nested.errno ?? outer.errno ?? 'unknown',
    sqlState: nested.sqlState ?? outer.sqlState ?? 'unknown',
    message: nested.message ?? outer.message ?? String(error),
  });
}

async function readBaanContent(): Promise<ReadResult> {
  let record: { value: string }[];
  try {
    record = await db.select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, 'baan_holding_page'))
      .limit(1);
  } catch (error) {
    logBaanDatabaseError('read site_settings.baan_holding_page', error);
    return { content: defaultBaanContent, databaseAvailable: false };
  }

  // No saved custom settings is normal. The default BAAN page remains usable.
  if (!record[0]?.value) return { content: defaultBaanContent, databaseAvailable: true };

  try {
    const parsed: unknown = JSON.parse(record[0].value);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('BAAN page setting is not a JSON object');
    }
    return {
      content: { ...defaultBaanContent, ...(parsed as Partial<BaanContent>) },
      databaseAvailable: true,
    };
  } catch (error) {
    // A malformed setting must not be silently overwritten by the editor.
    console.error('[BAAN] Invalid JSON in site_settings.baan_holding_page', error);
    return { content: defaultBaanContent, databaseAvailable: false };
  }
}

/** Public page can render its built-in content when the database is temporarily unavailable. */
export async function getBaanContent(): Promise<BaanContent> {
  return (await readBaanContent()).content;
}

/** Prevent an administrator from unknowingly overwriting settings after a failed read. */
export async function getBaanContentForAdmin(): Promise<BaanContent | null> {
  const result = await readBaanContent();
  return result.databaseAvailable ? result.content : null;
}

export async function saveBaanContent(payload: BaanContent) {
  const session = await getCurrentSession();
  if (!session || !['super_admin', 'admin', 'content_editor', 'seo_manager'].includes(session.role)) {
    return { success: false, error: 'Unauthorized' };
  }
  const value = JSON.stringify({ ...defaultBaanContent, ...payload });
  if (value.length > 60000) return { success: false, error: 'Page configuration is too large. Upload images to Media Center and save their URLs.' };
  try {
    await db.insert(siteSettings)
      .values({ key: 'baan_holding_page', value })
      .onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
    revalidatePath('/baan-holding-hajj');
    return { success: true };
  } catch (error) {
    logBaanDatabaseError('save site_settings.baan_holding_page', error);
    return { success: false, error: 'Unable to save BAAN settings because the database is unavailable. Please retry after checking the database connection.' };
  }
}

export async function submitBaanInterest(data: {
  name: string; email: string; phone: string; postcode: string; airport: string;
  packageTier: string; passengers: number; days: string; room: string; budget: string;
}) {
  const clean = Object.fromEntries(Object.entries(data).map(([k,v]) => [k, typeof v === 'string' ? v.trim() : v])) as typeof data;
  if (!clean.name || !clean.email || !clean.phone || !clean.postcode || !clean.airport || !clean.packageTier || !clean.days || !clean.room || !clean.budget ||
      !/^\S+@\S+\.\S+$/.test(clean.email) || clean.name.length > 255 || clean.phone.length > 50 || !Number.isInteger(clean.passengers) || clean.passengers < 1 || clean.passengers > 100) {
    return { success: false, error: 'Please complete all required fields with valid details.' };
  }
  const enquiryNumber = `BH-${crypto.randomUUID()}`;
  const fields = { postcode: clean.postcode, airport: clean.airport, packageTier: clean.packageTier, passengers: clean.passengers, days: clean.days, room: clean.room, budget: clean.budget };
  const message = Object.entries(fields).map(([key, value]) => `${key}: ${value}`).join('\n');
  try {
    await db.insert(enquiries).values({ enquiryNumber, type: 'quote_request', fullName: clean.name, email: clean.email, phone: clean.phone,
      preferredPackageType: 'BAAN Holding Hajj 2027', adults: clean.passengers, message, sourceForm: 'BAAN Holding Hajj Interest Form', status: 'new' });
    const mail = await dispatchFormEmails('BAAN Holding Hajj Interest Form', { enquiryNumber, fullName: clean.name, email: clean.email, phone: clean.phone, ...fields }, undefined,
      async (audit) => { await db.update(enquiries).set({ emailTo: audit.to.join(', '), emailCc: audit.cc.join(', '), emailBcc: audit.bcc.join(', '), emailSubject: audit.subject, emailHtml: audit.html, emailDeliveryStatus: audit.status }).where(eq(enquiries.enquiryNumber, enquiryNumber)); });
    revalidatePath('/admin/enquiries');
    return { success: true, emailWarning: mail.error };
  } catch (error) { console.error('BAAN enquiry failed', error); return { success: false, error: 'Could not save enquiry. Please try again.' }; }
}
