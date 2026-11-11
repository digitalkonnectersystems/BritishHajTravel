'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, ExternalLink, Image as ImageIcon, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import ModalPortal from '@/components/ui/ModalPortal';
import { getGuidesList } from '@/actions/pageActions';
import {
  archiveHajjGuideGridItemAction, getHajjGuideGridAdminItems, saveHajjGuideGridItemAction,
  type HajjGuideGridInput, type HajjGuideGridItem,
} from '@/actions/hajjGuideGridActions';

type GuideOption = { id: number; title: string; slug: string; status: string };
const emptyForm: HajjGuideGridInput = {
  title: '', imageUrl: '', altText: '', targetUrl: '', guidePageId: null, displayOrder: 0, status: 'draft',
};

export default function HajjGuideGridsAdminPage() {
  const [items, setItems] = useState<HajjGuideGridItem[]>([]);
  const [guides, setGuides] = useState<GuideOption[]>([]);
  const [editing, setEditing] = useState<HajjGuideGridInput | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [records, pages] = await Promise.all([getHajjGuideGridAdminItems(), getGuidesList('hajj', true)]);
      setItems(records);
      setGuides(pages.map((page) => ({ id: page.id, title: page.title, slug: page.slug, status: page.status })));
    } catch (err) {
      console.error('Hajj Guide Grids read failed', err);
      setError('Unable to load the Hajj Guide Grids. Run the supplied SQL migration and check the database connection.');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  useEffect(() => {
    if (!editing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) setEditing(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editing, saving]);

  const shown = useMemo(() => items.filter((item) =>
    `${item.title} ${item.targetUrl} ${item.guideSlug}`.toLowerCase().includes(search.trim().toLowerCase()),
  ), [items, search]);
  const change = (patch: Partial<HajjGuideGridInput>) => setEditing((current) => current ? { ...current, ...patch } : null);
  const openNew = () => { setMessage(''); setEditing({ ...emptyForm, displayOrder: items.length + 1 }); };
  const openEdit = (item: HajjGuideGridItem) => {
    setMessage('');
    setEditing({ id: item.id, title: item.title, imageUrl: item.imageUrl, altText: item.altText, targetUrl: item.targetUrl, guidePageId: item.guidePageId, displayOrder: item.displayOrder, status: item.status });
  };

  const save = async () => {
    if (!editing || saving) return;
    setSaving(true);
    setError('');
    try {
      const result = await saveHajjGuideGridItemAction(editing);
      if (!result.success) { setError(result.error || 'Unable to save card.'); return; }
      setEditing(null);
      setMessage('Hajj Guide grid item saved. Select it in Pages > Add Section to display it.');
      await reload();
    } catch (err) { console.error(err); setError('Save failed. Please check the database and retry.'); }
    finally { setSaving(false); }
  };
  const archive = async (item: HajjGuideGridItem) => {
    if (!window.confirm(`Archive “${item.title}”? It will disappear from all published grids.`)) return;
    setError('');
    try {
      const result = await archiveHajjGuideGridItemAction(item.id);
      if (!result.success) { setError(result.error || 'Archive failed.'); return; }
      setMessage('Grid item archived.');
      await reload();
    } catch (err) { console.error(err); setError('Archive failed.'); }
  };

  return (
    <AdminLayout>
      <div className="mx-auto flex w-full min-w-0 max-w-[1450px] flex-col gap-5 pb-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#b50007]">Guides / Hajj Guide Grids</p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-[#020e43] sm:text-3xl">UK-GLOBAL HAJJ GUIDE 2027</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">Manage the image tiles used across CMS pages. Link to an existing Hajj guide detail page or add a URL directly to a grid card.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/guides?category=hajj" className="inline-flex items-center gap-2 rounded-xl border border-[#020e43] bg-white px-4 py-2.5 text-xs font-bold text-[#020e43]"><BookOpen className="h-4 w-4" /> Guide Detail Pages</Link>
            <button type="button" onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-[#020e43] px-4 py-2.5 text-xs font-bold text-white"><Plus className="h-4 w-4" /> Add Grid Card</button>
          </div>
        </div>
        {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">{message}</p>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p>}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ['Total grids', items.length],
            ['Published', items.filter((item) => item.status === 'published').length],
            ['Drafts', items.filter((item) => item.status === 'draft').length],
          ].map(([title, value]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"><p className="text-xs font-semibold text-slate-500">{title}</p><p className="mt-1 text-2xl font-black text-[#020e43]">{value}</p></div>)}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
          <input aria-label="Search grid cards" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search grid title or destination..." className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#020e43]" />
          <button type="button" onClick={() => void reload()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-[#020e43]"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>

        {loading ? <p className="rounded-xl bg-white p-8 text-center text-sm text-slate-500">Loading Hajj guide cards...</p> : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((item) => {
              const url = item.targetUrl || item.guideSlug || '';
              return <article key={item.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="aspect-[1.3/1] bg-slate-50">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.altText || item.title} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center gap-2 text-slate-400"><ImageIcon className="h-7 w-7" /> No image yet</div>}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase text-slate-500">Order {item.displayOrder}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span></div>
                  <h2 className="min-w-0 break-words text-sm font-extrabold uppercase text-[#020e43]">{item.title}</h2>
                  <p className="min-w-0 break-all text-[11px] text-slate-500">{url || 'No URL set. Card is not clickable.'}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                    <button type="button" onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#020e43] px-3 py-2 text-xs font-semibold text-white"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                    {url && <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-[#020e43]"><ExternalLink className="h-3 w-3" /> View</a>}
                    <button type="button" onClick={() => void archive(item)} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-2 text-xs font-semibold text-[#b50007]"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </article>;
            })}
            {shown.length === 0 && <p className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No matching cards. Add a grid card to get started.</p>}
          </div>
        )}

        {editing && (
          <ModalPortal>
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in duration-150"
              role="presentation"
              onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setEditing(null); }}
            >
              <div role="dialog" aria-modal="true" aria-labelledby="hajj-grid-dialog-title" className="my-auto flex max-h-[min(92vh,900px)] w-full max-w-2xl min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 p-5">
                  <div>
                    <h2 id="hajj-grid-dialog-title" className="font-serif text-xl font-bold text-[#020e43]">{editing.id ? 'Edit Hajj Guide Card' : 'Add Hajj Guide Card'}</h2>
                    <p className="text-xs text-slate-500">The card can link to an existing guide page or a manually entered URL.</p>
                  </div>
                  <button type="button" onClick={() => setEditing(null)} disabled={saving} aria-label="Close editor" className="rounded-full p-2 bg-red hover:bg-red-700 text-white cursor-pointer"><X className="h-5 w-5" /></button>
                </div>
                <div className="grid min-h-0 gap-4 overflow-y-auto p-5 sm:grid-cols-2">
                  <label className="sm:col-span-2 text-xs font-bold text-[#020e43]">Grid title *
                    <input maxLength={180} value={editing.title} onChange={(e) => change({ title: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-[#020e43]" placeholder="Luxury Hajj 2027" />
                  </label>
                  <div className="sm:col-span-2"><p className="mb-2 text-xs font-bold text-[#020e43]">Grid image (Media Library)</p><ImageUploadWidget value={editing.imageUrl || ''} onChange={(url) => change({ imageUrl: url })} compact /></div>
                  <label className="sm:col-span-2 text-xs font-bold text-[#020e43]">Image alt text
                    <input maxLength={255} value={editing.altText || ''} onChange={(e) => change({ altText: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Luxury Hajj 2027 package guide" />
                  </label>
                  <label className="text-xs font-bold text-[#020e43]">Linked Hajj guide detail page
                    <select value={editing.guidePageId || ''} onChange={(e) => change({ guidePageId: e.target.value ? Number(e.target.value) : null })} className="mt-1 block w-full min-w-0 rounded-lg border border-slate-300 bg-white p-3 text-xs">
                      <option value="">No linked guide page</option>
                      {guides.map((guide) => <option key={guide.id} value={guide.id}>{guide.title} ({guide.status})</option>)}
                    </select>
                  </label>
                  <div className="flex items-end"><Link href="/admin/guides/edit?category=hajj" target="_blank" className="inline-flex items-center gap-2 rounded-lg border border-[#020e43] px-3 py-2.5 text-xs font-bold text-[#020e43]"><Plus className="h-4 w-4" /> Create Hajj detail page</Link></div>
                  <label className="sm:col-span-2 text-xs font-bold text-[#020e43]">Manual card URL (optional)
                    <input value={editing.targetUrl || ''} onChange={(e) => change({ targetUrl: e.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="/hajj-packages or https://..." />
                    <span className="mt-1 block text-[11px] font-normal text-slate-500">Manual URL takes precedence over the linked page. If both are empty, the grid card is not clickable. Draft guide pages are not linked publicly.</span>
                  </label>
                  <label className="text-xs font-bold text-[#020e43]">Display order
                    <input type="number" min={0} max={99999} value={editing.displayOrder ?? 0} onChange={(e) => change({ displayOrder: Number(e.target.value) })} className="mt-1 block w-full rounded-lg border border-slate-300 p-3 text-sm" />
                  </label>
                  <div className="flex flex-col justify-end">
                    <span className="block text-xs font-bold text-[#020e43] mb-1.5">Visibility</span>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 px-3.5 transition-colors">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                            editing.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              editing.status === 'published' ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                            }`}
                          />
                          {editing.status === 'published' ? 'Published' : 'Draft (hidden)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-label="Toggle card visibility"
                        aria-checked={editing.status === 'published'}
                        onClick={() => change({ status: editing.status === 'published' ? 'draft' : 'published' })}
                        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          editing.status === 'published' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            editing.status === 'published' ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-white p-4">
                  <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50">Cancel</button>
                  <button type="button" onClick={() => void save()} disabled={saving || !editing.title.trim()} className="inline-flex items-center gap-2 rounded-lg bg-[#020e43] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer hover:bg-[#142762]"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Grid Card'}</button>
                </div>
              </div>
            </div>
          </ModalPortal>
        )}
        <p className="text-xs text-slate-500"><CheckCircle2 className="mr-1 inline h-4 w-4 text-emerald-600" />Published cards appear only when explicitly selected in a <strong>UK-GLOBAL HAJJ GUIDE 2027</strong> section on a CMS page. Archived cards never appear publicly.</p>
      </div>
    </AdminLayout>
  );
}
