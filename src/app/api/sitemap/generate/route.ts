import { NextRequest, NextResponse } from 'next/server';
import { generateSitemapXml } from '@/lib/sitemapGenerator';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';
import { db } from '@/db';
import { sitemapLogs } from '@/db/schema';
import { revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings);
    const baseUrl = canonicalOrigin || '/';

    // Test generation to get metrics (this doesn't save to file if we rely on dynamic route,
    // but ensures the code runs and gives us url counts)
    const xml = await generateSitemapXml(baseUrl);

    const urlCount = (xml.match(/<url>/g) || []).length;
    const sizeInBytes = new TextEncoder().encode(xml).length;

    // revalidateTag('sitemap');

    try {
      await db.insert(sitemapLogs).values({
        action: 'generate',
        status: 'success',
        details: {
          totalUrls: urlCount,
          sizeInBytes: sizeInBytes,
        },
        triggeredBy: 'admin',
      });
    } catch (logErr) {
      // Non-blocking log insert
    }

    return NextResponse.json({ success: true, urlCount, sizeInBytes });
  } catch (error: any) {
    console.error('Sitemap Generation Error:', error);

    try {
      await db.insert(sitemapLogs).values({
        action: 'generate',
        status: 'error',
        details: {
          error: error.message,
        },
        triggeredBy: 'admin',
      });
    } catch (logErr) { }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
