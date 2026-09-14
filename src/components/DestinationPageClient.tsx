'use client';

import PackageDetailPageClient from '@/app/package/[slug]/PackageDetailPageClient';

export default function DestinationPageClient({ destination, pageData }: { destination: any; packages?: any[]; pageData?: any }) {
  const packageData = destination.packageData || destination.packagesData?.[0] || {
    title: destination.title,
    cardData: {},
    detailPageData: {},
  };

  return <PackageDetailPageClient initialSlug={destination.slug} initialPackage={{ ...packageData, title: packageData.title || destination.title, destination: destination.title }} initialSeo={null} />;
}