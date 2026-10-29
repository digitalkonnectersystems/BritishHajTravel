'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Link2,
  LoaderCircle,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  deleteVisaProcessingAction,
  duplicateVisaProcessingAction,
  updateVisaProcessingSlugAction,
  updateVisaProcessingVisibilityAction,
} from '@/actions/visaProcessingActions';

type VisaProcessingPage = { id: number; title: string; slug: string; status: string };

export default function VisaProcessingListClient({ initialPages }: { initialPages: VisaProcessingPage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [slugDrafts, setSlugDrafts] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const visiblePages = pages.filter((page) => {
    const matchesText = `${page.title} ${page.slug}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesText && matchesStatus;
  });

  const updateSlug = async (page: VisaProcessingPage) => {
    const slug = (slugDrafts[page.id] ?? page.slug).trim();
    if (slug === page.slug) return;
    setBusy(page.id);
    setError('');
    setMessage('');
    try {
      const result = await updateVisaProcessingSlugAction(page.id, slug);
      if (!result.success || !result.slug) {
        setError(result.error || 'Unable to update the public URL.');
        return;
      }
      setPages((current) => current.map((item) => item.id === page.id ? { ...item, slug: result.slug! } : item));
      setSlugDrafts((current) => {
        const next = { ...current };
        delete next[page.id];
        return next;
      });
      setMessage(`Public URL updated for ${page.title}.`);
      router.refresh();
    } catch {
      setError('Unable to update the public URL. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const toggleVisibility = async (page: VisaProcessingPage) => {
    setBusy(page.id);
    setError('');
    setMessage('');
    try {
      const result = await updateVisaProcessingVisibilityAction(page.id, page.status !== 'published');
      if (!result.success || !result.status) {
        setError(result.error || 'Unable to update page visibility.');
        return;
      }
      setPages((current) => current.map((item) => item.id === page.id ? { ...item, status: result.status! } : item));
      setMessage(`${page.title} is now ${result.status === 'published' ? 'visible' : 'hidden'} on the frontend.`);
      router.refresh();
    } catch {
      setError('Unable to update page visibility. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const duplicatePage = async (page: VisaProcessingPage) => {
    setBusy(page.id);
    setError('');
    setMessage('');
    try {
      const result = await duplicateVisaProcessingAction(page.id);
      if (!result.success || !result.page) {
        setError(result.error || 'Unable to duplicate the page.');
        return;
      }
      setPages((current) => [result.page!, ...current]);
      setMessage(`Created draft copy: ${result.page.title}.`);
      router.refresh();
    } catch {
      setError('Unable to duplicate the page. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const deletePage = async (page: VisaProcessingPage) => {
    if (!window.confirm(`Permanently delete "${page.title}"? This cannot be undone.`)) return;
    setBusy(page.id);
    setError('');
    setMessage('');
    try {
      const result = await deleteVisaProcessingAction(page.id);
      if (!result.success) {
        setError(result.error || 'Unable to delete the page.');
        return;
      }
      setPages((current) => current.filter((item) => item.id !== page.id));
      setMessage(`${page.title} deleted.`);
      router.refresh();
    } catch {
      setError('Unable to delete the page. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#020e43]">All pages</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-900">{pages.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Visible on frontend</div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-900">{pages.filter((page) => page.status === 'published').length}</div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700">Hidden drafts</div>
          <div className="mt-2 text-3xl font-extrabold text-amber-900">{pages.filter((page) => page.status !== 'published').length}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search countries, titles, or URLs"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:bg-white"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-primary"
          >
            <option value="all">All visibility</option>
            <option value="published">Visible</option>
            <option value="draft">Hidden</option>
          </select>
        </div>

        {error ? <div role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">{error}</div> : null}
        {message ? <div role="status" className="border-b border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800">{message}</div> : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 font-extrabold">Country / Page</th>
                <th className="px-5 py-4 font-extrabold">Public URL <span className="normal-case tracking-normal text-slate-400">· editable</span></th>
                <th className="px-5 py-4 font-extrabold">Visibility</th>
                <th className="px-5 py-4 text-right font-extrabold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visiblePages.map((page) => {
                const draftSlug = slugDrafts[page.id] ?? page.slug;
                const slugChanged = draftSlug.trim() !== page.slug;
                return (
                  <tr key={page.id} className="transition-colors hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{page.title}</div>
                      <div className="mt-1 text-xs text-slate-400">Visa processing landing page</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
                        <input
                          aria-label={`Public URL for ${page.title}`}
                          value={draftSlug}
                          onChange={(event) => setSlugDrafts((current) => ({ ...current, [page.id]: event.target.value }))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') { event.preventDefault(); void updateSlug(page); }
                            if (event.key === 'Escape') setSlugDrafts((current) => ({ ...current, [page.id]: page.slug }));
                          }}
                          className="min-w-[290px] flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-mono text-xs text-primary outline-none hover:border-slate-200 hover:bg-white focus:border-primary focus:bg-white"
                        />
                        {slugChanged ? (
                          <>
                            <button type="button" aria-label={`Save public URL for ${page.title}`} title="Save public URL" disabled={busy !== null} onClick={() => void updateSlug(page)} className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"><Check className="h-4 w-4" /></button>
                            <button type="button" aria-label={`Cancel public URL edit for ${page.title}`} title="Cancel URL edit" onClick={() => setSlugDrafts((current) => ({ ...current, [page.id]: page.slug }))} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"><X className="h-4 w-4" /></button>
                          </>
                        ) : (
                          <Link href={page.slug} target="_blank" aria-label={`Open ${page.title} in a new tab`} title="Open public page" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-primary"><ExternalLink className="h-4 w-4" /></Link>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${page.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${page.status === 'published' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {page.status === 'published' ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {busy === page.id ? <span className="mr-1 inline-flex p-2 text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" /></span> : null}
                        <Link href={`/admin/pages/edit?table=visa_processing&id=${page.id}`} aria-label={`Edit ${page.title}`} title="Edit page sections" className="rounded-lg bg-blue-50 p-2 text-blue-700 transition hover:bg-blue-100"><Pencil className="h-4 w-4" /></Link>
                        <button type="button" disabled={busy !== null} onClick={() => void toggleVisibility(page)} aria-label={`${page.status === 'published' ? 'Hide' : 'Show'} ${page.title} on frontend`} title={page.status === 'published' ? 'Hide on frontend' : 'Show on frontend'} className={`rounded-lg p-2 transition disabled:opacity-50 ${page.status === 'published' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                          {page.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button type="button" disabled={busy !== null} onClick={() => void duplicatePage(page)} aria-label={`Duplicate ${page.title}`} title="Duplicate as hidden draft" className="rounded-lg bg-violet-50 p-2 text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"><Copy className="h-4 w-4" /></button>
                        <button type="button" disabled={busy !== null} onClick={() => void deletePage(page)} aria-label={`Delete ${page.title}`} title="Delete page" className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visiblePages.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Search className="h-5 w-5" /></div>
                  <div className="mt-3 font-semibold text-slate-700">{pages.length ? 'No matching pages' : 'No visa-processing pages yet'}</div>
                  <p className="mt-1 text-xs text-slate-500">{pages.length ? 'Try another search or visibility filter.' : 'Create the first country page to get started.'}</p>
                </td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
