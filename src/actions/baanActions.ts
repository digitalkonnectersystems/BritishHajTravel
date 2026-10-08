'use server';
import { db } from '@/db';
import { siteSettings, enquiries } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentSession } from '@/lib/auth';
import { dispatchFormEmails } from '@/lib/emailService';
import { defaultBaanContent, type BaanContent } from '@/lib/baanContent';

export async function getBaanContent(): Promise<BaanContent> {
  const record = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, 'baan_holding_page')).limit(1);
  if (!record[0]?.value) return defaultBaanContent;
  try { return { ...defaultBaanContent, ...JSON.parse(record[0].value) }; }
  catch { return defaultBaanContent; }
}
export async function saveBaanContent(payload: BaanContent) {
  if (!await getCurrentSession()) return { success: false, error: 'Unauthorized' };
  const value = JSON.stringify({ ...defaultBaanContent, ...payload });
  if (value.length > 60000) return { success: false, error: 'Page configuration is too large. Upload images to Media Center and save their URLs.' };
  await db.insert(siteSettings).values({ key: 'baan_holding_page', value }).onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
  revalidatePath('/baan-holding-hajj');
  return { success: true };
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
