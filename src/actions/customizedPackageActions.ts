'use server';

import { randomUUID } from 'node:crypto';
import { db } from '@/db';
import { customizedPackageEnquiries, customizedEnquiryFeatures, enquiries } from '@/db/schema';
import { isValidUkPhone } from '@/lib/ukPhone';
import { requireAdmin } from '@/lib/requireAdmin';
import { desc, eq, isNull, and, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { writeBackendLog } from '@/actions/backendLogActions';

export type CustomizedEnquiryInput = {
  category: 'hajj' | 'umrah'; fullName: string; email: string; phone: string;
  departureAirport: string; departureDate?: string; numberOfDays: number;
  adults: number; children: number; infants: number; airlinePreference?: string;
  makkahHotel?: string; madinahHotel?: string; hotelStandard?: string;
  roomOccupancy?: string; transportation?: string; budgetGbp?: string;
  notes?: string; services: string[]; requirements: string[];
};

const bounded = (input: unknown, length: number) => String(input ?? '').trim().slice(0, length);
const qty = (input: unknown, min: number, max: number) =>
  Number.isInteger(input) && Number(input) >= min && Number(input) <= max;

export async function submitCustomizedPackageAction(raw: CustomizedEnquiryInput) {
  if (!raw || (raw.category !== 'hajj' && raw.category !== 'umrah')) return { success: false, error: 'Invalid pilgrimage category.' };
  const fullName = bounded(raw.fullName, 255);
  const email = bounded(raw.email, 254).toLowerCase();
  const departureAirport = bounded(raw.departureAirport, 160);
  if (fullName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !isValidUkPhone(raw.phone)) {
    return { success: false, error: 'Enter a valid name, email and UK phone (+44 followed by 10 digits).' };
  }
  if (!departureAirport || !qty(raw.numberOfDays, 1, 90) || !qty(raw.adults, 1, 99) ||
    !qty(raw.children, 0, 99) || !qty(raw.infants, 0, 99) || raw.infants > raw.adults) {
    return { success: false, error: 'Check the departure airport, journey duration and passenger counts.' };
  }
  const date = raw.departureDate ? new Date(`${raw.departureDate}T12:00:00Z`) : null;
  if (date && (Number.isNaN(date.getTime()) || date.getTime() < Date.now() - 86400000)) {
    return { success: false, error: 'Select a future departure date.' };
  }
  const budget = bounded(raw.budgetGbp, 30);
  if (budget && (!/^\d{1,10}(\.\d{1,2})?$/.test(budget) || Number(budget) <= 0)) {
    return { success: false, error: 'Enter a valid GBP budget.' };
  }
  const services = Array.isArray(raw.services) ? raw.services : [];
  const requirements = Array.isArray(raw.requirements) ? raw.requirements : [];
  if (services.length > 20 || requirements.length > 20 ||
    [...services, ...requirements].some(v => typeof v !== 'string' || v.length > 140)) {
    return { success: false, error: 'Invalid service or requirement selection.' };
  }
  const enquiryNumber = `CUS-${randomUUID().slice(0, 12).toUpperCase()}`;
  try {
    await db.transaction(async tx => {
      const inserted = await tx.insert(customizedPackageEnquiries).values({
        enquiryNumber, category: raw.category, fullName, email, phone: raw.phone,
        departureAirport, departureDate: date || undefined, numberOfDays: raw.numberOfDays,
        adults: raw.adults, children: raw.children, infants: raw.infants,
        airlinePreference: bounded(raw.airlinePreference, 255), makkahHotel: bounded(raw.makkahHotel, 255),
        madinahHotel: bounded(raw.madinahHotel, 255), hotelStandard: bounded(raw.hotelStandard, 70),
        roomOccupancy: bounded(raw.roomOccupancy, 70), transportation: bounded(raw.transportation, 120),
        budgetGbp: budget || null, notes: bounded(raw.notes, 4000),
      });
      const id = inserted[0].insertId;
      const features = [
        ...services.map(featureName => ({ enquiryId: id, featureType: 'service' as const, featureName })),
        ...requirements.map(featureName => ({ enquiryId: id, featureType: 'requirement' as const, featureName })),
      ];
      if (features.length) await tx.insert(customizedEnquiryFeatures).values(features);
      // Keep the existing /admin/enquiries screen synchronized with the normalized detail table.
      await tx.insert(enquiries).values({
        enquiryNumber, type: 'package_enquiry', fullName, email, phone: raw.phone,
        preferredPackageType: `${raw.category.toUpperCase()} Customized`, adults: raw.adults,
        children: raw.children, infants: raw.infants, sourceForm: `Customized ${raw.category.toUpperCase()} Package`,
        message: `Reference: ${enquiryNumber}. View full preferences in Customized Enquiries.`, status: 'new',
      });
    });
    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/customized-enquiries');
    revalidatePath('/admin/dashboard');
    return { success: true, enquiryNumber };
  } catch (err) {
    console.error('[Customized Enquiries] Save failed:', err);
    await writeBackendLog({severity:'error',category:'Database',message:'Customized enquiry insert failed',source:'customizedPackageActions'});
    return { success: false, error: 'We could not save your enquiry. Please try again.' };
  }
}

export async function getCustomizedEnquiriesAction() {
  await requireAdmin(['admin', 'enquiry_manager']);
  const rows = await db.select().from(customizedPackageEnquiries)
    .where(isNull(customizedPackageEnquiries.deletedAt))
    .orderBy(desc(customizedPackageEnquiries.createdAt)).limit(500);
  const features = rows.length ? await db.select().from(customizedEnquiryFeatures)
    .where(inArray(customizedEnquiryFeatures.enquiryId, rows.map(row => row.id))) : [];
  return rows.map(row => ({...row, features: features.filter(feature=>feature.enquiryId === row.id && !feature.deletedAt)}));
}

export async function updateCustomizedEnquiryStatusAction(id: number, status: 'new' | 'contacted' | 'qualified' | 'closed' | 'spam') {
  await requireAdmin(['admin', 'enquiry_manager']);
  if (!Number.isSafeInteger(id) || id < 1 || !(['new','contacted','qualified','closed','spam'] as string[]).includes(status))
    throw new Error('Invalid enquiry update');
  const row = await db.select({enquiryNumber:customizedPackageEnquiries.enquiryNumber}).from(customizedPackageEnquiries)
    .where(and(eq(customizedPackageEnquiries.id,id), isNull(customizedPackageEnquiries.deletedAt))).limit(1);
  if (!row.length) throw new Error('Enquiry not found');
  await db.transaction(async tx => {
    await tx.update(customizedPackageEnquiries).set({status, updatedAt:new Date()}).where(eq(customizedPackageEnquiries.id,id));
    await tx.update(enquiries).set({status, updatedAt:new Date()}).where(eq(enquiries.enquiryNumber,row[0].enquiryNumber));
  });
  revalidatePath('/admin/enquiries');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/customized-enquiries');
  return {success: true};
}

export async function deleteCustomizedEnquiryAction(id:number) {
  await requireAdmin(['admin', 'enquiry_manager']);
  if (!Number.isSafeInteger(id) || id<1) throw new Error('Invalid enquiry');
  const row=await db.select({enquiryNumber:customizedPackageEnquiries.enquiryNumber}).from(customizedPackageEnquiries)
    .where(and(eq(customizedPackageEnquiries.id,id),isNull(customizedPackageEnquiries.deletedAt))).limit(1);
  if (!row.length) return {success:false,error:'Enquiry not found.'};
  await db.transaction(async tx=>{
    await tx.update(customizedPackageEnquiries).set({deletedAt:new Date(),status:'closed'}).where(eq(customizedPackageEnquiries.id,id));
    await tx.update(enquiries).set({status:'closed',updatedAt:new Date()}).where(eq(enquiries.enquiryNumber,row[0].enquiryNumber));
  });
  revalidatePath('/admin/customized-enquiries');
  revalidatePath('/admin/enquiries');
  revalidatePath('/admin/dashboard');
  return {success:true};
}
