'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogsList, deleteBlogAction, saveBlogAction, slugifyBlogTitle, updateBlogOrderAction } from '@/actions/blogActions';
import { uploadFile } from '@/lib/uploadClient';
import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import GlassNotificationModal from '@/components/ui/GlassNotificationModal';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import { Trash2, Pencil, Sliders, Upload, Plus, X, GripVertical, Star } from 'lucide-react';
import CategoryDropdown from '@/components/admin/CategoryDropdown';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [seoModalOpen, setSeoModalOpen] = useState(false);
  const [selectedSeoBlog, setSelectedSeoBlog] = useState<any>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }>({ isOpen: false, type: 'success', title: '', message: '' });

  const notify = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') =>
    setNotification({ isOpen: true, type, title, message });

  useEffect(() => {
    getBlogsList().then((res) => { if (Array.isArray(res)) setBlogs(res); });
  }, []);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...blogs];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(index, 0, item);
    setDraggedIndex(index);
    setBlogs(updated);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    const orderedIds = blogs.map((b) => b.id);
    await updateBlogOrderAction(orderedIds);
  };

  const handleDelete = (id: number, title: string) => {
    setConfirmConfig({
      icon: <Trash2 className="w-3 h-3 text-red-600" />,
      title: 'Delete Blog Post',
      message: `Permanently delete "${title}"? This cannot be undone.`,
      confirmText: 'Delete Blog',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        setDeletingId(id);
        const res = await deleteBlogAction(id);
        if (res.success) setBlogs((prev) => prev.filter((b) => b.id !== id));
        setDeletingId(null);
      },
    });
  };

  const filtered = blogs.filter((b) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || b.title?.toLowerCase().includes(q) || b.slug?.toLowerCase().includes(q);
    const bStatus = b.isPublished ? 'published' : 'draft';
    const matchesStatus = statusFilter === 'all' || bStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (d: any) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  };

  return (
    <AdminLayout user={{ name: 'Admin User', role: 'Super Admin' }}>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 m-0">Blog Posts</h1>
            <p className="text-xs text-slate-400 mt-0.5 mb-0">Drag and reorder blogs — the 1st/top blog is highlighted as the Featured article on the live website</p>
          </div>
          <Link
            href="/admin/blogs/edit"
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-emerald-900/20 border-none cursor-pointer hover:bg-[#00382B] transition-colors no-underline"
          >
            <Plus className="w-4 h-4" />
            Create New Blog
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 flex items-center justify-between gap-4 shadow-xs">
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none"
          />
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

        {/* Blog Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center font-bold">⋮⋮</th>
                <th className="py-3 px-4 font-bold w-16">Thumb</th>
                <th className="py-3 px-4 font-bold">Title</th>
                <th className="py-3 px-4 font-bold">Category</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Published</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    {blogs.length === 0 ? 'No blog posts yet. Create your first one above.' : 'No results match your search.'}
                  </td>
                </tr>
              )}
              {filtered.map((b: any, idx: number) => {
                const isTopFeatured = idx === 0 && !search && statusFilter === 'all';
                return (
                  <tr
                    key={b.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`border-b transition-colors ${draggedIndex === idx
                      ? 'bg-emerald-50 border-emerald-300'
                      : isTopFeatured
                        ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
                        : 'border-slate-100 hover:bg-slate-50'
                      }`}
                  >
                    {/* Drag Handle */}
                    <td className="py-3 px-3 text-center text-slate-400 cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">
                      <span className="text-sm font-bold opacity-60 hover:opacity-100">⋮⋮</span>
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      {b.featuredImage ? (
                        <div className={`w-12 h-10 rounded-lg overflow-hidden border bg-slate-100 ${isTopFeatured ? 'border-amber-400 ring-2 ring-amber-300/40' : 'border-slate-200'}`}>
                          <img src={b.featuredImage} alt={b.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-12 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 border flex items-center justify-center ${isTopFeatured ? 'border-amber-400' : 'border-slate-200'}`}>
                          <span className="text-[10px] text-primary font-bold">IMG</span>
                        </div>
                      )}
                    </td>

                    {/* Title + Slug */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs">{b.title}</span>
                        {isTopFeatured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-[#DB9E30] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">/blogs/{b.slug}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {b.category || 'Uncategorized'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${b.isPublished ? 'bg-emerald-50 text-primary border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                        {b.isPublished ? '• Published' : '• Draft'}
                      </span>
                    </td>

                    {/* Published Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {formatDate(b.publishedAt || b.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => { setSelectedSeoBlog(b); setSeoModalOpen(true); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-primary border border-emerald-300 text-[11px] font-extrabold hover:bg-primary hover:text-white transition-all cursor-pointer shadow-xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <Sliders className="w-3 h-3" />
                          <span>SEO</span>
                        </button>
                        <Link
                          href={`/admin/blogs/edit?id=${b.id}`}
                          className="flex gap-1 px-3 py-1.5 rounded-lg bg-gold/50 text-primary no-underline text-[11px] font-bold hover:bg-gold transition-colors"
                        >
                          <Pencil className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.title)}
                          disabled={deletingId === b.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
      <GlassNotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification((p) => ({ ...p, isOpen: false }))}
      />
      <SeoCenterModal
        isOpen={seoModalOpen}
        onClose={() => { setSeoModalOpen(false); setSelectedSeoBlog(null); }}
        pageData={selectedSeoBlog ? { id: selectedSeoBlog.id, title: selectedSeoBlog.title, slug: `/blogs/${selectedSeoBlog.slug}`, seoData: selectedSeoBlog.seoData } : null}
        onSaveSuccess={async () => { const updated = await getBlogsList(); setBlogs(updated); }}
      />
    </AdminLayout>
  );
}
