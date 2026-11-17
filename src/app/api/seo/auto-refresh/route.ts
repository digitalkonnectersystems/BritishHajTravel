import { NextRequest, NextResponse } from 'next/server';
import { generateSitemapXml } from '@/lib/sitemapGenerator';
import { gatherAllSitemapItems } from '@/lib/sitemapGenerator';
import { getSeoIntelligenceSettings, saveSeoIntelligenceSettingsAction } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';
import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { sitemapLogs } from '@/db/schema';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  return handleAutoRefresh(req);
}

export async function POST(req: NextRequest) {
  return handleAutoRefresh(req);
}

async function handleAutoRefresh(req: NextRequest) {
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings) || 'https://britishhajtravel.com';
    const baseUrl = canonicalOrigin.replace(/\/+$/, '');

    const nowIso = new Date().toISOString();

    // 1. Generate XML Sitemap
    const xml = await generateSitemapXml(baseUrl);
    const urlCount = (xml.match(/<url>/g) || []).length;
    const sizeInBytes = new TextEncoder().encode(xml).length;
    const sizeKb = (sizeInBytes / 1024).toFixed(1);

    // 2. Count LLMs items
    let llmsUrls = 0;
    try {
      const items = await gatherAllSitemapItems(baseUrl);
      llmsUrls = items.length;
    } catch {
      llmsUrls = urlCount || 480;
    }

    // 3. Update database settings with all 3 timestamps
    try {
      await saveSeoIntelligenceSettingsAction({
        ...seoSettings,
        sitemapLastGenerated: nowIso,
        sitemapTotalUrls: urlCount,
        sitemapSizeKb: sizeKb,
        robotsLastGenerated: nowIso,
        llmsLastGenerated: nowIso,
        llmsTotalUrls: llmsUrls,
        lastAutoRefreshAt: nowIso,
      });
    } catch (err) {
      console.warn('Auto-refresh DB update notice:', err);
    }

    // 4. Log sitemap generation
    try {
      await db.insert(sitemapLogs).values({
        action: 'generate',
        status: 'success',
        details: {
          totalUrls: urlCount,
          sizeInBytes,
          source: '24h_auto_refresh',
        },
        triggeredBy: 'system_auto_24h',
      });
    } catch {}

    // 5. Revalidate cache tags and paths
    revalidatePath('/sitemap.xml');
    revalidatePath('/robots.txt');
    revalidatePath('/llms.txt');

    return NextResponse.json({
      success: true,
      autoRefreshedAt: nowIso,
      entities: {
        sitemap: { totalUrls: urlCount, sizeKb, path: '/sitemap.xml' },
        robots: { path: '/robots.txt', status: 'refreshed' },
        llms: { eligibleUrls: llmsUrls, path: '/llms.txt' },
      },
      nextAutoRefreshInSeconds: 86400,
      cadence: '24_hours',
    });
  } catch (error: any) {
    console.error('SEO 24h Auto-Refresh Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Auto-refresh failed' },
      { status: 500 }
    );
  }
}
