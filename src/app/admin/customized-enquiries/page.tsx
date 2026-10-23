import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { getCustomizedEnquiriesAction } from '@/actions/customizedPackageActions';
import AdminLayout from '@/components/admin/AdminLayout';
import CustomizedEnquiriesClient from './CustomizedEnquiriesClient';

export const dynamic = 'force-dynamic';
export default async function CustomizedEnquiriesPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  if (!['super_admin', 'admin', 'enquiry_manager'].includes(session.role)) redirect('/admin/dashboard');
  const enquiries = await getCustomizedEnquiriesAction();
  return <AdminLayout user={session}><CustomizedEnquiriesClient initialRows={enquiries}/></AdminLayout>;
}
