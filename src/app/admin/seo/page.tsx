import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { getSeoAuditReportAction } from '@/actions/seoActions';
import SeoAuditClient from './SeoAuditClient';

export const dynamic = 'force-dynamic';

export default async function SeoCenterPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  const report = await getSeoAuditReportAction().catch((error) => {
    console.error('SEO Center initial audit failed:', error);
    return [];
  });

  return (
    <AdminLayout user={session}>
      <SeoAuditClient initialReport={report} />
    </AdminLayout>
  );
}
