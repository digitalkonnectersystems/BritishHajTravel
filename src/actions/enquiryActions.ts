'use server';

import { requireAdmin } from '@/lib/requireAdmin';
import { randomUUID } from 'node:crypto';
import { writeBackendLog, databaseErrorCode } from '@/lib/backendLogger';
import { recordPublicEnquiry } from '@/lib/publicEnquiryAudit';
import { isValidUkPhone } from '@/lib/ukPhone';

import { db } from '@/db';
import { enquiries, quoteEnquiries, packageBookingEnquiries, contactEnquiries, visaEnquiries, flightEnquiries } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { dispatchFormEmails, type FormEmailAudit } from '@/lib/emailService';
import { logAdminActivityAction } from '@/actions/activityActions';

const validEmail = (email: unknown) => typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const validName = (name: unknown) => typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 255;
const countOk = (count: unknown, min=0) => typeof count === 'number' && Number.isSafeInteger(count) && count >= min && count <= 99;
const enquiryReference = (prefix: string) => `${prefix}-${randomUUID().replace(/-/g,'').slice(0,20).toUpperCase()}`;
async function recordSubmissionFailure(source:string, error:unknown) {
 await writeBackendLog({severity:'error',category:'Form Submissions',source,message:`Database submission failed (${databaseErrorCode(error)})`});
}


async function saveEnquiryEmailAudit(enquiryNumber: string, audit?: FormEmailAudit) {
  if (!audit) return;
  try {
    await db.update(enquiries).set({
      sourceForm: audit.formName,
      emailTo: audit.to.join(', '),
      emailCc: audit.cc.join(', '),
      emailBcc: audit.bcc.join(', '),
      emailSubject: audit.subject,
      emailHtml: audit.html,
      emailDeliveryStatus: audit.status,
      updatedAt: new Date(),
    }).where(eq(enquiries.enquiryNumber, enquiryNumber));
  } catch (error) {
    console.error('Failed to save enquiry email audit snapshot:', error);
  }
}

async function dispatchAndStoreEnquiryEmail(
  enquiryNumber: string,
  formName: string,
  submittedData: Record<string, any>,
) {
  return dispatchFormEmails(
    formName,
    submittedData,
    undefined,
    (audit) => saveEnquiryEmailAudit(enquiryNumber, audit),
  );
}

export async function submitQuoteEnquiryAction(data: {
  fullName: string;
  phone: string;
  email: string;
  packageType?: string;
  numberOfPilgrims?: number;
  message?: string;
  sourceFormName?: string;
}) {
  try {
    const { fullName, phone, email, packageType = 'Umrah Package', numberOfPilgrims = 1, message = '', sourceFormName } = data;

    if (!isValidUkPhone(phone)) return {success: false, error: 'Phone must use +44 followed by exactly 10 digits.'};
    if (!validName(fullName) || !validEmail(email) || !phone) {
      return { success: false, error: 'Full Name, Email, and Phone number are required.' };
    }

    if (!countOk(numberOfPilgrims,1) || (message||'').length > 5000) return {success:false,error:'Check the number of pilgrims and message length.'};
    const enquiryNumber = enquiryReference('QT');

    // 1. Insert into dedicated quote_enquiries table. Keep the dedicated
    // and unified records aligned so the admin CRUD operates on the same enquiry.
    await db.transaction(async (tx) => {
    await tx.insert(quoteEnquiries).values({
      enquiryNumber,
      fullName,
      phone,
      email,
      packageType,
      numberOfPilgrims,
      status: 'new',
    });

    // 2. Aggregate in unified enquiries table
    await tx.insert(enquiries).values({
      enquiryNumber,
      type: 'quote_request',
      fullName,
      email,
      phone,
      preferredPackageType: packageType,
      adults: numberOfPilgrims,
      message,
      status: 'new',
    });
    });

    await recordPublicEnquiry('Get a Free Quote',enquiryNumber);

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchAndStoreEnquiryEmail(enquiryNumber, 
      sourceFormName || 'Get a Free Quote Form',
      {
        enquiryNumber,
        fullName,
        email,
        phone,
        packageType,
        numberOfPilgrims,
        message,
      }
    );

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return {
      success: true,
      enquiryNumber,
      emailWarning: emailResult.error,
      message: 'Thank you! Your quote request has been submitted. Our specialist will contact you shortly.',
    };
  } catch (error: any) {
    console.error('Error submitting quote enquiry:', error);
    await recordSubmissionFailure('quote',error);
    return { success: false, error: 'Failed to submit quote request. Please try again.' };
  }
}

