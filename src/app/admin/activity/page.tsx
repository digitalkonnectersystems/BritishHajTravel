import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ActivityLogsClient from './ActivityLogsClient';
import { getRecentActivities } from '@/actions/activityActions';
import { getActivityAnalyticsAction } from '@/actions/activityAnalyticsActions';

export default async function AdminActivityPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  const activities = await getRecentActivities(300, '14d');
  const initialAnalytics = await getActivityAnalyticsAction('14d').catch(() => null);

  return (
    <AdminLayout user={session}>
      <ActivityLogsClient initialActivities={activities} initialAnalytics={initialAnalytics} canExport={session.role === 'super_admin' || session.role === 'admin'} />
    </AdminLayout>
  );
}
