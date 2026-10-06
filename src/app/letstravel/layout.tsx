import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getPageBySlug } from '@/actions/pageActions';
import { buildPageMetadata } from '@/lib/seoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug('/letstravel').catch(() => null);
  return buildPageMetadata(pageData || { title: 'Let’s Travel' }, '/letstravel');
}

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
