import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getVisaServicesList } from '@/actions/visaActions';
import VisasClient from './VisasClient';

export default async function AdminVisasPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  const visas = await getVisaServicesList();

  return (
    <AdminLayout user={session}>
      <VisasClient initialVisas={visas} />
    </AdminLayout>
  );
}
