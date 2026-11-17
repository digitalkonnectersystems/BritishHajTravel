import { generateSitemapXml } from '@/lib/sitemapGenerator';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';
import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24 hours auto-refresh

export async function GET() {
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings) || 'https://britishhajtravel.com';
    const baseUrl = canonicalOrigin.replace(/\/+$/, '');
    const sitemapXml = await generateSitemapXml(baseUrl);

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
