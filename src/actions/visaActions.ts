'use server';

import { requireAdmin } from '@/lib/requireAdmin';

import { db } from '@/db';
import { visaServices } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';

const defaultVisaServicesSeed = [
  {
    title: 'Saudi Tourist eVisa',
    slug: 'saudi-tourist-evisa',
    shortDescription: '1-Year Multiple Entry Tourist eVisa for British passport holders.',
    fullDescription: 'Authorized 1-year multiple entry Tourist eVisa allowing up to 90 days stay per visit. Valid for tourism and Umrah.',
    processingTime: '24-48 Hours',
    requirements: 'British Passport (min 6 months validity), Digital Photo',
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
    return (list || []).filter((visa) => visa.isPublished);
  } catch {
    return defaultVisaServicesSeed.filter((visa) => visa.isPublished) as any[];
  }
}

export async function getVisaAdminServicesList() {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);
  return db.select().from(visaServices).orderBy(asc(visaServices.displayOrder));
}

export async function getVisaServiceBySlug(slug: string) {
  try {
    const list = await db.select().from(visaServices).where(and(
      eq(visaServices.slug, slug),
      eq(visaServices.isPublished, true)
    )).limit(1);
    return list.length ? list[0] : null;
  } catch {
    return null;
  }
}

function slugifyVisaTitle(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function createVisaService(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

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
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const beforeRows = await db.select().from(visaServices).where(eq(visaServices.id, id)).limit(1);
    const previousEntry = beforeRows[0] || null;

    await db.update(visaServices).set({
      title: data.title,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      processingTime: data.processingTime,
      requirements: data.requirements,
      isPublished: data.isPublished,
    }).where(eq(visaServices.id, id));

    const afterRows = await db.select().from(visaServices).where(eq(visaServices.id, id)).limit(1);
    await logAdminActivityAction({
      type: 'visas',
      action: 'Updated Visa Service',
      details: `Updated visa service "${data.title}" (ID #${id})`,
      previousEntry,
      newEntry: afterRows[0] || null,
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
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

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

export async function toggleVisaPublicationAction(id: number, isPublished: boolean) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const previousEntry = (await db.select().from(visaServices).where(eq(visaServices.id, id)).limit(1))[0];
    if (!previousEntry) return { success: false, error: 'Visa service not found.' };

    await db.update(visaServices).set({ isPublished }).where(eq(visaServices.id, id));
    const updatedVisa = { ...previousEntry, isPublished };
    await logAdminActivityAction({
      type: 'visas',
      action: isPublished ? 'Published Visa Service' : 'Unpublished Visa Service',
      details: `${isPublished ? 'Published' : 'Unpublished'} visa service "${previousEntry.title}"`,
      previousEntry,
      newEntry: updatedVisa,
    });

    revalidatePath('/admin/visas');
    revalidatePath('/saudi-visa');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating visa visibility:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update visa visibility.' };
  }
}

export async function duplicateVisaServiceAction(id: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const source = (await db.select().from(visaServices).where(eq(visaServices.id, id)).limit(1))[0];
    if (!source) return { success: false, error: 'Visa service not found.' };

    const copySuffix = ' (Copy)';
    const title = `${source.title.slice(0, 255 - copySuffix.length)}${copySuffix}`;
    const baseSlug = (slugifyVisaTitle(source.slug || source.title) || 'visa').slice(0, 120);
    let slug = `${baseSlug}-copy`;
    let suffix = 2;
    while ((await db.select({ id: visaServices.id }).from(visaServices).where(eq(visaServices.slug, slug)).limit(1)).length > 0) {
      const ending = `-copy-${suffix++}`;
      slug = `${baseSlug.slice(0, 128 - ending.length)}${ending}`;
    }

    const content = { ...source };
    delete (content as { id?: number }).id;
    const inserted = await db.insert(visaServices).values({
      ...content,
      title,
      slug,
      isPublished: false,
      createdAt: new Date(),
    }).$returningId();
    const duplicate = inserted[0]?.id
      ? (await db.select().from(visaServices).where(eq(visaServices.id, inserted[0].id)).limit(1))[0]
      : null;

    await logAdminActivityAction({
      type: 'visas',
      action: 'Duplicated Visa Service',
      details: `Duplicated visa service "${source.title}" as "${title}"`,
      previousEntry: source,
      newEntry: duplicate,
    });
    revalidatePath('/admin/visas');
    revalidatePath('/saudi-visa');
    revalidatePath('/');
    return { success: true, visa: duplicate };
  } catch (error) {
    console.error('Error duplicating visa service:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to duplicate visa service.' };
  }
}
