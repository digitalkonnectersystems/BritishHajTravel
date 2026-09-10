import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getDestinations } from '@/actions/destinationActions';
import { getAllPackages } from '@/actions/packageActions';
import AdminLayout from '@/components/admin/AdminLayout';
import DestinationsClient from '@/components/admin/DestinationsClient';

export default async function AdminDestinationsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  const [destinationList, packageList] = await Promise.all([getDestinations(true), getAllPackages()]);
  return <AdminLayout user={session}><DestinationsClient initialDestinations={destinationList} packages={packageList} /></AdminLayout>;
}