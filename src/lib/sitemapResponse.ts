import { NextResponse } from 'next/server';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';
import { generateSitemapIndexXml, generateSegmentSitemapXml } from '@/lib/sitemapGenerator';
import { runtimeInfo, runtimeError } from '@/lib/runtimeDiagnostics';
import type { SitemapSegment } from '@/lib/sitemapRules';

/** Serves /sitemap.xml (segment = 'index') or one topic sitemap such as /sitemap-hajj.xml. */
export async function sitemapResponse(segment: SitemapSegment | 'index') {
  const startedAt = Date.now();
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const baseUrl = resolveCanonicalPublicOrigin(seoSettings);
    const xml = segment === 'index'
      ? await generateSitemapIndexXml(baseUrl)
      : await generateSegmentSitemapXml(baseUrl, segment);
    runtimeInfo('sitemap.result', {
      segment, canonicalOrigin: baseUrl, environment: seoSettings?.siteEnvironment,
      urlCount: (xml.match(/<url>/g) || []).length,
      sitemapCount: (xml.match(/<sitemap>/g) || []).length,
      elapsedMs: Date.now() - startedAt, status: 200,
    });
    return new NextResponse(xml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    runtimeError('sitemap.failed', error, { segment, status: 500, elapsedMs: Date.now() - startedAt });
    console.error(`Error generating sitemap (${segment}):`, error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
