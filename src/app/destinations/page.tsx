import { getDestinations } from '@/actions/destinationActions';
import { getPageBySlug } from '@/actions/pageActions';
import PageBanner from '@/components/PageBanner';
import DestinationsPageSection from '@/components/DestinationsPageSection';

export default async function DestinationsPage() {
  const [destinations, pageData] = await Promise.all([getDestinations(), getPageBySlug('/destinations')]);
  const destinationPackages = destinations
    .map((destination: any) => ({ destination, pkg: destination.packageData || destination.packagesData?.[0] || null }))
    .filter(({ pkg }: any) => pkg && pkg.status !== 'draft' && pkg.status !== 'sold_out')
    .map(({ destination, pkg }: any) => {
      return {
        ...pkg,
        destinationTitle: destination.title,
        destinationSlug: destination.slug,
        cardData: typeof pkg.cardData === 'string' ? pkg.cardData : {
          ...(pkg.cardData || {}),
          destination: pkg.destination || destination.title,
        },
      };
    });

  return (
    <main className="bg-blue-lt min-h-screen">
      <PageBanner title={pageData?.bannerTitle || 'Destinations'} description={pageData?.bannerDescription || ''} bgImage={pageData?.bannerBgImage || undefined} position={pageData?.bannerPosition || undefined} size={pageData?.bannerSize || undefined} />
      <DestinationsPageSection
        data={{
          eyebrow: 'DESTINATIONS',
          title: pageData?.title || 'Destination Packages',
          description: 'Explore destination packages with complete travel arrangements, accommodation, and support.',
        }}
        initialPackages={destinationPackages}
      />
    </main>
  );
}