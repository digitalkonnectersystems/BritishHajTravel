'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getPageById, saveGuideAction, type GuideCategory } from '@/actions/pageActions';

type GuideSection = {
  id: string;
  type: 'Text Block (Rich Text)' | 'Guide';
  title: string;
  data: Record<string, any>;
};

const ICONS = ['FileText', 'FilePenLine', 'WalletCards', 'Package', 'ShoppingCart', 'Fingerprint', 'HeartPulse', 'BookOpen'];

function GuideEditorContent() {
  const params = useSearchParams();
  const id = params.get('id') ? Number(params.get('id')) : null;
  const initialCategory = params.get('category') === 'umrah' ? 'umrah' : 'hajj';
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<GuideCategory>(initialCategory);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [description, setDescription] = useState('');
  const [card, setCard] = useState({ number: 1, icon: 'FileText', detail: '', buttonLabel: 'Learn More' });
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPageById(id).then((page) => {
      if (!page) {
        setMessage('Guide could not be found.');
        return;
      }
      setTitle(page.title);
      setSlug(page.slug);
      setCategory(page.guideCategory === 'umrah' ? 'umrah' : 'hajj');
      setStatus(page.status === 'draft' ? 'draft' : 'published');
      setDescription(page.metaDescription || '');
      try {
        const savedCard = page.guideCardData ? JSON.parse(page.guideCardData) : {};
        setCard({ number: savedCard.number || 1, icon: savedCard.icon || 'FileText', detail: savedCard.detail || '', buttonLabel: savedCard.buttonLabel || 'Learn More' });
      } catch {
        setMessage('The guide card data is invalid. Please review the card fields before saving.');
      }
      try {
        const savedSections = page.sections ? JSON.parse(page.sections) : [];
        setSections(Array.isArray(savedSections) ? savedSections : []);
      } catch {
        setMessage('The guide sections data is invalid. Please rebuild the sections before saving.');
      }
    }).catch((error) => {
      console.error('Failed to load guide:', error);
      setMessage('Failed to load guide.');
    });
  }, [id]);

  const updateTitle = (value: string) => {
    setTitle(value);
    if (!id) setSlug(`/${value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')}`);
  };

  const addSection = (type: GuideSection['type']) => {
    const section: GuideSection = type === 'Guide'
      ? { id: `guide-${Date.now()}`, type, title: 'Guide Cards', data: { buttonLabel: 'Learn More', steps: [] } }
      : { id: `text-${Date.now()}`, type, title: 'Content Section', data: { content: '' } };
    setSections((current) => [...current, section]);
  };

  const updateSection = (index: number, patch: Partial<GuideSection>) => {
    setSections((current) => current.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section));
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    const formData = new FormData();
    if (id) formData.append('id', String(id));
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('guideCategory', category);
    formData.append('status', status);
    formData.append('metaDescription', description);
    formData.append('guideCardData', JSON.stringify(card));
    formData.append('sections', JSON.stringify(sections));
    const result = await saveGuideAction(formData);
    setSaving(false);
    if (result.success) {
      setMessage('Guide saved successfully.');
      if (!id && result.pageId) window.history.replaceState(null, '', `/admin/guides/edit?id=${result.pageId}&category=${category}`);
    } else {
      setMessage(result.error || 'Failed to save guide.');
    }
  };

  return (
    <AdminLayout user={{ name: 'Admin User', role: 'Super Admin' }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/admin/guides" className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" /> Back to Guides</Link>
            <h1 className="text-2xl font-extrabold text-slate-900">{id ? 'Edit Guide' : 'Add Guide'}</h1>
            <p className="mt-1 text-xs text-slate-400">Manage the guide page, card content, and sections without leaving Guides.</p>
          </div>
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Guide'}</button>
        </div>

        {message && <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-extrabold text-slate-900">Guide Page</h2>
              <div className="grid gap-4">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Title *
                  <input value={title} onChange={(event) => updateTitle(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-primary" />
                </label>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Slug *
                  <input value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-primary" />
                </label>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Page description / SEO description
                  <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-primary" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-extrabold text-slate-900">Guide Page Sections</h2><div className="flex gap-2"><button type="button" onClick={() => addSection('Text Block (Rich Text)')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600"><Plus className="h-3 w-3" /> Text section</button><button type="button" onClick={() => addSection('Guide')} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-white"><Plus className="h-3 w-3" /> Guide section</button></div></div>
              <div className="flex flex-col gap-3">
                {sections.map((section, index) => (
                  <div key={section.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3"><input value={section.title} onChange={(event) => updateSection(index, { title: event.target.value })} className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold" /><button type="button" onClick={() => setSections((current) => current.filter((_, sectionIndex) => sectionIndex !== index))} className="rounded-lg bg-red-50 p-2 text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div>
                    {section.type === 'Text Block (Rich Text)' ? <textarea value={section.data.content || ''} onChange={(event) => updateSection(index, { data: { ...section.data, content: event.target.value } })} rows={5} placeholder="Write the guide section content..." className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs" /> : <p className="text-[11px] text-slate-500">Use this section for the existing guide card grid. Add and edit its cards below.</p>}
                  </div>
                ))}
                {sections.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-xs text-slate-400">No sections added yet.</p>}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-extrabold text-slate-900">Guide Settings</h2>
              <div className="grid gap-4">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Category
                  <select value={category} onChange={(event) => setCategory(event.target.value as GuideCategory)} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs"><option value="hajj">Hajj Guides</option><option value="umrah">Umrah Guides</option></select>
                </label>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Status
                  <select value={status} onChange={(event) => setStatus(event.target.value as 'published' | 'draft')} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs"><option value="published">Published</option><option value="draft">Draft</option></select>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
              <h2 className="mb-4 text-sm font-extrabold text-slate-900">Guide Card</h2>
              <div className="grid gap-4">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Card number<input type="number" min="1" value={card.number} onChange={(event) => setCard({ ...card, number: Number(event.target.value) || 1 })} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs" /></label>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">SVG icon<select value={card.icon} onChange={(event) => setCard({ ...card, icon: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs">{ICONS.map((icon) => <option key={icon}>{icon}</option>)}</select></label>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Card description<textarea value={card.detail} onChange={(event) => setCard({ ...card, detail: event.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs" /></label>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Button label<input value={card.buttonLabel} onChange={(event) => setCard({ ...card, buttonLabel: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs" /></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminGuideEditPage() {
  return <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading guide editor...</div>}><GuideEditorContent /></Suspense>;
}
