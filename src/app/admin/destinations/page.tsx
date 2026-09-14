import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getDestinations } from '@/actions/destinationActions';
import AdminLayout from '@/components/admin/AdminLayout';
import DestinationsClient from '@/components/admin/DestinationsClient';

export default async function AdminDestinationsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  const destinationList = await getDestinations(true);
  return <AdminLayout user={session}><DestinationsClient initialDestinations={destinationList} /></AdminLayout>;
}