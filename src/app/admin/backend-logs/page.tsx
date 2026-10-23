import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { listBackendLogsAction } from '@/actions/backendLogActions';
import BackendLogsClient from './BackendLogsClient';
export const dynamic='force-dynamic';
export default async function BackendLogsPage() {
 const session=await getCurrentSession();
 if(!session) redirect('/letstravel');
 if(!['super_admin','admin'].includes(session.role)) redirect('/admin/dashboard');
 const logs=await listBackendLogsAction();
 return <AdminLayout user={session}><BackendLogsClient logs={logs}/></AdminLayout>;
}
