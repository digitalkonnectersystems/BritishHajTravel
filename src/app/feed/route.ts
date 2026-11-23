import { createRssResponse } from '@/lib/rssFeed';

/** WordPress-compatible RSS URL: https://www.britishhajtravel.com/feed/ */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return createRssResponse();
}
