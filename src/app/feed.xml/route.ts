import { createRssResponse } from '@/lib/rssFeed';

/** Alternative RSS URL for readers that expect an .xml extension. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return createRssResponse();
}
