'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getPagesList, deletePageAction, updatePageOrderAction, updatePageStatusAction } from '@/actions/pageActions';
import Link from 'next/link';

import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import { Trash2, Pencil, Copy, Check, Sliders } from 'lucide-react';
import SeoCenterModal from '@/components/admin/SeoCenterModal';

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // SEO Modal State
  const [seoModalOpen, setSeoModalOpen] = useState(false);
  const [selectedSeoPage, setSelectedSeoPage] = useState<any>(null);

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
    setPages((prevPages) =>
      prevPages.map((p) => (p.id === id ? { ...p, status: newStatus, updatedAt: new Date() } : p))
    );
    await updatePageStatusAction(id, newStatus);
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
    await updatePageOrderAction(orderedIds);
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
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs no-underline inline-flex items-center gap-2 shadow-lg shadow-emerald-900/20"
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
              {filteredPages.map((p: any, idx: number) => (
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
                        className="p-1 rounded-md text-primary hover:text-slate-900 hover:bg-gold/20 transition-colors border-none cursor-pointer flex items-center justify-center"
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
                    <div className="relative inline-block">
                      <select
                        value={p.status || 'published'}
                        onChange={(e) => handleStatusChange(p.id, e.target.value as 'published' | 'draft')}
                        className={`appearance-none font-bold text-[11px] px-3 py-1 pr-4 rounded-full cursor-pointer transition-colors border outline-none shadow-2xs uppercase tracking-normal ${p.status === 'published' ? 'bg-emerald-50 text-primary border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                          }`}
                      >
                        <option value="published" className="bg-white text-emerald-800 font-bold py-1">
                          • Published
                        </option>
                        <option value="draft" className="bg-white text-amber-800 font-bold py-1">
                          • Draft
                        </option>
                      </select>
                      <span className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] ${p.status === 'published' ? 'text-primary' : 'text-amber-600'}`}>
                        ▼
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-slate-400 text-xs">
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="inline-flex gap-2 items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSeoPage(p);
                          setSeoModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-primary border border-emerald-300 text-[11px] font-extrabold hover:bg-primary hover:text-white transition-all cursor-pointer shadow-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <Sliders className="w-3 h-3" />
                        <span>Page SEO</span>
                      </button>
                      <Link href={`/admin/pages/edit?id=${p.id}`} className="flex gap-1 px-3 py-1.5 rounded-lg bg-gold/50 text-primary no-underline text-[11px] font-bold hover:bg-gold transition-colors">
                        <Pencil className='w-3 h-3' />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        disabled={deletingId === p.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold cursor-pointer disabled:opacity-50"
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
