'use server';

import { db } from '@/db';
import { destinations } from '@/db/schema';
import { and, asc, eq, sql } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';

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

async function ensureDestinationsTable() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS destinations (
    id int AUTO_INCREMENT PRIMARY KEY,
    title varchar(255) NOT NULL,
    slug varchar(128) NOT NULL UNIQUE,
    description text,
    section_title varchar(255) DEFAULT 'Packages for this destination',
    banner_images json,
    package_ids json,
    status enum('published','draft') NOT NULL DEFAULT 'published',
    display_order int NOT NULL DEFAULT 0,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
}

export async function getDestinations(includeDrafts = false) {
  try {
    await ensureDestinationsTable();
    const query = db.select().from(destinations);
    const rows = await (includeDrafts ? query : query.where(eq(destinations.status, 'published')))
      .orderBy(asc(destinations.displayOrder), asc(destinations.title));
    return rows.map((row) => ({
      ...row,
      bannerImages: parseJson(row.bannerImages),
      packageIds: parseJson(row.packageIds).map(Number).filter(Boolean),
    }));
  } catch (error) {
    console.error('getDestinations DB error:', error);
    return [];
  }
}

export async function getDestinationBySlug(slug: string) {
  try {
    await ensureDestinationsTable();
    const rows = await db.select().from(destinations).where(
      and(eq(destinations.slug, slug), eq(destinations.status, 'published'))
    ).limit(1);
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row,
      bannerImages: parseJson(row.bannerImages),
      packageIds: parseJson(row.packageIds).map(Number).filter(Boolean),
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
  status?: 'published' | 'draft';
  displayOrder?: number;
}) {
  try {
    await ensureDestinationsTable();
    const title = data.title.trim();
    const slug = data.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9-]+/g, '-');
    if (!title || !slug) return { success: false, error: 'Title and slug are required.' };

    const packageIds = (data.packageIds || [])
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);
    const bannerImages = (data.bannerImages || [])
      .map((image) => String(image || '').trim())
      .filter(Boolean);

    const values = {
      title,
      slug,
      description: data.description || '',
      sectionTitle: data.sectionTitle || 'Packages for this destination',
      bannerImages,
      packageIds,
      status: data.status || 'published',
      displayOrder: Number(data.displayOrder || 0),
      updatedAt: new Date(),
    } as any;

    if (data.id) {
      await db.update(destinations).set(values).where(eq(destinations.id, data.id));
    } else {
      await db.insert(destinations).values(values);
    }

    await logAdminActivityAction({ type: 'pages', action: data.id ? 'Updated Destination' : 'Created Destination', details: `${data.id ? 'Updated' : 'Created'} destination "${title}"` });
    revalidatePath('/destinations');
    revalidatePath(`/destinations/${slug}`);
    revalidatePath('/', 'layout');
    revalidateTag('nav-items', 'max');
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

export async function deleteDestinationAction(id: number) {
  try {
    await ensureDestinationsTable();
    await db.delete(destinations).where(eq(destinations.id, id));
    revalidatePath('/destinations');
    revalidatePath('/', 'layout');
    revalidateTag('nav-items', 'max');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete destination.' };
  }
}

export async function updateDestinationOrderAction(orderedIds: number[]) {
  try {
    await Promise.all(orderedIds.map((id, index) => db.update(destinations).set({ displayOrder: index, updatedAt: new Date() }).where(eq(destinations.id, id))));
    revalidatePath('/destinations');
    revalidatePath('/', 'layout');
    revalidateTag('nav-items', 'max');
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to update destination order.' };
  }
}