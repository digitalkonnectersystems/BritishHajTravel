'use server';

import { db } from '@/db';
import { packages, packagePrices, packageHotels } from '@/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';
import { parseLegacyTravelMonth } from '@/lib/packageHelpers';

/**
 * Fetch every non-draft package of a given type ('umrah' | 'hajj'), newest first.
 * Used by public-facing sections that should automatically show every package an
 * admin creates, without needing a separate manual "add to section" step.
 */
function sortPackagesByOrderedList(pkgList: any[], orderIds: number[]): any[] {
  if (!orderIds || orderIds.length === 0 || !pkgList || pkgList.length === 0) return pkgList;
  const orderMap = new Map(orderIds.map((id, index) => [id, index]));
  return [...pkgList].sort((a, b) => {
    const orderA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 9999;
    const orderB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 9999;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}

async function getStoredPackageOrderIds(): Promise<number[]> {
  try {
    const { siteSettings } = await import('@/db/schema');
    const orderSetting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ordered_packages')).limit(1);
    if (orderSetting && orderSetting.length > 0 && orderSetting[0].value) {
      const parsed = JSON.parse(orderSetting[0].value);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    // Non-blocking fallback
  }
  return [];
}

/**
 * Fetch every non-draft package of a given type ('umrah' | 'hajj'), sorted by custom admin order.
 * Used by public-facing sections that should automatically show every package an
 * admin creates, adhering to the custom order configured in backend.
 */
export async function getPackagesByType(type: 'umrah' | 'hajj'): Promise<any[]> {
  try {
    const rows = await db
      .select()
      .from(packages)
      .where(and(eq(packages.type, type), ne(packages.status, 'draft'), ne(packages.status, 'sold_out')));
    
    const orderIds = await getStoredPackageOrderIds();
    return sortPackagesByOrderedList(rows || [], orderIds);
  } catch (err) {
    console.error('getPackagesByType DB error:', err);
    return [];
  }
}

export async function getAllPackages() {
  try {
    const list = await db.select().from(packages);
    const orderIds = await getStoredPackageOrderIds();
    return sortPackagesByOrderedList(list || [], orderIds);
  } catch (err) {
    console.error('getAllPackages DB error:', err);
    throw new Error('Failed to fetch packages from database');
  }
}

export async function getSoldOutPackages() {
  try {
    const rows = await db
      .select()
      .from(packages)
      .where(eq(packages.status, 'sold_out'));
    
    const orderIds = await getStoredPackageOrderIds();
    return sortPackagesByOrderedList(rows || [], orderIds);
  } catch (err) {
    console.error('getSoldOutPackages DB error:', err);
    return [];
  }
}

export async function updatePackageOrderAction(orderedIds: number[]) {
  try {
    const { siteSettings } = await import('@/db/schema');
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ordered_packages')).limit(1);
    const value = JSON.stringify(orderedIds);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, 'ordered_packages'));
    } else {
      await db.insert(siteSettings).values({ key: 'ordered_packages', value });
    }

    await logAdminActivityAction({
      type: 'packages',
      action: 'Reordered Packages',
      details: `Reordered ${orderedIds.length} packages sequence`,
    });

    revalidatePath('/admin/packages');
    revalidatePath('/admin/hajj-packages');
    revalidatePath('/admin/umrah-packages');
    revalidatePath('/hajj-packages');
    revalidatePath('/umrah-packages');
    revalidatePath('/hajj');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('updatePackageOrderAction error:', err);
    return { success: false, error: err.message };
  }
}

/** Fetch packages by an ordered array of IDs (preserves the given order). */
export async function getPackagesByIds(ids: number[]): Promise<any[]> {
  if (!ids || ids.length === 0) return [];
  try {
    const { inArray } = await import('drizzle-orm');
    const rows = await db.select().from(packages).where(inArray(packages.id, ids));
    // Preserve the caller-specified order
    const map = new Map(rows.map((r) => [r.id, r]));
    return ids.map((id) => map.get(id)).filter(Boolean) as any[];
  } catch (err) {
    console.error('getPackagesByIds DB error:', err);
    return [];
  }
}

export async function getPackageBySlug(slug: string) {
  try {
    const pkgList = await db.select().from(packages).where(eq(packages.slug, slug)).limit(1);
    if (!pkgList.length) return null;

    const pkg = pkgList[0];
    const prices = await db.select().from(packagePrices).where(eq(packagePrices.packageId, pkg.id));
    const hotels = await db.select().from(packageHotels).where(eq(packageHotels.packageId, pkg.id));

    return { ...pkg, prices, hotels };
  } catch (err) {
    console.error('getPackageBySlug DB error:', err);
    return null;
  }
}

