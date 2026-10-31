import type { Metadata } from 'next';
import DynamicPage, { generateMetadata as generateCmsMetadata } from '@/app/[...slug]/page';
import { toCanonicalUrl } from '@/lib/seoMetadata';

// /flights is CMS-driven and must not serve a stale not-found response.
export const dynamic = 'force-dynamic';

// Page ID 6 in the current CMS database is published at /flights.
// Render only the published CMS record whose slug is /flights.
const cmsParams = Promise.resolve({ slug: ['flights'] });

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await generateCmsMetadata({ params: cmsParams });
  const canonical = toCanonicalUrl(null, '/flights');

  return {
    ...metadata,
    alternates: { ...metadata.alternates, canonical },
    openGraph: metadata.openGraph
      ? { ...metadata.openGraph, url: canonical }
      : undefined,
  };
}

export default function FlightsPage() {
  return <DynamicPage params={cmsParams} />;
}
