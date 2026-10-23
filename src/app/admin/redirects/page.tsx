import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getCurrentSession } from '@/lib/auth';
import { listRedirectsAction } from '@/actions/redirectActions';
import RedirectsClient from './RedirectsClient';
export const dynamic='force-dynamic';
export default async function RedirectsPage() {
 const session = await getCurrentSession();
 if (!session) redirect('/letstravel');
 if (!['super_admin','admin','content_editor'].includes(session.role)) redirect('/admin/dashboard');
 const {rules,hits}=await listRedirectsAction();
 return <AdminLayout user={session}><RedirectsClient initialRules={rules} initialHits={hits}/></AdminLayout>;
}
