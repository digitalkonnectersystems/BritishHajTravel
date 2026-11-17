import { getCurrentSession } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { generateSitemapXml } from '@/lib/sitemapGenerator';
import { getSeoIntelligenceSettings, saveSeoIntelligenceSettingsAction } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';
import { db } from '@/db';
import { sitemapLogs } from '@/db/schema';
import { revalidatePath } from 'next/cache';

const COOLDOWN_SECONDS = 300;
let lastGenerationTime = 0;

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || !['super_admin', 'admin', 'seo_manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const elapsed = (now - lastGenerationTime) / 1000;
  let isForced = false;
  try {
    const body = await req.json().catch(() => ({}));
    isForced = Boolean(body?.force);
  } catch {
    // empty body is fine
  }

  if (!isForced && elapsed < COOLDOWN_SECONDS) {
    const remaining = Math.ceil(COOLDOWN_SECONDS - elapsed);
    return NextResponse.json(
      {
        success: false,
        error: `Cooldown active. Please wait ${remaining}s before refreshing again.`,
        cooldownRemaining: remaining,
      },
      { status: 429 }
    );
  }

  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings) || 'https://britishhajtravel.com';
    const baseUrl = canonicalOrigin.replace(/\/+$/, '');

    const xml = await generateSitemapXml(baseUrl);

    const urlCount = (xml.match(/<url>/g) || []).length;
    const sizeInBytes = new TextEncoder().encode(xml).length;
    lastGenerationTime = now;

    // Update last generated timestamp in SEO settings
    try {
      await saveSeoIntelligenceSettingsAction({
        ...seoSettings,
        sitemapLastGenerated: new Date().toISOString(),
        sitemapTotalUrls: urlCount,
        sitemapSizeKb: (sizeInBytes / 1024).toFixed(1),
      });
    } catch {
      // Non-blocking
    }

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
    } catch {
      // Non-blocking log insert
    }

    revalidatePath('/sitemap.xml');

    return NextResponse.json({
      success: true,
      urlCount,
      sizeInBytes,
      lastGenerated: new Date().toISOString(),
      cooldownSeconds: COOLDOWN_SECONDS,
    });
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
    } catch {}

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