export async function submitPackageBookingEnquiryAction(data: {
  packageId?: number;
  packageName?: string;
  packageType?: string;
  fullName: string;
  phone: string;
  email: string;
  adults?: number;
  children?: number;
  infants?: number;
  startDate?: string;
  totalPrice?: string;
  message?: string;
  sourceFormName?: string;
}) {
  try {
    const {
      packageId,
      packageName = 'Umrah 2026 Package',
      packageType = '',
      fullName,
      phone,
      email,
      adults = 1,
      children = 0,
      infants = 0,
      startDate = '',
      totalPrice = '',
      message = '',
      sourceFormName,
    } = data;

    if (!isValidUkPhone(phone)) return {success: false, error: 'Phone must use +44 followed by exactly 10 digits.'};
    if (!validName(fullName) || !validEmail(email) || !phone) {
      return { success: false, error: 'Full Name, Email, and Phone number are required.' };
    }

    if (!countOk(adults,1) || !countOk(children) || !countOk(infants) || infants > adults || (message||'').length > 5000) return {success:false,error:'Check traveller counts or message length.'};
    const bookingNumber = enquiryReference('BK');

    // 1. Insert into dedicated package_booking_enquiries table.
    await db.transaction(async (tx) => {
    await tx.insert(packageBookingEnquiries).values({
      bookingNumber,
      packageId,
      packageName,
      fullName,
      phone,
      email,
      adults,
      children,
      infants,
      startDate,
      totalPrice,
      status: 'new',
    });

    // 2. Aggregate in unified enquiries table
    await tx.insert(enquiries).values({
      enquiryNumber: bookingNumber,
      type: 'package_enquiry',
      fullName,
      email,
      phone,
      packageId,
      preferredPackageType: packageType ? `${packageName} (${packageType})` : packageName,
      adults,
      children,
      infants,
      departureMonth: startDate,
      status: 'new',
      message,
    });
    });

    await recordPublicEnquiry('Package Booking',bookingNumber);

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchAndStoreEnquiryEmail(bookingNumber, 
      sourceFormName || 'Package Detail Page Booking Form',
      {
        bookingNumber,
        packageName,
        fullName,
        email,
        phone,
        adults,
        children,
        infants,
        startDate,
        totalPrice,
        packageType: packageType || undefined,
        message,
      }
    );

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return {
      success: true,
      bookingNumber,
      emailWarning: emailResult.error,
      message: 'Your package booking request has been sent successfully!',
    };
  } catch (error: any) {
    console.error('Error submitting package booking enquiry:', error);
    await recordSubmissionFailure('package-booking',error);
    return { success: false, error: 'Failed to submit package booking. Please try again.' };
  }
}

export async function submitContactEnquiryAction(data: {
  fullName: string;
  email: string;
  phone: string;
  website?: string;
  packageType?: string;
  message: string;
  sourceFormName?: string;
}) {
  try {
    const { fullName, email, phone, website = '', packageType = '', message, sourceFormName } = data;

    if (!validName(fullName) || !validEmail(email)) {
      return { success: false, error: 'Full Name and Email are required.' };
    }

    if (phone && phone !== '+44' && !isValidUkPhone(phone)) return {success:false,error:'Phone must use +44 followed by exactly 10 digits.'};

    if ((message||'').length > 5000) return {success:false,error:'Message must be 5000 characters or fewer.'};
    const ticketNumber = enquiryReference('TKT');

    // 1. Insert into dedicated contact_enquiries table.
    await db.transaction(async (tx) => {
    await tx.insert(contactEnquiries).values({
      ticketNumber,
      fullName,
      email,
      phone: phone || 'N/A',
      website,
      packageType,
      message,
      status: 'new',
    });

    // 2. Aggregate in unified enquiries table
    await tx.insert(enquiries).values({
      enquiryNumber: ticketNumber,
      type: 'general_contact',
      fullName,
      email,
      phone: phone || 'N/A',
      preferredPackageType: packageType || 'General Contact',
      message,
      status: 'new',
    });
    });

    await recordPublicEnquiry('Contact Form',ticketNumber);

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchAndStoreEnquiryEmail(ticketNumber, sourceFormName || 'Contact Us Form', {
      ticketNumber,
      fullName,
      email,
      phone,
      packageType,
      website,
      message,
    });

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return {
      success: true,
      ticketNumber,
      emailWarning: emailResult.error,
      message: 'Thank you!.',
    };
  } catch (error: any) {
    console.error('Error submitting contact enquiry:', error);
    await recordSubmissionFailure('contact',error);
    return { success: false, error: 'Failed to send message. Please try again.' };
  }
}

