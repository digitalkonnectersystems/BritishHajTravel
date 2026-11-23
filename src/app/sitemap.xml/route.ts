import { sitemapResponse } from '@/lib/sitemapResponse';

// Environment switches must update the sitemap immediately.
export const revalidate = 0;

/** Sitemap index: lists /sitemap-pages.xml, -hajj, -umrah, -visa, -guides and -blog. */
export async function GET() {
  return sitemapResponse('index');
}
