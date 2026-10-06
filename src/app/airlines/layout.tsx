import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getPageBySlug } from '@/actions/pageActions';
import { buildPageMetadata } from '@/lib/seoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getPageBySlug('/airlines').catch(() => null);
  return buildPageMetadata(pageData || { title: 'Flights & Airline Tickets' }, '/airlines');
}

export default function RouteLayout({ children }: { children: ReactNode }) {
  return children;
}
