'use client';

import DestinationsPageSection from '@/components/DestinationsPageSection';
import PageBanner from '@/components/PageBanner';

export default function DestinationPageClient({ destination, packages, pageData }: { destination: any; packages: any[]; pageData?: any }) {
  return (
    <main className="bg-white">
      <PageBanner
        title={pageData?.bannerTitle || destination.title}
        description={pageData?.bannerDescription || destination.description || ''}
        bgImage={pageData?.bannerBgImage || undefined}
        position={pageData?.bannerPosition || undefined}
        size={pageData?.bannerSize || undefined}
      />
      <DestinationsPageSection
        data={{
          destinationName: destination.title,
          packageIds: destination.packageIds,
          title: destination.sectionTitle || `Packages for ${destination.title}`,
          description: `Explore our carefully selected packages for ${destination.title}.`,
          buttonLabel: `Book ${destination.title}`,
        }}
        initialPackages={packages}
      />
    </main>
  );
}