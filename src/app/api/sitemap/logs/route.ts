import { getCurrentSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sitemapLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentSession();
  if (!session || !['super_admin', 'admin', 'seo_manager'].includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const logs = await db.select().from(sitemapLogs).orderBy(desc(sitemapLogs.createdAt)).limit(50);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
