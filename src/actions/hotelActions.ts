'use server';

import { db } from '@/db';
import { hotelCategories, hotels } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
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

export async function getHotelDirectory() {
  const categories = await db
    .select()
    .from(hotelCategories)
    .where(eq(hotelCategories.isPublished, true))
    .orderBy(asc(hotelCategories.displayOrder), asc(hotelCategories.name));
  const hotelRows = await db
    .select()
    .from(hotels)
    .where(eq(hotels.isPublished, true))
    .orderBy(asc(hotels.displayOrder), asc(hotels.name));

  return categories.map((category) => ({
    ...category,
    hotels: hotelRows.filter((hotel) => hotel.categoryId === category.id),
  }));
}

export async function getHotelAdminData() {
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
    await logAdminActivityAction({ type: 'settings', action: 'Created Hotel Category', details: `Hotel category "${name}" created` });
    revalidatePath('/hotels');
    revalidateTag('hotel-directory', 'max');
    return { success: true, id: inserted[0]?.id };
  } catch (error: any) {
    return { success: false, error: error?.code === 'ER_DUP_ENTRY' ? 'A category with this name already exists.' : 'Failed to create hotel category.' };
  }
}

export async function updateHotelCategoryAction(id: number, input: { name: string; displayOrder?: number; isPublished?: boolean }) {
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
    revalidatePath('/hotels');
    revalidateTag('hotel-directory', 'max');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.code === 'ER_DUP_ENTRY' ? 'A category with this name already exists.' : 'Failed to update hotel category.' };
  }
}

export async function deleteHotelCategoryAction(id: number) {
  try {
    await db.delete(hotelCategories).where(eq(hotelCategories.id, id));
    revalidatePath('/hotels');
    revalidateTag('hotel-directory', 'max');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete hotel category.' };
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
  const hotel = normalizeHotel(input);
  if (!hotel.name || !hotel.city || !hotel.categoryId || !hotel.websiteUrl) {
    return { success: false, error: 'Category, hotel name, city, and website URL are required.' };
  }
  try {
    const inserted = await db.insert(hotels).values(hotel).$returningId();
    await logAdminActivityAction({ type: 'settings', action: 'Created Hotel', details: `Hotel "${hotel.name}" created` });
    revalidatePath('/hotels');
    revalidateTag('hotel-directory', 'max');
    return { success: true, id: inserted[0]?.id };
  } catch {
    return { success: false, error: 'Failed to create hotel.' };
  }
}

export async function updateHotelAction(id: number, input: HotelInput) {
  const hotel = normalizeHotel(input);
  if (!hotel.name || !hotel.city || !hotel.categoryId || !hotel.websiteUrl) {
    return { success: false, error: 'Category, hotel name, city, and website URL are required.' };
  }
  try {
    await db.update(hotels).set({ ...hotel, updatedAt: new Date() }).where(eq(hotels.id, id));
    revalidatePath('/hotels');
    revalidateTag('hotel-directory', 'max');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update hotel.' };
  }
}

export async function deleteHotelAction(id: number) {
  try {
    await db.delete(hotels).where(eq(hotels.id, id));
    revalidatePath('/hotels');
    revalidateTag('hotel-directory', 'max');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to delete hotel.' };
  }
}
