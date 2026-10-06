import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getPageBySlug } from '@/actions/pageActions';
import { buildPageMetadata } from '@/lib/seoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug('/deluxe-hajj-2027').catch(() => null);
  return buildPageMetadata(pageData || { title: 'Deluxe Hajj Package 2027' }, '/deluxe-hajj-2027');
}

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
