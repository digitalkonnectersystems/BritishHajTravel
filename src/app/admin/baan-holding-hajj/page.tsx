import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getBaanContentForAdmin } from '@/actions/baanActions';
import BaanEditor from '@/components/baan/BaanEditor';

export default async function BaanAdminPage() {
  const session = await getCurrentSession();
  if (!session || !['super_admin', 'admin', 'content_editor', 'seo_manager'].includes(session.role)) {
    redirect('/letstravel');
  }

  const initial = await getBaanContentForAdmin();
  return (
    <AdminLayout user={session}>
      {initial ? (
        <BaanEditor initial={initial} />
      ) : (
        <div role="alert" className="mx-auto my-8 max-w-2xl rounded-xl border border-amber-300 bg-amber-50 p-6 text-slate-900">
          <h1 className="text-xl font-semibold">BAAN settings temporarily unavailable</h1>
          <p className="mt-2 text-sm">
            The database settings could not be read. Editing is disabled to avoid replacing
            previously saved page content. Check the Vercel server logs and database connection,
            then reload this page.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
