import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getPackagesByIds } from '@/actions/packageActions';
import EditPackageClient from './EditPackageClient';

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  const paramsObj = await params;
  const pkgId = parseInt(paramsObj.id);
  if (isNaN(pkgId)) redirect('/admin/hajj-packages');

  const packages = await getPackagesByIds([pkgId]);
  const pkg = packages[0];
  
  if (!pkg) redirect('/admin/hajj-packages');

  return (
    <AdminLayout user={session}>
      <EditPackageClient packageData={pkg} />
    </AdminLayout>
  );
}
