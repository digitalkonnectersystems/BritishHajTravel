'use client';

import SoldOutCategorySection from '@/components/SoldOutCategorySection';

export default function SoldOutHajjPackagesSection({ data, initialPackages }: { data?: any; initialPackages?: any[] }) {
  return <SoldOutCategorySection packageType="hajj" data={data} initialPackages={initialPackages} />;
}
