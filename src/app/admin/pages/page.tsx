'use client';

import { useEffect, useState } from 'react';
import type { ComponentProps } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getPagesList, deletePageAction, updatePageOrderAction, updatePageStatusAction, duplicatePageAction } from '@/actions/pageActions';
import Link from 'next/link';

import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import { Trash2, Pencil, Copy, Check, Sliders, Eye, EyeOff } from 'lucide-react';
import SeoCenterModal from '@/components/admin/SeoCenterModal';

type AdminPage = Awaited<ReturnType<typeof getPagesList>>[number];
type SeoPageData = NonNullable<ComponentProps<typeof SeoCenterModal>['pageData']>;

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // SEO Modal State
  const [seoModalOpen, setSeoModalOpen] = useState(false);
  const [selectedSeoPage, setSelectedSeoPage] = useState<SeoPageData | null>(null);

  useEffect(() => {
    getPagesList().then((res) => {
      if (res && Array.isArray(res)) setPages(res);
    });
  }, []);

  const handleCopySlug = (id: number, slug: string) => {
    const fullUrl = `${window.location.origin}${slug.startsWith('/') ? slug : '/' + slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (id: number, newStatus: 'published' | 'draft') => {
    try {
      const result = await updatePageStatusAction(id, newStatus);
      if (!result.success) throw new Error(result.error || 'Unable to update page status');
      setPages((current) => current.map((page) => page.id === id ? { ...page, status: newStatus } : page));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Page status update failed');
    }
  };

  const handleDelete = (id: number, title: string) => {
    setConfirmConfig({
      icon: <Trash2 className="w-3 h-3 text-red-600" />,
      title: 'Delete Page',
      message: `Would you like to permanently delete the page "${title}"? This cannot be undone.`,
      confirmText: 'Delete page',
      cancelText: 'Not now',
      variant: 'danger',
      onConfirm: async () => {
        setDeletingId(id);
        const res = await deletePageAction(id);
        if (res.success) {
          setPages((prev) => prev.filter((p) => p.id !== id));
        }
        setDeletingId(null);
      },
    });
  };

  const handleDuplicate = async (id: number) => {
    setDuplicatingId(id);
    try {
      const result = await duplicatePageAction(id);
      if (!result.success || !result.page) {
        window.alert(result.error || 'Unable to duplicate page.');
        return;
      }
      setPages((current) => [result.page, ...current]);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to duplicate page.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...pages];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, item);
    setDraggedIndex(index);
    setPages(updated);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    const orderedIds = pages.map(p => p.id);
    try {
      const result = await updatePageOrderAction(orderedIds);
      if (!result.success) throw new Error(result.error || 'Failed to save order');
    } catch (error) {
      getPagesList().then(setPages).catch(console.error);
      window.alert(error instanceof Error ? error.message : 'Failed to save page order');
    }
  };

  const filteredPages = pages.filter((p) => {
    const searchLower = search.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      (p.title || '').toLowerCase().includes(searchLower) ||
      (p.slug || '').toLowerCase().includes(searchLower);
    const itemStatus = (p.status || 'published').toLowerCase();
    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout user={{ name: 'Admin User', role: 'Super Admin' }}>
      <div className="flex flex-col gap-6">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 m-0">Pages</h1>
            <p className="text-xs text-slate-400 mt-0.5 mb-0">Manage live website pages, titles, slugs, dynamic page sections &amp; order</p>
          </div>
          <Link
            href="/admin/pages/edit"
            className="bg-primary text-white hover:text-primary hover:bg-white px-5 py-2.5 rounded-xl font-bold text-xs no-underline inline-flex items-center gap-2 shadow-lg"
          >
            + Create New Page
          </Link>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between gap-4 shadow-xs">
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none"
          />
          <div className="flex gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Pages Table — Dynamic & Draggable */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center">⋮⋮</th>
                <th className="py-3 px-5 font-bold">Title</th>
                <th className="py-3 px-5 font-bold">Slug</th>
                <th className="py-3 px-5 font-bold">Status</th>
                <th className="py-3 px-5 font-bold">Updated</th>
                <th className="py-3 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((p, idx) => (
                <tr
                  key={p.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`border-b border-slate-100 cursor-grab transition-colors ${draggedIndex === idx ? 'bg-emerald-50' : 'bg-white'}`}
                >
                  <td className="py-4 px-3 text-center text-slate-400 text-base cursor-grab" title="Drag to reorder">
                    ⋮⋮
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-900">{p.title}</td>
                  <td className="py-4 px-5 text-slate-500 font-mono text-xs">
                    <div className="flex items-center gap-2 group">
                      <span>{p.slug}</span>
                      <button
                        type="button"
                        onClick={() => handleCopySlug(p.id, p.slug)}
                        className="p-1 rounded-md text-primary hover:text-slate-900 hover:bg-red/20 transition-colors border-none cursor-pointer flex items-center justify-center"
                        title="Copy full page URL"
                      >
                        {copiedId === p.id ? (
                          <Check className="w-3.5 h-3.5 text-primary bg-primary/10 font-bold" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase ${p.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {p.status === 'published' ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-400 text-xs">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex gap-2 items-center">
                      {p.slug && p.status === 'published' && (
                        <Link
                          href={p.slug.startsWith('/') ? p.slug : `/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview public page"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStatusChange(p.id, p.status === 'published' ? 'draft' : 'published')}
                        title={p.status === 'published' ? 'Hide from frontend' : 'Show on frontend'}
                        aria-label={`${p.status === 'published' ? 'Hide' : 'Show'} ${p.title} on frontend`}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${p.status === 'published' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                      >
                        {p.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDuplicate(p.id)}
                        disabled={duplicatingId === p.id}
                        title="Duplicate as hidden draft"
                        aria-label={`Duplicate ${p.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSeoPage({
                            id: p.id,
                            title: p.title,
                            slug: p.slug,
                            metaTitle: p.metaTitle || undefined,
                            metaDescription: p.metaDescription || undefined,
                            bannerBgImage: p.bannerBgImage || undefined,
                            sections: p.sections,
                            seoData: p.seoSettings || undefined,
                          });
                          setSeoModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-primary border border-emerald-300 text-[11px] font-extrabold hover:bg-primary hover:text-white transition-all cursor-pointer shadow-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <Sliders className="w-3 h-3" />
                        <span>Page SEO</span>
                      </button>
                      <Link href={`/admin/pages/edit?id=${p.id}`} className="flex gap-1 px-3 py-1.5 rounded-lg bg-blue-100 text-primary no-underline text-[11px] font-bold hover:bg-primary hover:text-white transition-colors">
                        <Pencil className='w-3 h-3' />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deletingId === p.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:text-white hover:bg-red border border-red-200 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === p.id ? 'Deleting...' : <><Trash2 className="w-3 h-3" /></>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
      <SeoCenterModal
        isOpen={seoModalOpen}
        onClose={() => {
          setSeoModalOpen(false);
          setSelectedSeoPage(null);
        }}
        pageData={selectedSeoPage}
        onSaveSuccess={() => {
          getPagesList().then((res) => {
            if (res && Array.isArray(res)) setPages(res);
          });
        }}
      />
    </AdminLayout>
  );
}
