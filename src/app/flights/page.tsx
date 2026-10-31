import type { Metadata } from 'next';
import DynamicPage, { generateMetadata as generateCmsMetadata } from '@/app/[...slug]/page';
import { toCanonicalUrl } from '@/lib/seoMetadata';

// Keep the existing CMS database record and its content. Only the public URL
// changes. This is a direct server render, not a redirect or client navigation.
const cmsParams = Promise.resolve({ slug: ['cheap-flights-air-tickets'] });

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
