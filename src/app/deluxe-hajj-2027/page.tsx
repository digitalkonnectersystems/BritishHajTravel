import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/actions/pageActions';
import { getPackageBySlug } from '@/actions/packageActions';
import PageSectionsRenderer from '@/components/PageSectionsRenderer';
import PackageDetailPageClient from '@/app/package/[slug]/PackageDetailPageClient';

/** This legacy URL must use real admin content, never fixed package prices. */
export default async function LegacyHajjPackagePage() {
  const slug = 'deluxe-hajj-2027';
  const page = await getPageBySlug(`/${slug}`).catch(() => null);
  if (page?.status === 'published') {
    let sections: any[] = [];
    try {
      const parsed = typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections;
      if (Array.isArray(parsed)) sections = parsed;
    } catch { /* No fabricated content when saved section JSON is invalid. */ }
    return <main><PageSectionsRenderer pageData={page} sections={sections} /></main>;
  }
  const pkg = await getPackageBySlug(slug).catch(() => null);
  if (pkg && pkg.status !== 'draft') {
    return <PackageDetailPageClient initialSlug={slug} initialPackage={pkg} />;
  }
  notFound();
}
