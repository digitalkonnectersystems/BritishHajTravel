'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { deleteDestinationAction, saveDestinationAction } from '@/actions/destinationActions';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';

const emptyDestination = {
  title: '',
  slug: '',
  description: '',
  sectionTitle: 'Packages for this destination',
  bannerImages: [''],
  packageIds: [] as number[],
  status: 'published' as 'published' | 'draft',
  displayOrder: 0,
};

export default function DestinationsClient({ initialDestinations, packages }: { initialDestinations: any[]; packages: any[] }) {
  const [items, setItems] = useState(initialDestinations);
  const [form, setForm] = useState<any>(emptyDestination);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  const beginEdit = (item: any) => {
    setForm({ ...item, bannerImages: item.bannerImages?.length ? item.bannerImages : [''], packageIds: item.packageIds || [] });
    setEditing(true);
    setMessage('');
  };

  const beginCreate = () => {
    setForm(emptyDestination);
    setEditing(true);
    setMessage('');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await saveDestinationAction(form);
    if (!result.success) {
      setMessage(result.error || 'Could not save destination.');
      return;
    }
    setMessage('Destination saved. Refreshing the list...');
    window.location.reload();
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this destination?')) return;
    const result = await deleteDestinationAction(id);
    if (result.success) setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateBanner = (index: number, value: string) => {
    const bannerImages = [...form.bannerImages];
    bannerImages[index] = value;
    setForm({ ...form, bannerImages });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">Destinations</h1>
          <p className="text-xs text-slate-400 mt-1">Manage destination cards, banner sliders, package sections, and header links.</p>
        </div>
        <button type="button" onClick={beginCreate} className="bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Destination</button>
      </div>

      {editing && (
        <form onSubmit={save} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="font-extrabold text-slate-900">{form.id ? 'Edit destination' : 'New destination'}</h2><button type="button" onClick={() => setEditing(false)} className="text-slate-400"><X className="w-4 h-4" /></button></div>
          <label className="text-xs font-bold text-slate-600">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-slate-600">Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="umrah-masjid-al-aqsa" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label>
          <label className="md:col-span-2 text-xs font-bold text-slate-600">Description<textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label>
          <label className="text-xs font-bold text-slate-600">Package section title<input value={form.sectionTitle || ''} onChange={(e) => setForm({ ...form, sectionTitle: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label>
          <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold text-slate-600">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal"><option value="published">Published</option><option value="draft">Draft</option></select></label><label className="text-xs font-bold text-slate-600">Order<input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label></div>
          <div className="md:col-span-2"><div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">Banner images <button type="button" onClick={() => setForm({ ...form, bannerImages: [...form.bannerImages, ''] })} className="text-primary">+ Add image</button></div>{form.bannerImages.map((image: string, index: number) => <div key={index} className="flex items-start gap-2 mb-3"><div className="flex-1"><ImageUploadWidget value={image} onChange={(value) => updateBanner(index, value)} subfolder="destinations" compact /></div>{form.bannerImages.length > 1 && <button type="button" onClick={() => setForm({ ...form, bannerImages: form.bannerImages.filter((_: string, itemIndex: number) => itemIndex !== index) })} className="text-red-500 mt-2" title="Remove banner"><X className="w-4 h-4" /></button>}</div>)}</div>
          <fieldset className="md:col-span-2"><legend className="text-xs font-bold text-slate-600 mb-2">Packages shown on this destination page</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto border border-slate-100 rounded-xl p-3">{packages.length === 0 ? <p className="text-xs text-slate-400">Create packages first to attach them here.</p> : packages.map((pkg) => <label key={pkg.id} className="flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={form.packageIds.includes(pkg.id)} onChange={(e) => setForm({ ...form, packageIds: e.target.checked ? [...form.packageIds, pkg.id] : form.packageIds.filter((id: number) => id !== pkg.id) })} />{pkg.title} <span className="text-slate-400">({pkg.type})</span></label>)}</div></fieldset>
          <div className="md:col-span-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4"><span className="text-xs text-slate-500 mr-auto">{message}</span><button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold">Cancel</button><button type="submit" className="px-4 py-2 rounded-lg bg-gold text-white text-xs font-bold">Save destination</button></div>
        </form>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        {items.length === 0 ? <p className="p-8 text-center text-sm text-slate-400">No destinations created yet.</p> : items.map((item) => <div key={item.id} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0"><div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0">{item.bannerImages?.[0] && <img src={item.bannerImages[0]} alt="" className="w-full h-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="font-bold text-sm text-slate-900">{item.title}</div><div className="text-xs text-slate-400">/destinations/{item.slug} · {item.packageIds?.length || 0} packages · {item.status}</div></div><button type="button" onClick={() => beginEdit(item)} className="p-2 text-primary"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => remove(item.id)} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button></div>)}
      </div>
    </div>
  );
}