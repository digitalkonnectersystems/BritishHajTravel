import { generateSitemapXml } from '@/lib/sitemapGenerator';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';
import { NextResponse } from 'next/server';

// Revalidate this route according to cache preferences
export const revalidate = 0; // Environment switches must update sitemap immediately.

export async function GET() {
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings);
    const baseUrl = canonicalOrigin;
    const sitemapXml = await generateSitemapXml(baseUrl);

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
