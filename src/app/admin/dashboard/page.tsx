import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getEnquiriesList } from '@/actions/enquiryActions';
import { getAllPackages } from '@/actions/packageActions';
import { getVisaServicesList } from '@/actions/visaActions';
import { getPagesList } from '@/actions/pageActions';
import { getUsersList } from '@/actions/userActions';
import { getRecentActivities } from '@/actions/activityActions';
import DashboardClient from './DashboardClient';

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  const enquiries = await getEnquiriesList();
  const packages = await getAllPackages();
  const visas = await getVisaServicesList();
  const pages = await getPagesList();
  const usersList = await getUsersList();
  const activities = await getRecentActivities(10);

  return (
    <AdminLayout user={session}>
      <DashboardClient
        session={session}
        initialEnquiries={enquiries}
        initialPackages={packages}
        initialVisas={visas}
        initialPages={pages}
        initialUsers={usersList}
        initialActivities={activities}
      />
    </AdminLayout>
  );
}
