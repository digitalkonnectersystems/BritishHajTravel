import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getDashboardRecentEnquiriesAction } from '@/actions/dashboardRealtimeActions';
import { getAllPackages } from '@/actions/packageActions';
import { getVisaServicesList } from '@/actions/visaActions';
import { getPagesList } from '@/actions/pageActions';
import { getUsersList } from '@/actions/userActions';
import { getRecentActivities } from '@/actions/activityActions';
import DashboardClient from './DashboardClient';
import { getDashboardRealtimeAction } from '@/actions/dashboardRealtimeActions';
import { getSeoAuditReportAction } from '@/actions/seoActions';

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  const enquiries = ['super_admin', 'admin', 'enquiry_manager'].includes(session.role) ? await getDashboardRecentEnquiriesAction() : [];
  const packages = await getAllPackages();
  const visas = await getVisaServicesList();
  const pages = await getPagesList();
  const usersList = ['super_admin', 'admin'].includes(session.role) ? await getUsersList() : [];
  const activities = await getRecentActivities(10);

  const realtime = await getDashboardRealtimeAction().catch(() => null);
  const seoAudit = ['super_admin', 'admin', 'seo_manager', 'content_editor'].includes(session.role) ? await getSeoAuditReportAction().catch(() => []) : [];

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
        initialSeoAudit={seoAudit}
        initialRealtime={realtime}
      />
    </AdminLayout>
  );
}
