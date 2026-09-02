import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sitemapLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await db.select().from(sitemapLogs).orderBy(desc(sitemapLogs.createdAt)).limit(50);
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
