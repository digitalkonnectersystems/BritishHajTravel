'use server';

import { requireAdmin } from '@/lib/requireAdmin';

import { db } from '@/db';
import { destinations } from '@/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { revalidatePath, updateTag } from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';

function parseJsonObject(value: unknown): Record<string, any> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch { return null; }
  }
  return null;
}

function parseJson(value: unknown, fallback: any[] = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export async function getDestinations(includeDrafts = false) {
  if (includeDrafts) await requireAdmin();

  try {
    const query = db.select().from(destinations);
    const rows = await (includeDrafts ? query : query.where(eq(destinations.status, 'published')))
      .orderBy(asc(destinations.displayOrder), asc(destinations.title));
    return rows.map((row) => ({
      ...row,
      bannerImages: parseJson(row.bannerImages),
      packageIds: parseJson(row.packageIds).map(Number).filter(Boolean),
      packagesData: parseJson(row.packagesData, []),
      packageData: parseJsonObject(row.packageData) || (parseJson(row.packagesData, [])[0] || null),
    }));
  } catch (error) {
    console.error('getDestinations DB error:', error);
    return [];
  }
}

export async function getDestinationBySlug(slug: string) {
  try {
    const rows = await db.select().from(destinations).where(
      and(eq(destinations.slug, slug), eq(destinations.status, 'published'))
    ).limit(1);
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row,
      bannerImages: parseJson(row.bannerImages),
      packageIds: parseJson(row.packageIds).map(Number).filter(Boolean),
      packagesData: parseJson(row.packagesData, []),
      packageData: parseJsonObject(row.packageData) || (parseJson(row.packagesData, [])[0] || null),
    };
  } catch (error) {
    console.error('getDestinationBySlug DB error:', error);
    return null;
  }
}

export async function saveDestinationAction(data: {
  id?: number;
  title: string;
  slug: string;
  description?: string;
  sectionTitle?: string;
  bannerImages?: string[];
  packageIds?: number[];
  packagesData?: any[];
  packageData?: any;
  status?: 'published' | 'draft';
  displayOrder?: number;
}) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const title = String(data?.title || '').trim();
    const slug = String(data?.slug || '').toLowerCase().trim().replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    if (!title || !slug) return { success: false, error: 'Title and slug are required.' };
    if (title.length > 255 || slug.length > 128) return { success: false, error: 'Title or slug is too long.' };
    if (data.status && data.status !== 'published' && data.status !== 'draft') return { success: false, error: 'Invalid publication status.' };

    const packageIds = (data.packageIds || [])
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);
    const bannerImages = (data.bannerImages || [])
      .map((image) => String(image || '').trim())
      .filter(Boolean);
    const submittedPackagesData = Array.isArray(data.packagesData) ? data.packagesData : null;
    const packageData = parseJsonObject(data.packageData) || parseJsonObject(submittedPackagesData?.[0]);
    if (!packageData) return { success: false, error: 'Destination package details are required.' };
    const displayOrder = Number(data.displayOrder ?? 0);
    if (!Number.isInteger(displayOrder) || displayOrder < 0) return { success: false, error: 'Invalid display order.' };
    if (data.sectionTitle && String(data.sectionTitle).length > 255) return { success: false, error: 'Package section title is too long.' };

    const previousEntry = data.id
      ? (await db.select().from(destinations).where(eq(destinations.id, data.id)).limit(1))[0] || null
      : null;
    if (data.id && !previousEntry) return { success: false, error: 'Destination not found. Refresh the page.' };

    // Do not erase historical packages_data when the single-package editor omits it.
    const packagesData = submittedPackagesData ?? parseJson(previousEntry?.packagesData, []);

    const values = {
      title,
      slug,
      description: data.description || '',
      sectionTitle: data.sectionTitle || 'Packages for this destination',
      bannerImages,
      packageIds,
      packagesData,
      packageData,
      status: data.status || 'published',
      displayOrder,
      updatedAt: new Date(),
    } as any;

    let savedId = data.id;
    if (data.id) {
      await db.update(destinations).set(values).where(eq(destinations.id, data.id));
    } else {
      const result: any = await db.insert(destinations).values(values);
      savedId = Number(result?.[0]?.insertId || result?.insertId || 0) || undefined;
    }

    const newEntry = savedId
      ? (await db.select().from(destinations).where(eq(destinations.id, savedId)).limit(1))[0] || values
      : values;

    await logAdminActivityAction({
      type: 'destinations',
      action: data.id ? 'Updated Destination' : 'Created Destination',
      details: `${data.id ? 'Updated' : 'Created'} destination "${title}"`,
      previousEntry,
      newEntry,
    });
    revalidatePath('/destinations');
    revalidatePath(`/destinations/${slug}`);
    if (previousEntry?.slug && previousEntry.slug !== slug) revalidatePath(`/destinations/${previousEntry.slug}`);
    revalidatePath('/admin/destinations');
    revalidatePath('/', 'layout');
    updateTag('nav-items');
    return { success: true };
  } catch (error: any) {
    console.error('saveDestinationAction error:', error);
    const message = String(error?.message || '');
    if (message.includes('Duplicate entry') && message.includes('slug')) {
      return { success: false, error: 'That destination slug is already in use. Choose a different slug.' };
    }
    if (message.includes("doesn't exist") && message.includes('destinations')) {
      return { success: false, error: 'The destinations table is missing. Run the database migration before saving destinations.' };
    }
    return { success: false, error: message || 'Failed to save destination.' };
  }
}