export async function submitVisaEnquiryAction(data: {
  visaServiceId?: number;
  visaTitle?: string;
  fullName: string;
  email: string;
  phone: string;
  travelersCount?: number;
  nationality?: string;
  travelDate?: string;
  message?: string;
  sourceFormName?: string;
}) {
  try {
    const {
      visaServiceId,
      visaTitle = 'Saudi Tourist eVisa',
      fullName,
      email,
      phone,
      travelersCount = 1,
      nationality = 'British',
      travelDate = '',
      message = '',
      sourceFormName,
    } = data;

    if (!isValidUkPhone(phone)) return {success: false, error: 'Phone must use +44 followed by exactly 10 digits.'};
    if (!validName(fullName) || !validEmail(email) || !phone) {
      return { success: false, error: 'Full Name, Email, and Phone are required.' };
    }

    if (!countOk(travelersCount,1) || (message||'').length > 5000) return {success:false,error:'Check traveller count or message length.'};
    const enquiryNumber = enquiryReference('VSA');

    await db.transaction(async (tx) => {
    await tx.insert(visaEnquiries).values({
      enquiryNumber,
      visaServiceId,
      visaTitle,
      fullName,
      email,
      phone,
      travelersCount,
      nationality,
      message,
      status: 'new',
    });

    await tx.insert(enquiries).values({
      enquiryNumber,
      type: 'visa_enquiry',
      fullName,
      email,
      phone,
      visaServiceId,
      preferredPackageType: visaTitle,
      adults: travelersCount,
      message,
      status: 'new',
    });
    });

    await recordPublicEnquiry('Visa Enquiry',enquiryNumber);

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchAndStoreEnquiryEmail(enquiryNumber, sourceFormName || 'Visa Consultation Form', {
      enquiryNumber,
      visaTitle,
      fullName,
      email,
      phone,
      travelersCount,
      nationality,
      travelDate,
      message,
    });

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return { success: true, enquiryNumber, emailWarning: emailResult.error, message: 'Visa consultation request received!' };
  } catch (error: any) {
    console.error('Error submitting visa enquiry:', error);
    await recordSubmissionFailure('visa',error);
    return { success: false, error: 'Failed to submit visa enquiry.' };
  }
}

export async function submitQuoteRequest(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const packageType = (formData.get('packageType') as string) || 'Umrah Package';
  const numberOfPilgrims = parseInt((formData.get('adults') as string) || (formData.get('numberOfPilgrims') as string) || '1', 10);
  const message = (formData.get('message') as string) || '';

  return await submitQuoteEnquiryAction({ fullName, email, phone, packageType, numberOfPilgrims, message });
}

export async function submitPackageEnquiry(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const packageName = (formData.get('packageName') as string) || 'Package Enquiry';
  const message = (formData.get('message') as string) || '';

  return await submitPackageBookingEnquiryAction({ fullName, email, phone, packageName, message, sourceFormName: 'Package Inquiry Form' });
}

export async function getEnquiriesList() {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  } catch (error) {
    console.error('Failed to load unified enquiry records:', error);
    throw new Error('Unable to load CRM enquiries. Verify that all required database columns have been migrated.');
  }
}

export async function getQuoteEnquiriesList() {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    return await db.select().from(quoteEnquiries).orderBy(desc(quoteEnquiries.createdAt));
  } catch {
    return [];
  }
}

export async function getPackageBookingEnquiriesList() {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    return await db.select().from(packageBookingEnquiries).orderBy(desc(packageBookingEnquiries.createdAt));
  } catch {
    return [];
  }
}

