import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getPageBySlug } from '@/actions/pageActions';
import { buildPageMetadata } from '@/lib/seoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug('/economy-hajj-2027').catch(() => null);
  return buildPageMetadata(pageData || { title: 'Economy Hajj Package 2027' }, '/economy-hajj-2027');
}

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
