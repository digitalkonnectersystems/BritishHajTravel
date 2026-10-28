import AdminLayout from '@/components/admin/AdminLayout';
import MediaLibrary from '@/components/admin/MediaLibrary';
import {getCurrentSession} from '@/lib/auth';
import {redirect} from 'next/navigation';
export default async function MediaPage(){
  const session=await getCurrentSession();
  if(!session)redirect('/letstravel');
  if(!['super_admin','admin','content_editor'].includes(session.role))redirect('/admin/dashboard');
  return <AdminLayout><div className="mx-auto w-full max-w-[1600px] rounded-3xl bg-[#f1f6f5] p-4 sm:p-7"><MediaLibrary /></div></AdminLayout>;
}
