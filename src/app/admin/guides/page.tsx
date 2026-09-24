'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import { deleteGuideAction, getGuidesList, moveGuideToPagesAction, reorderGuidesAction, type GuideCategory } from '@/actions/pageActions';

type Guide = Awaited<ReturnType<typeof getGuidesList>>[number];

export default function AdminGuidesPage() {
  const [category, setCategory] = useState<GuideCategory>('hajj');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [search, setSearch] = useState('');
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [draggedGuideId, setDraggedGuideId] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const loadGuides = () => getGuidesList(category, true).then(setGuides).catch(() => setGuides([]));
  useEffect(() => { loadGuides(); }, [category]);

  const filteredGuides = useMemo(() => {
    const query = search.trim().toLowerCase();
    return guides.filter((guide) => !query || guide.title.toLowerCase().includes(query) || guide.slug.toLowerCase().includes(query));
  }, [guides, search]);

  const moveGuide = async (targetId: number) => {
    if (draggedGuideId === null || draggedGuideId === targetId || search.trim()) return;
    const currentIndex = guides.findIndex((guide) => guide.id === draggedGuideId);
    const targetIndex = guides.findIndex((guide) => guide.id === targetId);
    if (currentIndex < 0 || targetIndex < 0) return;

    const reordered = [...guides];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setGuides(reordered);
    setDraggedGuideId(null);
    setIsSavingOrder(true);
    const result = await reorderGuidesAction(category, reordered.map((guide) => guide.id));
    setIsSavingOrder(false);
    if (!result.success) {
      await loadGuides();
      window.alert(result.error || 'Failed to save guide order.');
    }
  };

  const handleDelete = (guide: Guide) => {
    setConfirmConfig({
      icon: <Trash2 className="w-3 h-3 text-red-600" />,
      title: 'Delete Guide',
      message: `Permanently delete "${guide.title}"? This cannot be undone.`,
      confirmText: 'Delete guide',
      cancelText: 'Not now',
      variant: 'danger',
      onConfirm: async () => {
        const result = await deleteGuideAction(guide.id);
        if (result.success) {
          setGuides((current) => current.filter((item) => item.id !== guide.id));
        } else {
          window.alert(result.error || 'Failed to delete guide.');
        }
      },
    });
  };

  const handleMoveToPages = (guide: Guide) => {
    setConfirmConfig({
      icon: <FileText className="w-3 h-3 text-primary" />,
      title: 'Move Guide to Pages',
      message: `Move "${guide.title}" to Admin Pages? Its slug, sections, and content will be preserved.`,
      confirmText: 'Move to Pages',
      cancelText: 'Not now',
      variant: 'primary',
      onConfirm: async () => {
        const result = await moveGuideToPagesAction(guide.id);
        if (result.success) {
          setGuides((current) => current.filter((item) => item.id !== guide.id));
        } else {
          window.alert(result.error || 'Failed to move guide to Pages.');
        }
      },
    });
  };

  return (
    <AdminLayout user={{ name: 'Admin User', role: 'Super Admin' }}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Guides</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage Hajj and Umrah guide pages and their content sections.</p>
          </div>
          <Link href={`/admin/guides/edit?category=${category}`} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-lg">
            <Plus className="w-4 h-4" /> Add {category === 'hajj' ? 'Hajj' : 'Umrah'} Guide
          </Link>
        </div>

        <div className="flex gap-2 border-b border-slate-200">
          {(['hajj', 'umrah'] as GuideCategory[]).map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={`px-5 py-3 text-xs font-extrabold rounded-t-xl ${category === item ? 'bg-primary text-white' : 'bg-white text-slate-500'}`}>
              {item === 'hajj' ? 'Hajj Guides' : 'Umrah Guides'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-4">
          <input type="text" placeholder="Search guides by title or slug..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full max-w-md px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none" />
          <p className="text-[11px] text-slate-400 text-right">
            {isSavingOrder ? 'Saving order...' : search.trim() ? 'Clear search to reorder guides.' : 'Drag the handle to reorder guides.'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs">
          <table className="w-full border-collapse text-left text-xs">
            <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider"><th className="py-3 px-5">Guide</th><th className="py-3 px-5">Slug</th><th className="py-3 px-5">Status</th><th className="py-3 px-5 text-right">Actions</th></tr></thead>
            <tbody>
              {filteredGuides.map((guide) => (
                <tr
                  key={guide.id}
                  draggable={!search.trim()}
                  onDragStart={() => setDraggedGuideId(guide.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void moveGuide(guide.id)}
                  className={`border-b border-slate-100 ${draggedGuideId === guide.id ? 'opacity-50' : ''}`}
                >
                  <td className="py-4 px-5"><div className="flex items-center gap-3"><button type="button" disabled={Boolean(search.trim())} className="text-slate-400 cursor-grab disabled:cursor-not-allowed" title="Drag to reposition"><GripVertical className="w-4 h-4" /></button><span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><BookOpen className="w-4 h-4" /></span><span className="font-bold text-slate-900">{guide.title}</span></div></td>
                  <td className="py-4 px-5 text-slate-500 font-mono">{guide.slug}</td>
                  <td className="py-4 px-5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${guide.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{guide.status}</span></td>
                  <td className="py-4 px-5 text-right"><div className="inline-flex items-center gap-2"><Link href={`/admin/guides/edit?id=${guide.id}&category=${category}`} className="p-2 rounded-lg bg-slate-100 text-slate-600" title="Edit guide"><Pencil className="w-3.5 h-3.5" /></Link><button type="button" onClick={() => handleMoveToPages(guide)} className="p-2 rounded-lg bg-blue-50 text-primary" title="Move to Admin Pages"><FileText className="w-3.5 h-3.5" /></button><button type="button" onClick={() => handleDelete(guide)} className="p-2 rounded-lg bg-red-50 text-red-600" title="Delete guide"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                </tr>
              ))}
              {filteredGuides.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-400">No {category} guides found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {confirmConfig && <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />}
    </AdminLayout>
  );
}
