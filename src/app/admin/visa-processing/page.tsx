import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { getVisaProcessingList } from '@/actions/visaProcessingActions';
import { requireAdmin } from '@/lib/requireAdmin';
import VisaProcessingListClient from './VisaProcessingListClient';
import { ArrowUpRight, FileCheck2, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export default async function VisaProcessingAdminPage() {
  await requireAdmin(['admin','content_editor','seo_manager']);
  const pages = await getVisaProcessingList();
  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101D83] via-[#172b8f] to-[#263fa6] px-6 py-7 text-white shadow-lg sm:px-8">
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[32px] border-white/5" aria-hidden="true" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue/10 ring-1 ring-blue/20">
                <FileCheck2 className="h-6 w-6 text-primary" />
              </span>
              <div>
                <div className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-red-600">Content management</div>
                <h1 className="m-0 text-2xl font-extrabold text-primary sm:text-3xl">Visa Processing Pages</h1>
                <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Manage country-specific visa pages, edit their public URLs, and control what visitors can see.
                </p>
              </div>
            </div>
            <Link href="/admin/pages/edit?table=visa_processing" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#101D83] shadow-sm transition hover:bg-blue-50">
              <Plus className="h-4 w-4" /> New visa page <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </header>
        <VisaProcessingListClient initialPages={pages} />
      </div>
    </AdminLayout>
  );
}
