'use server';

import { db } from '@/db';
import { hajjGuideGridItems, sitePages } from '@/db/schema';
import { requireAdmin } from '@/lib/requireAdmin';
import { logAdminActivityAction } from '@/actions/activityActions';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { revalidatePath, updateTag } from 'next/cache';

export type HajjGuideGridItem = {
  id: number;
  title: string;
  imageUrl: string;
  altText: string;
  targetUrl: string;
  guidePageId: number | null;
  guideSlug: string | null;
  displayOrder: number;
  status: 'published' | 'draft';
};

export type HajjGuideGridInput = {
  id?: number;
  title: string;
  imageUrl?: string;
  altText?: string;
  targetUrl?: string;
  guidePageId?: number | null;
  displayOrder?: number;
  status: 'published' | 'draft';
};

/** Links are optional; never allow javascript:, data:, protocol-relative, or malformed URLs. */
function validateGridUrl(value: string): boolean {
  if (!value) return true;
  if (/[\\<>\u0000-\u001f]/.test(value) || value.startsWith('//')) return false;
  if (value.startsWith('/')) return true;
  try {
    const parsed = new URL(value);
    return ['https:', 'http:'].includes(parsed.protocol) && !!parsed.hostname;
  } catch {
    return false;
  }
}

function toGridItem(row: {
  grid: typeof hajjGuideGridItems.$inferSelect;
  guide: { slug: string; status: 'published' | 'draft' } | null;
}): HajjGuideGridItem {
  const guideSlug = row.guide?.status === 'published' ? row.guide.slug : null;
  return {
    id: row.grid.id,
    title: row.grid.title,
    imageUrl: row.grid.imageUrl || '',
    altText: row.grid.altText || '',
    targetUrl: row.grid.targetUrl || '',
    guidePageId: row.grid.guidePageId,
    guideSlug,
    displayOrder: row.grid.displayOrder,
    status: row.grid.status === 'published' ? 'published' : 'draft',
  };
}

async function queryItems(includeDrafts: boolean): Promise<HajjGuideGridItem[]> {
  const filters = [isNull(hajjGuideGridItems.deletedAt)];
  if (!includeDrafts) filters.push(eq(hajjGuideGridItems.status, 'published'));
  const rows = await db.select({
    grid: hajjGuideGridItems,
    guide: { slug: sitePages.slug, status: sitePages.status },
  }).from(hajjGuideGridItems)
    .leftJoin(sitePages, and(eq(hajjGuideGridItems.guidePageId, sitePages.id), eq(sitePages.guideCategory, 'hajj')))
    .where(and(...filters))
    .orderBy(asc(hajjGuideGridItems.displayOrder), asc(hajjGuideGridItems.id));
  return rows.map(toGridItem);
}

/** Public list never includes drafts or soft-deleted grid records. */
export async function getHajjGuideGridItems(): Promise<HajjGuideGridItem[]> {
  try {
    return await queryItems(false);
  } catch (error) {
    console.error('[Hajj Guide Grid] Read failed; run the supplied SQL migration.', error);
    return [];
  }
}

export async function getHajjGuideGridAdminItems(): Promise<HajjGuideGridItem[]> {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);
  return queryItems(true);
}

function refreshGrid() {
  revalidatePath('/admin/hajj-guide');
  // A grid section may be embedded on any CMS route, not just the homepage.
  revalidatePath('/', 'layout');
  updateTag('pages');
}

export async function saveHajjGuideGridItemAction(input: HajjGuideGridInput) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);
  const title = String(input.title || '').trim();
  const imageUrl = String(input.imageUrl || '').trim();
  const targetUrl = String(input.targetUrl || '').trim();
  const altText = String(input.altText || '').trim();
  const guidePageId = input.guidePageId ? Number(input.guidePageId) : null;
  const order = Number(input.displayOrder ?? 0);
  const id = input.id ? Number(input.id) : null;
  if (!title || title.length > 180) return { success: false, error: 'Title is required (maximum 180 characters).' };
  if (altText.length > 255 || imageUrl.length > 2048 || targetUrl.length > 2048) return { success: false, error: 'An image or URL field is too long.' };
  if (!validateGridUrl(imageUrl) || !validateGridUrl(targetUrl)) return { success: false, error: 'Only internal paths (/...) and valid http/https URLs are allowed.' };
  if (!Number.isInteger(order) || order < 0 || order > 99999) return { success: false, error: 'Display order must be between 0 and 99999.' };
  if (id !== null && (!Number.isInteger(id) || id < 1)) return { success: false, error: 'Invalid card ID.' };
  if (guidePageId !== null && (!Number.isInteger(guidePageId) || guidePageId < 1)) return { success: false, error: 'Invalid detail page ID.' };
  try {
    if (guidePageId !== null) {
      const guides = await db.select({ id: sitePages.id }).from(sitePages)
        .where(and(eq(sitePages.id, guidePageId), eq(sitePages.guideCategory, 'hajj'))).limit(1);
      if (!guides.length) return { success: false, error: 'Selected Hajj guide detail page does not exist.' };
    }
    const values = {
      title, imageUrl: imageUrl || null, altText: altText || null,
      targetUrl: targetUrl || null, guidePageId, displayOrder: order,
      status: input.status === 'published' ? 'published' as const : 'draft' as const,
      updatedAt: new Date(),
    };
    let savedId = id;
    if (id !== null) {
      const current = await db.select({ id: hajjGuideGridItems.id }).from(hajjGuideGridItems)
        .where(and(eq(hajjGuideGridItems.id, id), isNull(hajjGuideGridItems.deletedAt))).limit(1);
      if (!current.length) return { success: false, error: 'Grid item was not found.' };
      await db.update(hajjGuideGridItems).set(values).where(eq(hajjGuideGridItems.id, id));
    } else {
      const created = await db.insert(hajjGuideGridItems).values(values).$returningId();
      savedId = created[0]?.id || null;
    }
    await logAdminActivityAction({ type: 'hajj_guide', action: id ? 'Updated Hajj Guide Grid' : 'Created Hajj Guide Grid', details: `Grid ${savedId}: ${title}` });
    refreshGrid();
    return { success: true, id: savedId };
  } catch (error) {
    console.error('[Hajj Guide Grid] Save failed', error);
    return { success: false, error: 'Could not save grid item. Confirm the SQL migration has been run and the database is available.' };
  }
}

export async function archiveHajjGuideGridItemAction(id: number) {
  await requireAdmin(['admin', 'content_editor', 'seo_manager']);
  if (!Number.isInteger(id) || id < 1) return { success: false, error: 'Invalid item.' };
  try {
    const current = await db.select({ title: hajjGuideGridItems.title }).from(hajjGuideGridItems)
      .where(and(eq(hajjGuideGridItems.id, id), isNull(hajjGuideGridItems.deletedAt))).limit(1);
    if (!current.length) return { success: false, error: 'Item not found.' };
    await db.update(hajjGuideGridItems).set({ deletedAt: new Date(), status: 'draft', updatedAt: new Date() }).where(eq(hajjGuideGridItems.id, id));
    await logAdminActivityAction({ type: 'hajj_guide', action: 'Archived Hajj Guide Grid', details: `Grid ${id}: ${current[0].title}` });
    refreshGrid();
    return { success: true };
  } catch (error) {
    console.error('[Hajj Guide Grid] Archive failed', error);
    return { success: false, error: 'Unable to archive this item.' };
  }
}