export async function getContactEnquiriesList() {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    return await db.select().from(contactEnquiries).orderBy(desc(contactEnquiries.createdAt));
  } catch {
    return [];
  }
}

export async function submitFlightInquiry(data: {
  fullName: string;
  email: string;
  phone: string;
  originCity?: string;
  destinationCity?: string;
  departureDate?: string;
  returnDate?: string;
  tripType?: string;
  passengers?: number;
  flightClass?: string;
  message?: string;
  sourceFormName?: string;
}) {
  try {
    const {
      fullName,
      email,
      phone,
      originCity = 'London (LHR)',
      destinationCity = 'Jeddah (JED)',
      departureDate = '',
      returnDate = '',
      tripType = 'Round Trip',
      passengers = 1,
      flightClass = 'Economy',
      message = '',
      sourceFormName,
    } = data;

    if (!isValidUkPhone(phone)) return {success: false, error: 'Phone must use +44 followed by exactly 10 digits.'};
    if (!validName(fullName) || !validEmail(email) || !phone) {
      return { success: false, error: 'Full Name, Email, and Phone are required.' };
    }

    if (!countOk(passengers,1) || (message||'').length > 5000) return {success:false,error:'Check passenger count or message length.'};
    const enquiryNumber = enquiryReference('FLT');

    await db.transaction(async (tx) => {
    await tx.insert(flightEnquiries).values({
      enquiryNumber,
      fullName,
      email,
      phone,
      originCity,
      destinationCity,
      departureDate,
      returnDate,
      tripType,
      passengers,
      flightClass,
      message,
      status: 'new',
    });

    await tx.insert(enquiries).values({
      enquiryNumber,
      type: 'flight_enquiry',
      fullName,
      email,
      phone,
      preferredPackageType: `Flight: ${originCity} to ${destinationCity}`,
      adults: passengers,
      departureMonth: departureDate,
      message,
      status: 'new',
    });
    });

    await recordPublicEnquiry('Flight Enquiry',enquiryNumber);

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchAndStoreEnquiryEmail(enquiryNumber, sourceFormName || 'Flight Booking Form', {
      enquiryNumber,
      fullName,
      email,
      phone,
      originCity,
      destinationCity,
      departureDate,
      returnDate,
      tripType,
      passengers,
      flightClass,
      message,
    });

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return { success: true, enquiryNumber, emailWarning: emailResult.error, message: 'Flight booking request received!' };
  } catch (error: any) {
    console.error('Error submitting flight enquiry:', error);
    await recordSubmissionFailure('flight',error);
    return { success: false, error: 'Failed to submit flight enquiry.' };
  }
}

export async function getFlightEnquiriesList() {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    return await db.select().from(flightEnquiries).orderBy(desc(flightEnquiries.createdAt));
  } catch {
    return [];
  }
}

export async function getVisaEnquiriesList() {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    return await db.select().from(visaEnquiries).orderBy(desc(visaEnquiries.createdAt));
  } catch {
    return [];
  }
}

type EnquiryRow = typeof enquiries.$inferSelect;

async function syncDedicatedEnquiryStatus(row: EnquiryRow, status: string): Promise<void> {
  const updatedAt = new Date();
  switch (row.type) {
    case 'quote_request':
      await db.update(quoteEnquiries).set({ status, updatedAt }).where(eq(quoteEnquiries.enquiryNumber, row.enquiryNumber));
      break;
    case 'package_enquiry':
      await db.update(packageBookingEnquiries).set({ status, updatedAt }).where(eq(packageBookingEnquiries.bookingNumber, row.enquiryNumber));
      break;
    case 'general_contact':
      await db.update(contactEnquiries).set({ status, updatedAt }).where(eq(contactEnquiries.ticketNumber, row.enquiryNumber));
      break;
    case 'visa_enquiry':
      await db.update(visaEnquiries).set({ status, updatedAt }).where(eq(visaEnquiries.enquiryNumber, row.enquiryNumber));
      break;
    case 'flight_enquiry':
      await db.update(flightEnquiries).set({ status, updatedAt }).where(eq(flightEnquiries.enquiryNumber, row.enquiryNumber));
      break;
  }
}

