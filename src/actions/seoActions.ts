'use server';

import { db } from '@/db';
import { blogPosts, packages, sitePages, siteSettings, visaServices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getCurrentSession } from '@/lib/auth';
import { logAdminActivityAction } from '@/actions/activityActions';
import {
  buildEntityMetadata,
  metadataSnapshot,
  parseSeoSettings,
  type SeoEntityType,
} from '@/lib/seoMetadata';

export type SeoAuditIssue = {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
};

export type SeoAuditItem = {
  key: string;
  entityType: SeoEntityType;
  entityId: number;
  title: string;
  slug: string;
  route: string;
  status: string;
  score: number;
  issues: SeoAuditIssue[];
  metadata: {
    title: string;
    description: string;
    canonical: string;
    ogImage: string;
    robotsIndex: boolean;
    robotsFollow: boolean;
  };
  seoData: Record<string, any>;
};

async function requireAdminSession() {
  const session = await getCurrentSession();
  if (!session) throw new Error('Unauthorized.');
  return session;
}

function toNumberId(value: number | string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid SEO entity ID.');
  return id;
}

function mergePageSeo(row: any, legacySeo: any = null) {
  const stored = parseSeoSettings(row?.seoSettings);
  const legacy = parseSeoSettings(legacySeo);
  return {
    ...legacy,
    ...stored,
    metaTitle: row?.metaTitle || stored.metaTitle || legacy.metaTitle || '',
    metaDescription: row?.metaDescription || stored.metaDescription || legacy.metaDescription || '',
  };
}

async function getLegacyPageSeo(pageId: number) {
  try {
    const rows = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, `page_seo_${pageId}`))
      .limit(1);
    return rows[0]?.value || null;
  } catch {
    return null;
  }
}

export async function getEntitySeoAction(entityType: SeoEntityType, rawId: number | string) {
  await requireAdminSession();
  const id = toNumberId(rawId);

  if (entityType === 'page') {
    const rows = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
    if (!rows.length) return null;
    return mergePageSeo(rows[0], await getLegacyPageSeo(id));
  }
  if (entityType === 'package') {
    const rows = await db.select({ seoSettings: packages.seoSettings }).from(packages).where(eq(packages.id, id)).limit(1);
    return rows.length ? parseSeoSettings(rows[0].seoSettings) : null;
  }
  if (entityType === 'blog') {
    const rows = await db.select({ seoSettings: blogPosts.seoSettings }).from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
    return rows.length ? parseSeoSettings(rows[0].seoSettings) : null;
  }
  if (entityType === 'visa') {
    const rows = await db.select({ seoSettings: visaServices.seoSettings }).from(visaServices).where(eq(visaServices.id, id)).limit(1);
    return rows.length ? parseSeoSettings(rows[0].seoSettings) : null;
  }
  return null;
}

export async function saveEntitySeoAction(entityType: SeoEntityType, rawId: number | string, seoData: any) {
  try {
    await requireAdminSession();
    const id = toNumberId(rawId);
    const cleanSeo = {
      ...parseSeoSettings(seoData),
      updatedAt: new Date().toISOString(),
    };

    let entityTitle = `${entityType} #${id}`;
    let publicPath = '/';

    if (entityType === 'page') {
      const rows = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
      if (!rows.length) return { success: false, error: 'Page not found.' };
      entityTitle = rows[0].title;
      publicPath = rows[0].slug || '/';
      await db.update(sitePages).set({
        metaTitle: cleanSeo.metaTitle || null,
        metaDescription: cleanSeo.metaDescription || null,
        seoSettings: cleanSeo,
        updatedAt: new Date(),
      }).where(eq(sitePages.id, id));
    } else if (entityType === 'package') {
      const rows = await db.select().from(packages).where(eq(packages.id, id)).limit(1);
      if (!rows.length) return { success: false, error: 'Package not found.' };
      entityTitle = rows[0].title;
      publicPath = `/package/${rows[0].slug}`;
      await db.update(packages).set({ seoSettings: cleanSeo, updatedAt: new Date() }).where(eq(packages.id, id));
    } else if (entityType === 'blog') {
      const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
      if (!rows.length) return { success: false, error: 'Blog not found.' };
      entityTitle = rows[0].title;
      publicPath = `/${rows[0].slug || ''}`;
      await db.update(blogPosts).set({ seoSettings: cleanSeo, updatedAt: new Date() }).where(eq(blogPosts.id, id));
    } else if (entityType === 'visa') {
      const rows = await db.select().from(visaServices).where(eq(visaServices.id, id)).limit(1);
      if (!rows.length) return { success: false, error: 'Visa service not found.' };
      entityTitle = rows[0].title;
      publicPath = '/saudi-visa';
      await db.update(visaServices).set({ seoSettings: cleanSeo }).where(eq(visaServices.id, id));
    }

    await logAdminActivityAction({
      type: entityType === 'package' ? 'packages' : entityType === 'visa' ? 'visas' : entityType === 'blog' ? 'blogs' : 'pages',
      action: `Updated ${entityType[0].toUpperCase()}${entityType.slice(1)} SEO`,
      details: `SEO metadata updated for ${entityTitle}`,
      newEntry: cleanSeo,
    });

    revalidatePath(publicPath);
    revalidatePath('/admin/seo');
    revalidatePath('/admin/pages');
    revalidatePath('/admin/blogs');
    revalidatePath('/admin/hajj-packages');
    revalidatePath('/admin/umrah-packages');
    revalidateTag('pages', 'max');
    revalidateTag('blogs', 'max');

    return { success: true };
  } catch (err: any) {
    console.error('saveEntitySeoAction error:', err);
    return { success: false, error: err.message || 'Failed to save SEO settings.' };
  }
}

