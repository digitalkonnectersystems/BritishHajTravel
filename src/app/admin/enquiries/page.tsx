import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { getEnquiriesList } from '@/actions/enquiryActions';
import EnquiriesClient from './EnquiriesClient';

export default async function AdminEnquiriesPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  if (!['super_admin', 'admin', 'enquiry_manager'].includes(session.role)) redirect('/admin/dashboard');

  const list = await getEnquiriesList();

  return (
    <AdminLayout user={session}>
      <EnquiriesClient initialEnquiries={list} />
    </AdminLayout>
  );
}
