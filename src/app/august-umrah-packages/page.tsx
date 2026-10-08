import type { Metadata } from 'next';
import SeasonalUmrahLanding from '@/components/seasonal/SeasonalUmrahLanding';
import { seasonalUmrahPages } from '@/lib/seasonalUmrah';
import { getPackagesByType, getPackageBySlug } from '@/actions/packageActions';

export const metadata: Metadata = {
  title: 'August Umrah Packages 2026 | British Haj Travel',
  description: 'View the August 2026 Umrah package archive, its original hotel arrangements, room options and request availability for future Umrah departures.',
  alternates: { canonical: '/august-umrah-packages/' },
};
export default async function AugustUmrahPackagesPage() {
  const all = await getPackagesByType('umrah').catch(() => []);
  const novemberPackages = all.filter((p: any) => /november/i.test(`${p.title} ${p.month}`) && p.status !== 'draft').slice(0, 2).map((p: any) => ({ label: p.title, href: `/${p.slug}` }));
  const packageSlugs = ['umrah-package-august-2026'];
  const matches = await Promise.all(packageSlugs.map(slug => getPackageBySlug(slug)));
  const historicPackages = matches.filter((p): p is NonNullable<typeof p> => Boolean(p && p.type === 'umrah'));
  return <SeasonalUmrahLanding data={seasonalUmrahPages.august} packages={historicPackages} novemberPackages={novemberPackages} />;
}