function auditSingleItem(item: Omit<SeoAuditItem, 'score' | 'issues'>): SeoAuditItem {
  const issues: SeoAuditIssue[] = [];
  const { title, description, canonical, ogImage, robotsIndex } = item.metadata;

  if (!title.trim()) issues.push({ code: 'missing_title', severity: 'error', message: 'Missing metadata title.' });
  else if (title.length < 30) issues.push({ code: 'short_title', severity: 'warning', message: `Title is short (${title.length} characters). Aim for about 30-60.` });
  else if (title.length > 65) issues.push({ code: 'long_title', severity: 'warning', message: `Title is long (${title.length} characters). Keep it around 60.` });

  if (!description.trim()) issues.push({ code: 'missing_description', severity: 'error', message: 'Missing meta description.' });
  else if (description.length < 70) issues.push({ code: 'short_description', severity: 'warning', message: `Description is short (${description.length} characters).` });
  else if (description.length > 160) issues.push({ code: 'long_description', severity: 'warning', message: `Description is long (${description.length} characters).` });

  if (!canonical.trim()) issues.push({ code: 'missing_canonical', severity: 'error', message: 'Missing canonical URL.' });
  else {
    try {
      const parsed = new URL(canonical);
      if (parsed.protocol !== 'https:') issues.push({ code: 'canonical_protocol', severity: 'warning', message: 'Canonical URL should use HTTPS.' });
    } catch {
      issues.push({ code: 'invalid_canonical', severity: 'error', message: 'Canonical URL is invalid.' });
    }
  }

  if (!ogImage.trim()) issues.push({ code: 'missing_og_image', severity: 'warning', message: 'Missing Open Graph image.' });
  if (!robotsIndex && item.status === 'published') issues.push({ code: 'published_noindex', severity: 'warning', message: 'Published content is set to noindex.' });

  const seo = item.seoData || {};
  if (!seo.schemaType && !seo.jsonLdPayload) issues.push({ code: 'schema_missing', severity: 'info', message: 'No custom schema type/JSON-LD is configured.' });
  if (!seo.heroAlt) issues.push({ code: 'hero_alt_missing', severity: 'info', message: 'Hero image alt text is not configured in SEO Center.' });

  const score = Math.max(0, 100 - issues.reduce((total, issue) => total + (issue.severity === 'error' ? 22 : issue.severity === 'warning' ? 10 : 4), 0));
  return { ...item, issues, score };
}

export async function getSeoAuditReportAction(): Promise<SeoAuditItem[]> {
  await requireAdminSession();

  const [pageRows, packageRows, blogRows] = await Promise.all([
    db.select().from(sitePages),
    db.select().from(packages),
    db.select().from(blogPosts),
  ]);

  const items: SeoAuditItem[] = [];

  for (const row of pageRows) {
    const legacy = await getLegacyPageSeo(row.id);
    const seoData = mergePageSeo(row, legacy);
    const entity = { ...row, seoData };
    const metadata = metadataSnapshot(buildEntityMetadata('page', entity));
    items.push(auditSingleItem({
      key: `page:${row.id}`,
      entityType: 'page',
      entityId: row.id,
      title: row.title,
      slug: row.slug,
      route: row.slug || '/',
      status: row.status,
      metadata,
      seoData,
    }));
  }

  for (const row of packageRows) {
    const seoData = parseSeoSettings(row.seoSettings);
    const entity = { ...row, seoData };
    const metadata = metadataSnapshot(buildEntityMetadata('package', entity));
    items.push(auditSingleItem({
      key: `package:${row.id}`,
      entityType: 'package',
      entityId: row.id,
      title: row.title,
      slug: row.slug,
      route: `/package/${row.slug}`,
      status: row.status === 'draft' ? 'draft' : 'published',
      metadata,
      seoData,
    }));
  }

  for (const row of blogRows) {
    const seoData = parseSeoSettings(row.seoSettings);
    const entity = { ...row, seoData };
    const metadata = metadataSnapshot(buildEntityMetadata('blog', entity));
    items.push(auditSingleItem({
      key: `blog:${row.id}`,
      entityType: 'blog',
      entityId: row.id,
      title: row.title,
      slug: row.slug || '',
      route: `/${row.slug || ''}`,
      status: row.isPublished ? 'published' : 'draft',
      metadata,
      seoData,
    }));
  }

  const appendDuplicateIssue = (field: 'title' | 'description', code: string, label: string) => {
    const groups = new Map<string, SeoAuditItem[]>();
    for (const item of items) {
      const value = item.metadata[field].trim().toLowerCase();
      if (!value) continue;
      const group = groups.get(value) || [];
      group.push(item);
      groups.set(value, group);
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      const routes = group.map((entry) => entry.route).join(', ');
      for (const item of group) {
        item.issues.push({ code, severity: 'error', message: `${label} is duplicated across: ${routes}` });
        item.score = Math.max(0, item.score - 22);
      }
    }
  };

  appendDuplicateIssue('title', 'duplicate_title', 'Metadata title');
  appendDuplicateIssue('description', 'duplicate_description', 'Meta description');

  return items.sort((a, b) => a.score - b.score || a.route.localeCompare(b.route));
}
