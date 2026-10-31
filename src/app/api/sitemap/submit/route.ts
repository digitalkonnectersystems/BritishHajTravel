import { getCurrentSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sitemapLogs } from '@/db/schema';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin, getSiteEnvironment } from '@/lib/urlResolver';

export async function POST() {
  const session = await getCurrentSession();
  if (!session || !['super_admin', 'admin', 'seo_manager'].includes(session.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings);
    // Never submit a staging sitemap to search engines.
    if (getSiteEnvironment(seoSettings) !== 'production') {
      return NextResponse.json({ success: false, error: 'Sitemap submission is disabled in staging mode.' }, { status: 400 });
    }
    const baseUrl = canonicalOrigin;
    const sitemapUrl = `${baseUrl}/sitemap.xml`;

    // Ping Google
    const googleRes = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);
    // Ping Bing
    const bingRes = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`);

    await db.insert(sitemapLogs).values({
      action: 'submit',
      status: (googleRes.ok && bingRes.ok) ? 'success' : 'warning',
      details: {
        googleStatus: googleRes.status,
        bingStatus: bingRes.status,
      },
      triggeredBy: 'admin',
    });

    return NextResponse.json({
      success: true,
      google: googleRes.ok,
      bing: bingRes.ok
    });
  } catch (error: any) {
    await db.insert(sitemapLogs).values({
      action: 'submit',
      status: 'error',
      details: { error: error.message },
      triggeredBy: 'admin',
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
