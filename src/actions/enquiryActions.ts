'use server';

import { db } from '@/db';
import { enquiries, quoteEnquiries, packageBookingEnquiries, contactEnquiries, visaEnquiries, flightEnquiries } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { dispatchFormEmails } from '@/lib/emailService';
import { logAdminActivityAction } from '@/actions/activityActions';

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

    if (!fullName || !email || !phone) {
      return { success: false, error: 'Full Name, Email, and Phone number are required.' };
    }

    const enquiryNumber = `QT-${Date.now().toString().slice(-6)}`;

    // 1. Insert into dedicated quote_enquiries table. Keep the dedicated
    // and unified records aligned so the admin CRUD operates on the same enquiry.
    await db.insert(quoteEnquiries).values({
      enquiryNumber,
      fullName,
      phone,
      email,
      packageType,
      numberOfPilgrims,
      status: 'new',
    });

    // 2. Aggregate in unified enquiries table
    await db.insert(enquiries).values({
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

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchFormEmails(
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

    if (!fullName || !email || !phone) {
      return { success: false, error: 'Full Name, Email, and Phone number are required.' };
    }

    const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;

    // 1. Insert into dedicated package_booking_enquiries table.
    await db.insert(packageBookingEnquiries).values({
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
    await db.insert(enquiries).values({
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

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchFormEmails(
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

    if (!fullName || !email) {
      return { success: false, error: 'Full Name and Email are required.' };
    }

    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

    // 1. Insert into dedicated contact_enquiries table.
    await db.insert(contactEnquiries).values({
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
    await db.insert(enquiries).values({
      enquiryNumber: ticketNumber,
      type: 'general_contact',
      fullName,
      email,
      phone: phone || 'N/A',
      preferredPackageType: packageType || 'General Contact',
      message,
      status: 'new',
    });

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchFormEmails(sourceFormName || 'Contact Us Form', {
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
      message = '',
      sourceFormName,
    } = data;

    if (!fullName || !email || !phone) {
      return { success: false, error: 'Full Name, Email, and Phone are required.' };
    }

    const enquiryNumber = `VSA-${Date.now().toString().slice(-6)}`;

    await db.insert(visaEnquiries).values({
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

    await db.insert(enquiries).values({
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

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchFormEmails(sourceFormName || 'Visa Consultation Form', {
      enquiryNumber,
      visaTitle,
      fullName,
      email,
      phone,
      travelersCount,
      nationality,
      message,
    });

    revalidatePath('/admin/enquiries');
    revalidatePath('/admin/dashboard');
    return { success: true, enquiryNumber, emailWarning: emailResult.error, message: 'Visa consultation request received!' };
  } catch (error: any) {
    console.error('Error submitting visa enquiry:', error);
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
  try {
    return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  } catch {
    return [];
  }
}

export async function getQuoteEnquiriesList() {
  try {
    return await db.select().from(quoteEnquiries).orderBy(desc(quoteEnquiries.createdAt));
  } catch {
    return [];
  }
}

export async function getPackageBookingEnquiriesList() {
  try {
    return await db.select().from(packageBookingEnquiries).orderBy(desc(packageBookingEnquiries.createdAt));
  } catch {
    return [];
  }
}

export async function getContactEnquiriesList() {
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
      originCity = 'Toronto (YYZ)',
      destinationCity = 'Jeddah (JED)',
      departureDate = '',
      returnDate = '',
      tripType = 'Round Trip',
      passengers = 1,
      flightClass = 'Economy',
      message = '',
      sourceFormName,
    } = data;

    if (!fullName || !email || !phone) {
      return { success: false, error: 'Full Name, Email, and Phone are required.' };
    }

    const enquiryNumber = `FLT-${Date.now().toString().slice(-6)}`;

    await db.insert(flightEnquiries).values({
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

    await db.insert(enquiries).values({
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

    // Dispatch Dual Emails (Admin Notification + User Confirmation)
    const emailResult = await dispatchFormEmails(sourceFormName || 'Flight Booking Form', {
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
    return { success: false, error: 'Failed to submit flight enquiry.' };
  }
}

export async function getFlightEnquiriesList() {
  try {
    return await db.select().from(flightEnquiries).orderBy(desc(flightEnquiries.createdAt));
  } catch {
    return [];
  }
}

export async function getVisaEnquiriesList() {
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
