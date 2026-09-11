import { getDestinations } from '@/actions/destinationActions';
import DestinationsGrid from '@/components/DestinationsGrid';
import { getPageBySlug } from '@/actions/pageActions';
import PageBanner from '@/components/PageBanner';
import PageSectionsRenderer from '@/components/PageSectionsRenderer';

export default async function DestinationsPage() {
  const [destinations, pageData] = await Promise.all([getDestinations(), getPageBySlug('/destinations')]);
  let sections: any[] = [];
  try { sections = pageData?.sections ? (typeof pageData.sections === 'string' ? JSON.parse(pageData.sections) : pageData.sections) : []; } catch { sections = []; }
  return (
    <main className="bg-sage min-h-screen">
      <PageBanner title={pageData?.bannerTitle || 'Destinations'} description={pageData?.bannerDescription || ''} bgImage={pageData?.bannerBgImage || undefined} position={pageData?.bannerPosition || undefined} size={pageData?.bannerSize || undefined} />
      {sections.length > 0 ? <PageSectionsRenderer sections={sections} pageData={pageData} initialDestinationData={destinations} /> : <DestinationsGrid destinations={destinations} />}
    </main>
  );
}