'use client';

import PackageDetailPageClient from '@/app/package/[slug]/PackageDetailPageClient';
import { mergeDestinationHotelSlots } from '@/lib/destinationAccommodation';

export default function DestinationPageClient({ destination, pageData }: { destination: any; packages?: any[]; pageData?: any }) {
  const packageData = destination.packageData || destination.packagesData?.[0] || {
    title: destination.title,
    cardData: {},
    detailPageData: {},
  };

  const detailPageData = mergeDestinationHotelSlots(packageData.detailPageData, packageData.cardData);
  return <PackageDetailPageClient isDestination initialSlug={destination.slug} initialPackage={{ ...packageData, detailPageData, status: packageData.status || 'available', title: packageData.title || destination.title, destination: destination.title }} />;
}