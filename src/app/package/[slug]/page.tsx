import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPackageDetailsAction } from '@/actions/pageActions';
import { getPackageBySlug } from '@/actions/packageActions';
import PackageDetailPageClient from './PackageDetailPageClient';
import { buildPackageMetadata, parseSeoSettings, toAbsoluteUrl } from '@/lib/seoMetadata';

async function loadPackage(slug: string) {
  let pkg = await getPackageBySlug(slug).catch(() => null);
  if (!pkg) pkg = await getPackageDetailsAction(slug).catch(() => null);
  return pkg;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await loadPackage(slug);
  if (!pkg) return {};
  return buildPackageMetadata(pkg, slug);
}

export default async function StandalonePackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const initialPackage = await loadPackage(slug);
  if (!initialPackage) notFound();

  const seo = parseSeoSettings(initialPackage.seoSettings);
  let customJsonLd: any = null;
  if (seo.jsonLdPayload) {
    try {
      customJsonLd = typeof seo.jsonLdPayload === 'string' ? JSON.parse(seo.jsonLdPayload) : seo.jsonLdPayload;
    } catch {
      customJsonLd = null;
    }
  }

  const currency = initialPackage.currency === '£' ? 'GBP' : (initialPackage.currency || 'GBP');
  const jsonLd = customJsonLd || {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: initialPackage.title,
    image: toAbsoluteUrl(initialPackage.featuredImage || '/img/logo.png', '/img/logo.png'),
    description: initialPackage.shortDescription || `Travel package from British Hajj Travel UK: ${initialPackage.title}`,
    brand: { '@type': 'Brand', name: 'British Hajj Travel UK' },
    offers: {
      '@type': 'Offer',
      url: toAbsoluteUrl(`/package/${slug}`, `/package/${slug}`),
      priceCurrency: currency,
      price: String(initialPackage.startingPrice || '').replace(/,/g, ''),
      availability: initialPackage.status === 'sold_out' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'British Hajj Travel UK' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <PackageDetailPageClient initialSlug={slug} initialPackage={initialPackage} />
    </>
  );
}
