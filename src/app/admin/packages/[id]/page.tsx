import { getCurrentSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getPackageForAdmin } from '@/actions/packageActions';
import EditPackageClient from './EditPackageClient';

export default async function EditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  if (!['super_admin', 'admin', 'content_editor', 'seo_manager'].includes(session.role)) {
    redirect('/admin/dashboard');
  }

  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  const pkgId = Number(id);
  if (!Number.isSafeInteger(pkgId)) notFound();

  const pkg = await getPackageForAdmin(pkgId);
  if (!pkg) notFound();

  return (
    <AdminLayout user={session} activeNavHref={pkg.type === 'hajj' ? '/admin/hajj-packages' : '/admin/umrah-packages'}>
      <EditPackageClient packageData={pkg} />
    </AdminLayout>
  );
}
