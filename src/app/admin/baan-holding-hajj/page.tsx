import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getBaanContent } from '@/actions/baanActions';
import BaanEditor from '@/components/baan/BaanEditor';
export default async function BaanAdminPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  return <AdminLayout user={session}><BaanEditor initial={await getBaanContent()} /></AdminLayout>;
}
