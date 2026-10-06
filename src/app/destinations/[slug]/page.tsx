import { notFound } from 'next/navigation';
import { getDestinationBySlug } from '@/actions/destinationActions';
import { getPageBySlug } from '@/actions/pageActions';
import DestinationPageClient from '@/components/DestinationPageClient';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seoMetadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [destination, pageData] = await Promise.all([
    getDestinationBySlug(slug).catch(() => null),
    getPageBySlug(`/destinations/${slug}`).catch(() => null),
  ]);
  return buildPageMetadata(pageData || {
    title: destination?.title || 'Destination',
    metaDescription: destination?.description || undefined,
    bannerBgImage: Array.isArray(destination?.bannerImages) ? destination.bannerImages[0] : undefined,
  }, `/destinations/${slug}`);
}

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();
  const pageData = await getPageBySlug(`/destinations/${slug}`);
  return <DestinationPageClient destination={destination} pageData={pageData} />;
}