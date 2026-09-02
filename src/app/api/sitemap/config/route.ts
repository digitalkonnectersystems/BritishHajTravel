import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sitemapConfigs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const configs = await db.select().from(sitemapConfigs);
    return NextResponse.json({ success: true, configs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { configs } = body; // Array of config objects

    if (!Array.isArray(configs)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    for (const conf of configs) {
      const existing = await db.select().from(sitemapConfigs).where(eq(sitemapConfigs.contentType, conf.contentType));
      
      if (existing.length > 0) {
        await db.update(sitemapConfigs)
          .set({
            includeInSitemap: conf.includeInSitemap,
            changeFrequency: conf.changeFrequency,
            priority: conf.priority,
            includeImages: conf.includeImages,
            includeLastModified: conf.includeLastModified,
          })
          .where(eq(sitemapConfigs.contentType, conf.contentType));
      } else {
        await db.insert(sitemapConfigs).values({
          contentType: conf.contentType,
          includeInSitemap: conf.includeInSitemap,
          changeFrequency: conf.changeFrequency,
          priority: conf.priority,
          includeImages: conf.includeImages,
          includeLastModified: conf.includeLastModified,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