export async function updateDestinationStatusAction(id: number, status: 'published' | 'draft') {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    if (status !== 'published' && status !== 'draft') return { success: false, error: 'Invalid publication status.' };
    const previousEntry = (await db.select().from(destinations).where(eq(destinations.id, id)).limit(1))[0];
    if (!previousEntry) return { success: false, error: 'Destination not found.' };

    await db.update(destinations).set({ status, updatedAt: new Date() }).where(eq(destinations.id, id));
    const updatedDestination = { ...previousEntry, status, updatedAt: new Date() };
    await logAdminActivityAction({
      type: 'destinations',
      action: status === 'published' ? 'Published Destination' : 'Unpublished Destination',
      details: `${status === 'published' ? 'Published' : 'Unpublished'} destination "${previousEntry.title}"`,
      previousEntry,
      newEntry: updatedDestination,
    });
    revalidatePath('/destinations');
    revalidatePath(`/destinations/${previousEntry.slug}`);
    revalidatePath('/admin/destinations');
    revalidatePath('/', 'layout');
    updateTag('nav-items');
    return { success: true };
  } catch (error) {
    console.error('updateDestinationStatusAction failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update destination visibility.' };
  }
}

export async function duplicateDestinationAction(id: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const source = (await db.select().from(destinations).where(eq(destinations.id, id)).limit(1))[0];
    if (!source) return { success: false, error: 'Destination not found.' };

    const baseSlug = (source.slug || source.title).toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'destination';
    let slug = `${baseSlug}-copy`;
    let suffix = 2;
    while ((await db.select({ id: destinations.id }).from(destinations).where(eq(destinations.slug, slug)).limit(1)).length > 0) {
      const ending = `-copy-${suffix++}`;
      slug = `${baseSlug.slice(0, 128 - ending.length)}${ending}`;
    }

    const copySuffix = ' (Copy)';
    const title = `${source.title.slice(0, 255 - copySuffix.length)}${copySuffix}`;
    const content = { ...source };
    delete (content as { id?: number }).id;
    // A destination duplicate is a separate package; give its embedded card a
    // distinct identity so duplicate React keys do not survive future edits.
    const originalPackage = parseJsonObject(source.packageData);
    if (originalPackage) {
      content.packageData = {
        ...originalPackage,
        id: `destination-package-copy-${id}-${Date.now()}`,
        title: originalPackage.title === source.title ? title : originalPackage.title,
      };
    }
    const inserted = await db.insert(destinations).values({
      ...content,
      title,
      slug,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).$returningId();
    const duplicate = inserted[0]?.id
      ? (await db.select().from(destinations).where(eq(destinations.id, inserted[0].id)).limit(1))[0]
      : null;

    await logAdminActivityAction({
      type: 'destinations',
      action: 'Duplicated Destination',
      details: `Duplicated destination "${source.title}" as "${title}"`,
      previousEntry: source,
      newEntry: duplicate,
    });
    revalidatePath('/destinations');
    revalidatePath(`/destinations/${slug}`);
    revalidatePath('/admin/destinations');
    revalidatePath('/', 'layout');
    updateTag('nav-items');
    return { success: true, destination: duplicate };
  } catch (error) {
    console.error('duplicateDestinationAction failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to duplicate destination.' };
  }
}

export async function deleteDestinationAction(id: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const previousEntry = (await db.select().from(destinations).where(eq(destinations.id, id)).limit(1))[0] || null;
    if (!previousEntry) return { success: false, error: 'Destination not found.' };
    await db.delete(destinations).where(eq(destinations.id, id));
    await logAdminActivityAction({
      type: 'destinations',
      action: 'Deleted Destination',
      details: `Deleted destination ${previousEntry?.title || `#${id}`}`,
      previousEntry,
      newEntry: null,
    });
    revalidatePath('/destinations');
    revalidatePath(`/destinations/${previousEntry.slug}`);
    revalidatePath('/admin/destinations');
    revalidatePath('/', 'layout');
    updateTag('nav-items');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete destination.' };
  }
}

export async function updateDestinationOrderAction(orderedIds: number[]) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    await Promise.all(orderedIds.map((id, index) => db.update(destinations).set({ displayOrder: index, updatedAt: new Date() }).where(eq(destinations.id, id))));
    await logAdminActivityAction({type:'destinations',action:'Reordered Destinations',details:`Reordered ${orderedIds.length} destinations`,newEntry:{ids:orderedIds.slice(0,100)}});
    revalidatePath('/destinations');
    revalidatePath('/', 'layout');
    updateTag('nav-items');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update destination order.' };
  }
}
/** Read sold-out destination cards from the existing JSON package_data field. */
export async function getSoldOutDestinationPackages() {
  const items = await getDestinations(false);
  return items.flatMap((destination: any) => {
    const pkg = destination.packageData || destination.packagesData?.[0];
    if (!pkg || pkg.status !== 'sold_out') return [];
    return [{ ...pkg, id: `destination:${destination.id}`, title: pkg.title || destination.title,
      type: 'destinations', status: 'sold_out', slug: destination.slug,
      currency: pkg.currency || '£', featuredImage: pkg.featuredImage || pkg.cardData?.bannerImage || '',
    }];
  });
}
