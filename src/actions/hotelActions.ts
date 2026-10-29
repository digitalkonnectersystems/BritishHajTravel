'use server';

import { requireAdmin } from '@/lib/requireAdmin';

import { db } from '@/db';
import { hotelCategories, hotels } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import {
  revalidatePath,
  updateTag,
  unstable_cache,
} from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanUrl(value: string) {
  const url = value.trim();
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

async function fetchHotelDirectoryFromDb() {
  const categories = await db
    .select()
    .from(hotelCategories)
    .where(eq(hotelCategories.isPublished, true))
    .orderBy(
      asc(hotelCategories.displayOrder),
      asc(hotelCategories.name)
    );

  const hotelRows = await db
    .select()
    .from(hotels)
    .where(eq(hotels.isPublished, true))
    .orderBy(
      asc(hotels.displayOrder),
      asc(hotels.name)
    );

  return categories.map((category) => ({
    ...category,
    hotels: hotelRows.filter(
      (hotel) => hotel.categoryId === category.id
    ),
  }));
}

export async function getHotelDirectory() {
  const getCachedHotelDirectory = unstable_cache(
    fetchHotelDirectoryFromDb,
    ['hotel-directory'],
    {
      tags: ['hotel-directory'],
      revalidate: 3600,
    }
  );

  return getCachedHotelDirectory();
}

export async function getHotelAdminData() {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  const categories = await db
    .select()
    .from(hotelCategories)
    .orderBy(asc(hotelCategories.displayOrder), asc(hotelCategories.name));
  const hotelRows = await db
    .select()
    .from(hotels)
    .orderBy(asc(hotels.displayOrder), asc(hotels.name));
  return { categories, hotels: hotelRows };
}

export async function createHotelCategoryAction(input: { name: string; displayOrder?: number; isPublished?: boolean }) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  const name = input.name.trim();
  if (!name) return { success: false, error: 'Category name is required.' };
  const slug = slugify(name);
  if (!slug) return { success: false, error: 'Category name must contain letters or numbers.' };

  try {
    const inserted = await db.insert(hotelCategories).values({
      name,
      slug,
      displayOrder: Number(input.displayOrder || 0),
      isPublished: input.isPublished !== false,
    }).$returningId();
    await logAdminActivityAction({ type: 'hotels', action: 'Created Hotel Category', details: `Hotel category "${name}" created` });
    revalidatePath('/hotels');
    updateTag('hotel-directory');
    return { success: true, id: inserted[0]?.id };
  } catch (error: any) {
    return { success: false, error: error?.code === 'ER_DUP_ENTRY' ? 'A category with this name already exists.' : 'Failed to create hotel category.' };
  }
}

export async function updateHotelCategoryAction(id: number, input: { name: string; displayOrder?: number; isPublished?: boolean }) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  const name = input.name.trim();
  if (!name) return { success: false, error: 'Category name is required.' };
  try {
    await db.update(hotelCategories).set({
      name,
      slug: slugify(name),
      displayOrder: Number(input.displayOrder || 0),
      isPublished: input.isPublished !== false,
      updatedAt: new Date(),
    }).where(eq(hotelCategories.id, id));
    await logAdminActivityAction({type:'hotels',action:'Updated Hotel Category',details:`Hotel category #${id} updated`,newEntry:{id,name}});
    revalidatePath('/hotels');
    updateTag('hotel-directory');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.code === 'ER_DUP_ENTRY' ? 'A category with this name already exists.' : 'Failed to update hotel category.' };
  }
}

export async function deleteHotelCategoryAction(id: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    await db.delete(hotelCategories).where(eq(hotelCategories.id, id));
    await logAdminActivityAction({type:'hotels',action:'Deleted Hotel Category',details:`Hotel category #${id} deleted`,previousEntry:{id}});
    revalidatePath('/hotels');
    updateTag('hotel-directory');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete hotel category.' };
  }
}

export async function updateHotelCategoryOrderAction(orderedIds: number[]) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    await Promise.all(orderedIds.map((id, index) => db.update(hotelCategories).set({ displayOrder: index, updatedAt: new Date() }).where(eq(hotelCategories.id, id))));
    await logAdminActivityAction({type:'hotels',action:'Reordered Hotel Categories',details:`Reordered ${orderedIds.length} hotel categories`,newEntry:{ids:orderedIds.slice(0,100)}});
    revalidatePath('/hotels');
    updateTag('hotel-directory');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update hotel category order.' };
  }
}

export type HotelInput = {
  categoryId: number;
  name: string;
  city: string;
  imageUrl?: string;
  rating?: string;
  description?: string;
  priceLabel?: string;
  pricePeriod?: string;
  websiteUrl: string;
  displayOrder?: number;
  isPublished?: boolean;
};

function normalizeHotel(input: HotelInput) {
  return {
    categoryId: Number(input.categoryId),
    name: input.name.trim(),
    city: input.city.trim(),
    imageUrl: input.imageUrl?.trim() || null,
    rating: input.rating?.trim() || '5.0',
    description: input.description?.trim() || null,
    priceLabel: input.priceLabel?.trim() || 'TBC',
    pricePeriod: input.pricePeriod?.trim() || 'per Night',
    websiteUrl: cleanUrl(input.websiteUrl),
    displayOrder: Number(input.displayOrder || 0),
    isPublished: input.isPublished !== false,
  };
}