async function deleteDedicatedEnquiry(row: EnquiryRow): Promise<void> {
  switch (row.type) {
    case 'quote_request':
      await db.delete(quoteEnquiries).where(eq(quoteEnquiries.enquiryNumber, row.enquiryNumber));
      break;
    case 'package_enquiry':
      await db.delete(packageBookingEnquiries).where(eq(packageBookingEnquiries.bookingNumber, row.enquiryNumber));
      break;
    case 'general_contact':
      await db.delete(contactEnquiries).where(eq(contactEnquiries.ticketNumber, row.enquiryNumber));
      break;
    case 'visa_enquiry':
      await db.delete(visaEnquiries).where(eq(visaEnquiries.enquiryNumber, row.enquiryNumber));
      break;
    case 'flight_enquiry':
      await db.delete(flightEnquiries).where(eq(flightEnquiries.enquiryNumber, row.enquiryNumber));
      break;
  }
}

export async function updateEnquiryStatus(enquiryId: number, status: any, internalNotes?: string): Promise<void> {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    const found = await db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).limit(1);
    const row = found[0];
    if (!row) throw new Error(`Enquiry ${enquiryId} was not found.`);

    const previousEntry = { status: row.status, internalNotes: row.internalNotes };
    await syncDedicatedEnquiryStatus(row, String(status));
    await db
      .update(enquiries)
      .set({
        status,
        internalNotes: internalNotes === undefined ? row.internalNotes : internalNotes,
        updatedAt: new Date(),
      })
      .where(eq(enquiries.id, enquiryId));

    await logAdminActivityAction({
      type: 'enquiries',
      action: 'Updated Enquiry Status',
      details: `Enquiry ${row.enquiryNumber} (${row.fullName}) status changed to "${status}"`,
      previousEntry,
      newEntry: { status, internalNotes: internalNotes === undefined ? row.internalNotes : internalNotes },
    });

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    throw error;
  }
}

export async function deleteEnquiryAction(id: number): Promise<{ success: boolean; error?: string }> {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    const found = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
    const row = found[0];
    if (!row) return { success: false, error: 'Enquiry not found.' };

    await deleteDedicatedEnquiry(row);
    await db.delete(enquiries).where(eq(enquiries.id, id));

    await logAdminActivityAction({
      type: 'enquiries',
      action: 'Deleted Form Enquiry',
      details: `Removed enquiry ${row.enquiryNumber} (${row.fullName})`,
      previousEntry: row,
    });

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting enquiry:', error);
    return { success: false, error: error.message || 'Failed to delete enquiry.' };
  }
}

export async function markEnquiriesReadAction(ids: number[]): Promise<{ success: boolean; error?: string }> {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    if (!ids || ids.length === 0) return { success: true };
    const rows = await db.select().from(enquiries).where(inArray(enquiries.id, ids));
    await Promise.all(rows.map((row) => syncDedicatedEnquiryStatus(row, 'contacted')));
    await db.update(enquiries).set({ status: 'contacted', updatedAt: new Date() }).where(inArray(enquiries.id, ids));

    await logAdminActivityAction({
      type: 'enquiries',
      action: 'Marked Enquiries Contacted',
      details: `Marked ${rows.length} form enquiry records as contacted`,
      previousEntry: rows.map((row) => ({ id: row.id, enquiryNumber: row.enquiryNumber, status: row.status })),
      newEntry: rows.map((row) => ({ id: row.id, enquiryNumber: row.enquiryNumber, status: 'contacted' })),
    });

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error marking enquiries read:', error);
    return { success: false, error: error.message || 'Failed to mark as read.' };
  }
}

export async function deleteEnquiriesBulkAction(ids: number[]): Promise<{ success: boolean; error?: string }> {
  await requireAdmin(['admin', 'enquiry_manager']);

  try {
    if (!ids || ids.length === 0) return { success: true };
    const rows = await db.select().from(enquiries).where(inArray(enquiries.id, ids));
    await Promise.all(rows.map(deleteDedicatedEnquiry));
    await db.delete(enquiries).where(inArray(enquiries.id, ids));

    await logAdminActivityAction({
      type: 'enquiries',
      action: 'Deleted Enquiries in Bulk',
      details: `Permanently removed ${rows.length} form enquiry records`,
      previousEntry: rows,
    });

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting enquiries:', error);
    return { success: false, error: error.message || 'Failed to delete enquiries.' };
  }
}