export async function createPackage(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const title = formData.get('title') as string;
    const customSlug = formData.get('slug') as string;
    const type = (formData.get('type') as 'umrah' | 'hajj') || 'umrah';
    const month = formData.get('month') as string || '';
    const startingPrice = (formData.get('startingPrice') as string) || '1995.00';
    const starRating = (formData.get('starRating') as string) || '5 Star';
    const status = (formData.get('status') as any) || 'available';
    const shortDescription = formData.get('shortDescription') as string || '';
    const fullDescription = formData.get('fullDescription') as string || '';
    const inclusions = formData.get('inclusions') as string || '[]';
    const cardDataStr = formData.get('cardData') as string || '';
    const cardData = cardDataStr ? JSON.parse(cardDataStr) : null;

    // Umrah-only gallery. Hajj creation does not read or write this field.
    const packagesGalleryStr = formData.get('packagesGallery') as string || '';
    const packagesGallery = packagesGalleryStr
      ? JSON.parse(packagesGalleryStr)
      : null;

    if (!title) return { success: false, error: 'Package title is required.' };

    // Server-side validation for month format (accepts YYYY-MM, or clean string, reject malicious inputs)
    let sanitizedMonth = (month || '').trim().slice(0, 100);
    if (sanitizedMonth && !/^[\w\s\-()]+$/.test(sanitizedMonth)) {
      return { success: false, error: 'Invalid characters in travel month.' };
    }

    const slug = customSlug ? customSlug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const insertData: any = {
      title,
      type,
      slug,
      month: sanitizedMonth,
      startingPrice,
      starRating,
      status,
      shortDescription,
      fullDescription,
      inclusions,
      cardData,
    };

    // Keep Hajj inserts exactly as before.
    insertData.packagesGallery = packagesGallery;

    await db.insert(packages).values(insertData);

    // Log Activity
    await logAdminActivityAction({
      type: 'packages',
      action: 'Created Package',
      details: `Created ${type.toUpperCase()} package "${title}" ($${startingPrice} ${status})`,
    });

    revalidatePath('/admin/packages');
    revalidatePath('/admin/hajj-packages');
    revalidatePath('/admin/umrah-packages');
    revalidatePath('/hajj-packages');
    revalidatePath('/umrah-packages');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating package:', error);
    return { success: false, error: error.message || 'Failed to create package in database.' };
  }
}

export async function updatePackageAction(
  id: number,
  data: {
    title: string;
    slug?: string;
    type: 'umrah' | 'hajj';
    month?: string;
    startingPrice?: string;
    starRating?: string;
    status?: 'available' | 'sold_out' | 'coming_soon' | 'draft';
    shortDescription?: string;
    fullDescription?: string;
    featuredImage?: string;
    departureCity?: string;
    destination?: string;
    cardData?: any;
    detailPageData?: any;
    packagesGallery?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Normalize legacy month strings (e.g. "December 2026") → "YYYY-MM" before validation/save
    let sanitizedMonth: string | undefined;
    if (data.month !== undefined) {
      const raw = (data.month || '').trim();
      if (raw) {
        const { travelMonth } = parseLegacyTravelMonth(raw);
        sanitizedMonth = (travelMonth || raw).slice(0, 100);
      } else {
        sanitizedMonth = '';
      }
    }
    if (sanitizedMonth && !/^[\w\s\-()]+$/.test(sanitizedMonth)) {
      return { success: false, error: 'Invalid characters in travel month.' };
    }

    const updateData: any = {
      title: data.title,
      slug: data.slug,
      type: data.type,
      month: sanitizedMonth !== undefined ? sanitizedMonth : data.month,
      startingPrice: data.startingPrice,
      starRating: data.starRating,
      status: data.status,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      featuredImage: data.featuredImage,
      departureCity: data.departureCity,
      destination: data.destination,
      cardData: data.cardData,
      detailPageData: data.detailPageData,
      updatedAt: new Date(),
    };

    // Umrah-only update. Hajj rows never have packages_gallery touched.
    if (data.packagesGallery !== undefined) {
      updateData.packagesGallery = data.packagesGallery;
    }

    await db.update(packages).set(updateData).where(eq(packages.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'packages',
      action: 'Updated Package',
      details: `Updated package "${data.title}" (ID #${id}) - Status: ${data.status}`,
    });

    revalidatePath('/admin/packages');
    revalidatePath('/admin/hajj-packages');
    revalidatePath('/admin/umrah-packages');
    revalidatePath('/hajj-packages');
    revalidatePath('/umrah-packages');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating package:', error);
    return { success: false, error: error.message || 'Failed to update package in database.' };
  }
}

export async function updatePackageStatus(id: number, status: 'available' | 'sold_out' | 'coming_soon' | 'draft'): Promise<void> {
  try {
    let pkgTitle = `ID #${id}`;
    try {
      const found = await db.select().from(packages).where(eq(packages.id, id)).limit(1);
      if (found && found.length > 0) {
        pkgTitle = `"${found[0].title}"`;
      }
    } catch (e) {}

    await db.update(packages).set({ status, updatedAt: new Date() }).where(eq(packages.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'packages',
      action: 'Changed Package Status',
      details: `Package ${pkgTitle} status updated to "${status}"`,
    });

    revalidatePath('/admin/packages');
    revalidatePath('/admin/hajj-packages');
    revalidatePath('/admin/umrah-packages');
    revalidatePath('/');
    revalidatePath('/hajj-packages');
    revalidatePath('/umrah-packages');
  } catch (error) {
    console.error('Error updating package status:', error);
  }
}

export async function deletePackage(id: number): Promise<void> {
  try {
    let pkgTitle = `ID #${id}`;
    try {
      const found = await db.select().from(packages).where(eq(packages.id, id)).limit(1);
      if (found && found.length > 0) {
        pkgTitle = `"${found[0].title}"`;
      }
    } catch (e) {}

    await db.delete(packages).where(eq(packages.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'packages',
      action: 'Deleted Package',
      details: `Permanently removed package ${pkgTitle}`,
    });

    revalidatePath('/admin/packages');
    revalidatePath('/admin/hajj-packages');
    revalidatePath('/admin/umrah-packages');
    revalidatePath('/');
    revalidatePath('/hajj-packages');
    revalidatePath('/umrah-packages');
  } catch (error) {
    console.error('Error deleting package:', error);
  }
}