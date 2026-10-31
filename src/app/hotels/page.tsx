import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getHotelDirectory } from '@/actions/hotelActions';
import { getPageBySlug } from '@/actions/pageActions';
import PageBanner from '@/components/PageBanner';
import PageSectionsRenderer from '@/components/PageSectionsRenderer';
import { loadCmsSectionContext } from '@/lib/cmsSectionContext';
import { buildPageMetadata } from '@/lib/seoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('/hotels').catch(() => null);
  return buildPageMetadata(page || { title: 'Hotels', slug: '/hotels' }, '/hotels');
}

export default async function HotelsPage() {
  const [categories, page] = await Promise.all([
    getHotelDirectory(),
    getPageBySlug('/hotels'),
  ]);
  if (page?.status === 'draft') notFound();
  let sections: any[] = [];
  try {
    const stored = typeof page?.sections === 'string' ? JSON.parse(page.sections) : page?.sections;
    sections = Array.isArray(stored) ? stored : [];
  } catch { sections = []; }
  const sectionContext = await loadCmsSectionContext(sections);
  const active = sections.filter(s => s && s.hidden !== true && s.visible !== false);

  return <main className="min-h-screen bg-blue-lt pb-16">
    <PageBanner
      title={page?.bannerTitle || page?.title || 'Hotels in Makkah and Madinah'}
      description={page?.bannerDescription || 'Explore our recommended hotels by city and visit each hotel\'s website for more details and booking information.'}
      bgImage={page?.bannerBgImage || undefined}
      position={page?.bannerPosition || undefined}
      size={page?.bannerSize || undefined}
      heroSettings={page?.seoSettings}
    />
    {active.length ? <PageSectionsRenderer sections={sections} pageData={page} {...sectionContext} initialHotelDirectory={categories} /> :
      <div className="mx-auto max-w-4xl px-5 py-20 text-center text-slate-500">Hotel listings will be available soon.</div>}
  </main>;
}
