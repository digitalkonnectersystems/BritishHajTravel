'use server';

import { db } from '@/db';
import { visaServices } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';

const defaultVisaServicesSeed = [
  {
    title: 'Saudi Tourist eVisa',
    slug: 'saudi-tourist-evisa',
    shortDescription: '1-Year Multiple Entry Tourist eVisa for Canadian passport holders.',
    fullDescription: 'Authorized 1-year multiple entry Tourist eVisa allowing up to 90 days stay per visit. Valid for tourism and Umrah.',
    processingTime: '24-48 Hours',
    requirements: 'Canadian Passport (min 6 months validity), Digital Photo',
    imageUrl: '/img/saudi-visa-1.webp',
    isPublished: true,
    displayOrder: 1,
  },
  {
    title: 'Saudi Umrah Visa',
    slug: 'saudi-umrah-visa',
    shortDescription: 'Official Ministry of Hajj & Umrah authorized visa for pilgrimage.',
    fullDescription: 'Dedicated Ministry-approved Umrah Visa for performing sacred pilgrimage with complete ground service endorsement.',
    processingTime: '2-3 Business Days',
    requirements: 'Passport, Meningitis Vaccination Certificate, Passport Photo',
    imageUrl: '/img/saudi-visa-2.webp',
    isPublished: true,
    displayOrder: 2,
  },
  {
    title: 'Saudi Business / Commercial Visa',
    slug: 'saudi-business-visa',
    shortDescription: 'Commercial & Business invitation visa processing.',
    fullDescription: 'Express business visa processing with Ministry of Foreign Affairs invitation endorsement for corporate travel.',
    processingTime: '3-5 Business Days',
    requirements: 'Company Letter, Ministry Invitation, Passport',
    imageUrl: '/img/saudi-visa-3.webp',
    isPublished: true,
    displayOrder: 3,
  },
  {
    title: 'Saudi Family / Personal Visit Visa',
    slug: 'saudi-family-visit-visa',
    shortDescription: 'Family visit visa for visiting relatives residing in Saudi Arabia.',
    fullDescription: 'Official visit visa for family members of Saudi residents or citizens with extension options.',
    processingTime: '3-5 Business Days',
    requirements: 'Sponsor Invitation, Proof of Kinship, Passport',
    imageUrl: '/img/saudi-visa-1.webp',
    isPublished: true,
    displayOrder: 4,
  },
  {
    title: 'Saudi Transit / Stopover Visa',
    slug: 'saudi-transit-visa',
    shortDescription: '96-Hour Stopover Visa with complimentary 1-day stay.',
    fullDescription: 'Short transit visa for passengers flying with Saudia or Flynas with 96 hours stay in Saudi Arabia.',
    processingTime: 'Instant / 12 Hours',
    requirements: 'Confirmed Flight Ticket, Passport',
    imageUrl: '/img/saudi-visa-2.webp',
    isPublished: true,
    displayOrder: 5,
  },
  {
    title: 'Saudi Resident / Work Visa Assistance',
    slug: 'saudi-work-resident-visa',
    shortDescription: 'Work visa endorsement and embassy submission service.',
    fullDescription: 'Complete documentation verification, medical report submission, and embassy endorsement for Saudi work visas.',
    processingTime: '5-7 Business Days',
    requirements: 'Saudi Employment Contract, Enjaz Registration, Medical',
    imageUrl: '/img/saudi-visa-3.webp',
    isPublished: true,
    displayOrder: 6,
  },
];

export async function getVisaServicesList() {
  try {
    let list = await db.select().from(visaServices).orderBy(asc(visaServices.displayOrder));
    if (!list || list.length === 0) {
      for (const v of defaultVisaServicesSeed) {
        try {
          await db.insert(visaServices).values(v);
        } catch (e) {}
      }
      list = await db.select().from(visaServices).orderBy(asc(visaServices.displayOrder));
    }
    return list || [];
  } catch {
    return defaultVisaServicesSeed as any[];
  }
}

export async function getVisaServiceBySlug(slug: string) {
  try {
    const list = await db.select().from(visaServices).where(eq(visaServices.slug, slug)).limit(1);
    return list.length ? list[0] : null;
  } catch {
    return null;
  }
}

export async function createVisaService(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const title = formData.get('title') as string;
    const shortDescription = formData.get('shortDescription') as string || '';
    const fullDescription = formData.get('fullDescription') as string || '';
    const processingTime = (formData.get('processingTime') as string) || '3-5 Business Days';
    const requirements = formData.get('requirements') as string || '';

    if (!title) return { success: false, error: 'Title is required.' };

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    await db.insert(visaServices).values({
      title,
      slug,
      shortDescription,
      fullDescription,
      processingTime,
      requirements,
      imageUrl: '/img/saudi-visa-1.webp',
      isPublished: true,
    });

    // Log Activity
    await logAdminActivityAction({
      type: 'visas',
      action: 'Created Visa Service',
      details: `Created new Saudi visa category: "${title}" (${processingTime})`,
    });

    revalidatePath('/admin/visas');
    revalidatePath('/saudi-visa');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating visa service:', error);
    return { success: false, error: error.message || 'Failed to create visa service.' };
  }
}

export async function updateVisaServiceAction(
  id: number,
  data: {
    title: string;
    shortDescription?: string;
    fullDescription?: string;
    processingTime?: string;
    requirements?: string;
    isPublished?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.update(visaServices).set({
      title: data.title,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      processingTime: data.processingTime,
      requirements: data.requirements,
      isPublished: data.isPublished,
    }).where(eq(visaServices.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'visas',
      action: 'Updated Visa Service',
      details: `Updated visa service "${data.title}" (ID #${id})`,
    });

    revalidatePath('/admin/visas');
    revalidatePath('/saudi-visa');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating visa service:', error);
    return { success: false, error: error.message || 'Failed to update visa service.' };
  }
}

export async function deleteVisaServiceAction(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    let visaTitle = `ID #${id}`;
    try {
      const found = await db.select().from(visaServices).where(eq(visaServices.id, id)).limit(1);
      if (found && found.length > 0) {
        visaTitle = `"${found[0].title}"`;
      }
    } catch (e) {}

    await db.delete(visaServices).where(eq(visaServices.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'visas',
      action: 'Deleted Visa Service',
      details: `Removed Saudi visa category: ${visaTitle}`,
    });

    revalidatePath('/admin/visas');
    revalidatePath('/saudi-visa');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting visa service:', error);
    return { success: false, error: error.message || 'Failed to delete visa service.' };
  }
}
