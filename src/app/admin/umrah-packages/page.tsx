import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAllPackages } from '@/actions/packageActions';
import PackagesClient from '@/components/admin/PackagesClient';

export default async function AdminUmrahPackagesPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  const packagesList = await getAllPackages();

  return (
    <AdminLayout user={session}>
      <PackagesClient initialPackages={packagesList} defaultTab="umrah" />
    </AdminLayout>
  );
}
