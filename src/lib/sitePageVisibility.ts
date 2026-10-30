import 'server-only';

import { db } from '@/db';
import { sitePages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getHiddenSitePagePaths(): Promise<string[]> {
  try {
    const pages = await db
      .select({ slug: sitePages.slug })
      .from(sitePages)
      .where(eq(sitePages.status, 'draft'));
    return pages.map((page) => page.slug);
  } catch (error) {
    console.error('[pages] Unable to retrieve hidden page paths', error);
    return [];
  }
}
