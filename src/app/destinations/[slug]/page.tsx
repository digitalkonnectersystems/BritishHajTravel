import { notFound } from 'next/navigation';
import { getDestinationBySlug } from '@/actions/destinationActions';
import { getPackagesByIds } from '@/actions/packageActions';
import { getPageBySlug } from '@/actions/pageActions';
import DestinationPageClient from '@/components/DestinationPageClient';

export default async function DestinationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) notFound();
  const packages = await getPackagesByIds(destination.packageIds || []);
  const pageData = await getPageBySlug(`/destinations/${slug}`);
  return <DestinationPageClient destination={destination} packages={packages} pageData={pageData} />;
}