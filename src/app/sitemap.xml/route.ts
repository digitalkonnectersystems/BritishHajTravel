import { generateSitemapXml } from '@/lib/sitemapGenerator';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';
import { NextResponse } from 'next/server';
import { runtimeInfo, runtimeError } from '@/lib/runtimeDiagnostics';

// Revalidate this route according to cache preferences
export const revalidate = 0; // Environment switches must update sitemap immediately.

export async function GET() {
  const startedAt = Date.now();
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings);
    const baseUrl = canonicalOrigin;
    const sitemapXml = await generateSitemapXml(baseUrl);
    runtimeInfo('sitemap.result', {
      canonicalOrigin, environment: seoSettings?.siteEnvironment,
      urlCount: (sitemapXml.match(/<url>/g) || []).length,
      hasHajj2027: /<loc>https?:\/\/[^<]+\/hajj-2027\/?<\/loc>/.test(sitemapXml),
      elapsedMs: Date.now() - startedAt,
      status: 200,
    });

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    runtimeError('sitemap.failed', error, { status: 500, elapsedMs: Date.now() - startedAt });
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
