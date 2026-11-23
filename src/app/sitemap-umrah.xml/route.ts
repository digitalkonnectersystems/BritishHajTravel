import { sitemapResponse } from '@/lib/sitemapResponse';

export const revalidate = 0;

export async function GET() {
  return sitemapResponse('umrah');
}
