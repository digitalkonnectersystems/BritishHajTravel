import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ActivityLogsClient from './ActivityLogsClient';
import { getRecentActivities } from '@/actions/activityActions';

export default async function AdminActivityPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  const activities = await getRecentActivities(100);

  return (
    <AdminLayout user={session}>
      <ActivityLogsClient initialActivities={activities} />
    </AdminLayout>
  );
}