export async function createHotelAction(input: HotelInput) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  const hotel = normalizeHotel(input);
  if (!hotel.name || !hotel.city || !hotel.categoryId || !hotel.websiteUrl) {
    return { success: false, error: 'Category, hotel name, city, and website URL are required.' };
  }
  try {
    const inserted = await db.insert(hotels).values(hotel).$returningId();
    await logAdminActivityAction({ type: 'hotels', action: 'Created Hotel', details: `Hotel "${hotel.name}" created` });
    revalidatePath('/hotels');
    updateTag('hotel-directory');
    return { success: true, id: inserted[0]?.id };
  } catch {
    return { success: false, error: 'Failed to create hotel.' };
  }
}

export async function updateHotelAction(id: number, input: HotelInput) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  const hotel = normalizeHotel(input);
  if (!hotel.name || !hotel.city || !hotel.categoryId || !hotel.websiteUrl) {
    return { success: false, error: 'Category, hotel name, city, and website URL are required.' };
  }
  try {
    await db.update(hotels).set({ ...hotel, updatedAt: new Date() }).where(eq(hotels.id, id));
    await logAdminActivityAction({type:'hotels',action:'Updated Hotel',details:`Hotel #${id} (${hotel.name}) updated`,newEntry:{id,name:hotel.name,city:hotel.city,categoryId:hotel.categoryId}});
    revalidatePath('/hotels');
    updateTag('hotel-directory');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update hotel.' };
  }
}

export async function toggleHotelPublicationAction(id: number, isPublished: boolean) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const previousEntry = (await db.select().from(hotels).where(eq(hotels.id, id)).limit(1))[0];
    if (!previousEntry) return { success: false, error: 'Hotel not found.' };

    await db.update(hotels).set({ isPublished, updatedAt: new Date() }).where(eq(hotels.id, id));
    const updatedHotel = { ...previousEntry, isPublished, updatedAt: new Date() };
    await logAdminActivityAction({
      type: 'hotels',
      action: isPublished ? 'Published Hotel' : 'Unpublished Hotel',
      details: `${isPublished ? 'Published' : 'Unpublished'} hotel "${previousEntry.name}"`,
      previousEntry,
      newEntry: updatedHotel,
    });
    revalidatePath('/hotels');
    revalidatePath('/admin/hotels');
    updateTag('hotel-directory');
    return { success: true };
  } catch (error) {
    console.error('toggleHotelPublicationAction failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update hotel visibility.' };
  }
}

export async function duplicateHotelAction(id: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    const source = (await db.select().from(hotels).where(eq(hotels.id, id)).limit(1))[0];
    if (!source) return { success: false, error: 'Hotel not found.' };

    const copySuffix = ' (Copy)';
    const baseName = `${source.name.slice(0, 255 - copySuffix.length)}${copySuffix}`;
    let name = baseName;
    let suffix = 2;
    while ((await db.select({ id: hotels.id }).from(hotels).where(eq(hotels.name, name)).limit(1)).length > 0) {
      const ending = ` (Copy ${suffix++})`;
      name = `${source.name.slice(0, 255 - ending.length)}${ending}`;
    }

    const content = { ...source };
    delete (content as { id?: number }).id;
    const inserted = await db.insert(hotels).values({
      ...content,
      name,
      isPublished: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).$returningId();
    const duplicate = inserted[0]?.id
      ? (await db.select().from(hotels).where(eq(hotels.id, inserted[0].id)).limit(1))[0]
      : null;

    await logAdminActivityAction({
      type: 'hotels',
      action: 'Duplicated Hotel',
      details: `Duplicated hotel "${source.name}" as "${name}"`,
      previousEntry: source,
      newEntry: duplicate,
    });
    revalidatePath('/hotels');
    revalidatePath('/admin/hotels');
    updateTag('hotel-directory');
    return { success: true, hotel: duplicate };
  } catch (error) {
    console.error('duplicateHotelAction failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to duplicate hotel.' };
  }
}

export async function deleteHotelAction(id: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    await db.delete(hotels).where(eq(hotels.id, id));
    await logAdminActivityAction({type:'hotels',action:'Deleted Hotel',details:`Hotel #${id} deleted`,previousEntry:{id}});
    revalidatePath('/hotels');
    updateTag('hotel-directory');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete hotel.' };
  }
}

export async function updateHotelOrderAction(orderedIds: number[]) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);

  try {
    await Promise.all(orderedIds.map((id, index) => db.update(hotels).set({ displayOrder: index, updatedAt: new Date() }).where(eq(hotels.id, id))));
    await logAdminActivityAction({type:'hotels',action:'Reordered Hotels',details:`Reordered ${orderedIds.length} hotels`,newEntry:{ids:orderedIds.slice(0,100)}});
    revalidatePath('/hotels');
    updateTag('hotel-directory');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update hotel order.' };
  }
}
