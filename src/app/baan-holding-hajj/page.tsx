import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBaanContent } from '@/actions/baanActions';
import { getPageBySlug } from '@/actions/pageActions';
import PageSectionsRenderer from '@/components/PageSectionsRenderer';
import BaanLanding from '@/components/baan/BaanLanding';
export const metadata: Metadata = { title: 'BAAN Holding Hajj Packages 2027 | British Haj Travel', description: 'Enquire about selected BAAN Holding Hajj 2027 packages through British Haj Travel, a UK reseller.' };
export default async function BaanPage() {
  const content = await getBaanContent();
  if (!content.isVisible) notFound();

  // BAAN has a dedicated route, so explicitly load CMS sections here. Without
  // this, sections added through Admin > Pages never appear on the BAAN page.
  const cmsPage = await getPageBySlug('/baan-holding-hajj');
  let sections: any[] = [];
  if (cmsPage?.status === 'published' && cmsPage.sections) {
    if (Array.isArray(cmsPage.sections)) {
      sections = cmsPage.sections;
    } else {
      try {
        const parsed: unknown = JSON.parse(String(cmsPage.sections));
        if (Array.isArray(parsed)) sections = parsed;
      } catch {
        // Invalid CMS section JSON must not hide the dedicated BAAN page.
      }
    }
  }

  return <BaanLanding content={content} pageSections={sections.length > 0
    ? <PageSectionsRenderer sections={sections} pageData={cmsPage} />
    : null} />;
}
