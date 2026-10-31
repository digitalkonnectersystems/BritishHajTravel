import { notFound } from 'next/navigation';
import { getDestinations } from '@/actions/destinationActions';
import { getPageBySlug } from '@/actions/pageActions';
import PageBanner from '@/components/PageBanner';
import PageSectionsRenderer from '@/components/PageSectionsRenderer';
import { loadCmsSectionContext } from '@/lib/cmsSectionContext';
import DestinationsPageSection from '@/components/DestinationsPageSection';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug('/destinations').catch(() => null);
  return buildPageMetadata(pageData || { title: 'Destinations' }, '/destinations');
}

export default async function DestinationsPage() {
  const [destinations, pageData] = await Promise.all([getDestinations(), getPageBySlug('/destinations')]);
  if (pageData?.status === 'draft') notFound();
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

  let sections: any[] = [];
  try { const stored = typeof pageData?.sections === 'string' ? JSON.parse(pageData.sections) : pageData?.sections; sections = Array.isArray(stored) ? stored : []; } catch { sections = []; }
  const sectionContext = await loadCmsSectionContext(sections);
  const hasVisibleSections = sections.some(s => s?.type && s.hidden !== true && s.visible !== false);
  return (
    <main className="bg-blue-lt min-h-screen">
      <PageBanner title={pageData?.bannerTitle || 'Destinations'} description={pageData?.bannerDescription || ''} bgImage={pageData?.bannerBgImage || undefined} position={pageData?.bannerPosition || undefined} size={pageData?.bannerSize || undefined} heroSettings={pageData?.seoSettings} />
      {hasVisibleSections ? sections.filter((sec: any) => sec?.type && sec.hidden !== true && sec.visible !== false).map((sec: any, index: number) =>
        sec.type === 'Destinations Grid'
          ? <DestinationsPageSection key={sec.id || index}
              data={{ eyebrow: sec.data?.eyebrow || 'DESTINATIONS', title: sec.data?.title || pageData?.title || 'Destination Packages', description: sec.data?.description || '' }}
              initialPackages={destinationPackages} />
          : <PageSectionsRenderer key={sec.id || index} sections={[sec]} pageData={pageData} {...sectionContext} />
      ) : <DestinationsPageSection
        data={{
          eyebrow: 'DESTINATIONS',
          title: pageData?.title || 'Destination Packages',
          description: 'Explore destination packages with complete travel arrangements, accommodation, and support.',
        }}
        initialPackages={destinationPackages}
      />}
    </main>
  );
}