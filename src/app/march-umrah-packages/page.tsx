import type { Metadata } from 'next';
import SeasonalUmrahLanding from '@/components/seasonal/SeasonalUmrahLanding';
import { seasonalUmrahPages } from '@/lib/seasonalUmrah';
import { getPackagesByType, getPackageBySlug } from '@/actions/packageActions';

export const metadata: Metadata = {
  title: 'March Umrah Packages 2026 | British Haj Travel',
  description: 'Explore the historic March 2026 Umrah itineraries, Makkah and Madinah hotel details, room options and request current package availability.',
  alternates: { canonical: '/march-umrah-packages/' },
};
export default async function MarchUmrahPackagesPage() {
  const all = await getPackagesByType('umrah').catch(() => []);
  const novemberPackages = all.filter((p: any) => /november/i.test(`${p.title} ${p.month}`) && p.status !== 'draft').slice(0, 2).map((p: any) => ({ label: p.title, href: `/${p.slug}` }));
  const packageSlugs = ['ramadhan-umrah-package-march-2026', 'umrah-package-march-2026'];
  const matches = await Promise.all(packageSlugs.map(slug => getPackageBySlug(slug)));
  const historicPackages = matches.filter((p): p is NonNullable<typeof p> => Boolean(p && p.type === 'umrah'));
  return <SeasonalUmrahLanding data={seasonalUmrahPages.march} packages={historicPackages} novemberPackages={novemberPackages} />;
}
