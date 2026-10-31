import { getPageBySlug } from '@/actions/pageActions';
import { loadCmsSectionContext } from '@/lib/cmsSectionContext';
import AirlinesPageClient from './AirlinesPageClient';
import { buildPageMetadata } from '@/lib/seoMetadata';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug('/airlines').catch(() => null);
  return buildPageMetadata(page || {title: 'Airlines'}, '/airlines');
}
export default async function AirlinesPage() {
  const page = await getPageBySlug('/airlines');
  let sections: any[] = [];
  try { const value = typeof page?.sections === 'string' ? JSON.parse(page.sections) : page?.sections; sections = Array.isArray(value) ? value : []; } catch {}
  const sectionContext = await loadCmsSectionContext(sections);
  return <AirlinesPageClient initialPageData={page} sectionContext={sectionContext} />;
}
