'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import TiptapEditor from '@/components/admin/TiptapEditor';
import { getPageById, saveGuideAction, type GuideCategory } from '@/actions/pageActions';

type GuideSection = {
  id: string;
  type: 'Text Block (Rich Text)' | 'Guide' | 'Video' | 'FAQ';
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
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const videoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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
      : type === 'Video'
        ? { id: `video-${Date.now()}`, type, title: 'Video', data: { source: 'embed', url: '', title: '', caption: '' } }
        : type === 'FAQ'
          ? { id: `faq-${Date.now()}`, type, title: 'Frequently Asked Questions', data: { eyebrow: '', heading: '', description: '', items: [{ question: '', answerBlocks: [{ type: 'text', content: '' }] }] } }
        : { id: `text-${Date.now()}`, type, title: 'Content Section', data: { content: '' } };
    setSections((current) => [...current, section]);
  };

  const uploadFaqMedia = async (sectionIndex: number, itemIndex: number, blockIndex: number, file: File, mediaType: 'image' | 'video') => {
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subfolder', 'uploads');
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok || !result.success || !result.url) throw new Error(result.error || 'Media upload failed.');
      setSections((current) => current.map((section, currentSectionIndex) => {
        if (currentSectionIndex !== sectionIndex) return section;
        const items = [...(section.data.items || [])];
        const answerBlocks = [...(items[itemIndex].answerBlocks || [])];
        answerBlocks[blockIndex] = { ...answerBlocks[blockIndex], type: mediaType, url: result.url };
        items[itemIndex] = { ...items[itemIndex], answerBlocks };
        return { ...section, data: { ...section.data, items } };
      }));
    } catch (error) {
      console.error('FAQ media upload failed:', error);
      setMessage(error instanceof Error ? error.message : 'Media upload failed.');
    }
  };

  const uploadVideo = async (sectionId: string, file: File) => {
    setUploadingVideo(sectionId);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subfolder', 'uploads');
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.error || 'Video upload failed.');
      }
      setSections((current) => current.map((section) => section.id === sectionId
        ? { ...section, data: { ...section.data, source: 'upload', url: result.url } }
        : section));
    } catch (error) {
      console.error('Guide video upload failed:', error);
      setMessage(error instanceof Error ? error.message : 'Video upload failed.');
    } finally {
      setUploadingVideo(null);
    }
  };

  const updateSection = (index: number, patch: Partial<GuideSection>) => {
    setSections((current) => current.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    setSections((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
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
      <div className="mx-auto flex min-w-0 w-full max-w-[1500px] flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <Link href="/admin/guides" className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" /> Back to Guides</Link>
            <h1 className="text-2xl font-extrabold text-slate-900">{id ? 'Edit Guide' : 'Add Guide'}</h1>
            <p className="mt-1 text-xs text-slate-400">Manage the guide page, card content, and sections without leaving Guides.</p>
          </div>
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Guide'}</button>
        </div>

        {message && <div className={`rounded-xl px-4 py-3 text-xs font-semibold ${message.includes('successfully') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message}</div>}

        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-6">
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

            <div className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-extrabold text-slate-900">Guide Page Sections</h2><div className="flex max-w-full flex-wrap justify-end gap-2"><button type="button" onClick={() => addSection('Text Block (Rich Text)')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600"><Plus className="h-3 w-3" /> Text section</button><button type="button" onClick={() => addSection('Video')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600"><Plus className="h-3 w-2" /> Video section</button><button type="button" onClick={() => addSection('FAQ')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600"><Plus className="h-3 w-3" /> FAQ section</button><button type="button" onClick={() => addSection('Guide')} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-white"><Plus className="h-3 w-3" /> Guide section</button></div></div>
              <div className="flex flex-col gap-3">
                {sections.map((section, index) => (
                  <div key={section.id} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <input value={section.title} onChange={(event) => updateSection(index, { title: event.target.value })} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold" />
                      <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className="rounded-lg bg-white p-2 text-slate-500 disabled:opacity-30" title="Move section up"><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="rounded-lg bg-white p-2 text-slate-500 disabled:opacity-30" title="Move section down"><ArrowDown className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => setSections((current) => current.filter((_, sectionIndex) => sectionIndex !== index))} className="rounded-lg bg-red-50 p-2 text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    {section.type === 'Text Block (Rich Text)' ? (
                      <TiptapEditor
                        value={section.data.content || ''}
                        onChange={(content) => updateSection(index, { data: { ...section.data, content } })}
                        minHeight="180px"
                        maxHeight="420px"
                      />
                    ) : section.type === 'FAQ' ? (
                      <div className="grid min-w-0 gap-4 rounded-lg border border-slate-200 bg-white p-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          {(['eyebrow', 'heading', 'description'] as const).map((field) => (
                            <label key={field} className={`text-[10px] font-extrabold uppercase tracking-wider text-slate-500 ${field === 'description' ? 'md:col-span-2' : ''}`}>{field === 'heading' ? 'FAQ title' : field}
                              {field === 'description' ? <textarea rows={2} value={section.data[field] || ''} onChange={(event) => updateSection(index, { data: { ...section.data, [field]: event.target.value } })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs" /> : <input value={section.data[field] || ''} onChange={(event) => updateSection(index, { data: { ...section.data, [field]: event.target.value } })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs" />}
                            </label>
                          ))}
                        </div>
                        <div className="grid gap-3">
                          {(section.data.items || []).map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
                              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <input value={item.question || ''} onChange={(event) => {
                                  const items = [...section.data.items]; items[itemIndex] = { ...items[itemIndex], question: event.target.value }; updateSection(index, { data: { ...section.data, items } });
                                }} placeholder="Question" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold" />
                                <button type="button" onClick={() => updateSection(index, { data: { ...section.data, items: section.data.items.filter((_: any, currentIndex: number) => currentIndex !== itemIndex) } })} className="rounded-lg bg-red-50 px-2 py-2 text-[10px] font-bold text-red-600">Remove</button>
                              </div>
                              <div className="grid gap-2">
                                {(item.answerBlocks || []).map((block: any, blockIndex: number) => (
                                  <div key={blockIndex} className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
                                    {block.type === 'text' ? <TiptapEditor value={block.content || ''} onChange={(content) => {
                                      const items = [...section.data.items]; const answerBlocks = [...(items[itemIndex].answerBlocks || [])]; answerBlocks[blockIndex] = { ...answerBlocks[blockIndex], content }; items[itemIndex] = { ...items[itemIndex], answerBlocks }; updateSection(index, { data: { ...section.data, items } });
                                    }} minHeight="120px" maxHeight="none" /> : (
                                      <div className="grid gap-2">
                                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                                          <select value={block.type} onChange={(event) => {
                                            const items = [...section.data.items]; const answerBlocks = [...(items[itemIndex].answerBlocks || [])]; answerBlocks[blockIndex] = { ...answerBlocks[blockIndex], type: event.target.value, url: '' }; items[itemIndex] = { ...items[itemIndex], answerBlocks }; updateSection(index, { data: { ...section.data, items } });
                                          }} className="rounded-lg border border-slate-300 px-2 py-2 text-xs"><option value="image">Image</option><option value="video">Video</option></select>
                                          <input value={block.url || ''} onChange={(event) => {
                                            const items = [...section.data.items]; const answerBlocks = [...(items[itemIndex].answerBlocks || [])]; answerBlocks[blockIndex] = { ...answerBlocks[blockIndex], url: event.target.value }; items[itemIndex] = { ...items[itemIndex], answerBlocks }; updateSection(index, { data: { ...section.data, items } });
                                          }} placeholder={block.type === 'image' ? 'Image URL' : 'YouTube, Vimeo, or video URL'} className="min-w-0 flex-1 basis-[180px] rounded-lg border border-slate-300 px-3 py-2 text-xs" />
                                          <label className="cursor-pointer rounded-lg bg-primary px-2 py-2 text-[10px] font-bold text-white">{block.type === 'image' ? 'Upload image' : 'Upload video'}<input type="file" accept={block.type === 'image' ? 'image/*' : 'video/mp4,video/webm,video/quicktime'} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFaqMedia(index, itemIndex, blockIndex, file, block.type); event.target.value = ''; }} /></label>
                                        </div>
                                        {block.type === 'image' && <input value={block.alt || ''} onChange={(event) => {
                                          const items = [...section.data.items]; const answerBlocks = [...(items[itemIndex].answerBlocks || [])]; answerBlocks[blockIndex] = { ...answerBlocks[blockIndex], alt: event.target.value }; items[itemIndex] = { ...items[itemIndex], answerBlocks }; updateSection(index, { data: { ...section.data, items } });
                                        }} placeholder="Image description (optional)" className="rounded-lg border border-slate-300 px-3 py-2 text-xs" />}
                                      </div>
                                    )}
                                    <button type="button" onClick={() => {
                                      const items = [...section.data.items]; const answerBlocks = (items[itemIndex].answerBlocks || []).filter((_: any, currentIndex: number) => currentIndex !== blockIndex); items[itemIndex] = { ...items[itemIndex], answerBlocks }; updateSection(index, { data: { ...section.data, items } });
                                    }} className="mt-2 text-[10px] font-bold text-red-600">Remove media/text block</button>
                                  </div>
                                ))}
                                <div className="flex flex-wrap gap-2">
                                  {(['text', 'image', 'video'] as const).map((blockType) => <button key={blockType} type="button" onClick={() => {
                                    const items = [...section.data.items]; const answerBlocks = [...(items[itemIndex].answerBlocks || []), { type: blockType, content: '', url: '' }]; items[itemIndex] = { ...items[itemIndex], answerBlocks }; updateSection(index, { data: { ...section.data, items } });
                                  }} className="rounded-lg border border-slate-300 px-2 py-1.5 text-[10px] font-bold text-slate-600">+ {blockType} block</button>)}
                                </div>
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={() => updateSection(index, { data: { ...section.data, items: [...(section.data.items || []), { question: '', answerBlocks: [{ type: 'text', content: '' }] }] } })} className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-[10px] font-bold text-slate-600">+ Add FAQ</button>
                        </div>
                      </div>
                    ) : section.type === 'Video' ? (
                      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Video source
                          <select value={section.data.source || 'embed'} onChange={(event) => updateSection(index, { data: { ...section.data, source: event.target.value } })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs">
                            <option value="embed">YouTube or Vimeo embed</option>
                            <option value="upload">Upload video file</option>
                          </select>
                        </label>
                        {section.data.source === 'upload' ? (
                          <div>
                            <input
                              ref={(element) => { videoInputRefs.current[section.id] = element; }}
                              type="file"
                              accept="video/mp4,video/webm,video/quicktime"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void uploadVideo(section.id, file);
                                event.target.value = '';
                              }}
                            />
                            <button type="button" onClick={() => videoInputRefs.current[section.id]?.click()} disabled={uploadingVideo === section.id} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-white disabled:opacity-60">
                              <Upload className="h-3.5 w-3.5" /> {uploadingVideo === section.id ? 'Uploading...' : 'Choose video'}
                            </button>
                            {section.data.url && <p className="mt-2 break-all text-[10px] text-slate-500">{section.data.url}</p>}
                          </div>
                        ) : (
                          <input value={section.data.url || ''} onChange={(event) => updateSection(index, { data: { ...section.data, url: event.target.value } })} placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..." className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs" />
                        )}
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Video title (optional)
                          <input value={section.data.title || ''} onChange={(event) => updateSection(index, { data: { ...section.data, title: event.target.value } })} placeholder="Watch our guide video" className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs" />
                        </label>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Caption
                          <input value={section.data.caption || ''} onChange={(event) => updateSection(index, { data: { ...section.data, caption: event.target.value } })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs" />
                        </label>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-[11px] text-slate-500">This section renders the guide card grid selected for this guide page.</p>
                      </div>
                    )}
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
