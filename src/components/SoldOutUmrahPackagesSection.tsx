'use client';

import SoldOutCategorySection from '@/components/SoldOutCategorySection';

export default function SoldOutUmrahPackagesSection({ data, initialPackages }: { data?: any; initialPackages?: any[] }) {
  return <SoldOutCategorySection packageType="umrah" data={data} initialPackages={initialPackages} />;
}
