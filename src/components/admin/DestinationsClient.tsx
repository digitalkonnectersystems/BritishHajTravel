'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { deleteDestinationAction, saveDestinationAction, updateDestinationOrderAction } from '@/actions/destinationActions';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import { HajjCardFields } from '@/app/admin/packages/[id]/EditPackageClient';
import DetailPageDataFields, { defaultDetailPageData } from '@/components/admin/DetailPageDataFields';

const emptyPackage = { id: '', title: '', description: '', startingPrice: '', status: 'available', cardData: {} };
const emptyDestination = { title: '', slug: '', description: '', sectionTitle: 'Destination Packages', bannerImages: [''], packageIds: [] as number[], packageData: emptyPackage, status: 'published' as 'published' | 'draft', displayOrder: 0 };

function getPackage(destination: any) {
  return destination.packageData || destination.packagesData?.[0] || { ...emptyPackage, title: destination.title };
}

function DestinationPackagePrices({ packageData, setPackageData }: { packageData: any; setPackageData: (value: any) => void }) {
  let cardData = packageData.cardData || {};
  if (typeof cardData === 'string') {
    try { cardData = JSON.parse(cardData); } catch { cardData = {}; }
  }
  const prices = Array.isArray(cardData.packagePrices) ? cardData.packagePrices : [];
  const updatePrices = (nextPrices: any[]) => setPackageData({ ...packageData, cardData: { ...cardData, packagePrices: nextPrices } });

  return (
    <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">Package Type &amp; Price (£) *</h4>
          <p className="text-[11px] text-slate-500 mt-1">Configure the occupancy or package tiers shown on this destination package.</p>
        </div>
        <button type="button" onClick={() => updatePrices([...prices, { packageType: '', price: '' }])} className="rounded-full border border-primary bg-white px-3 py-1.5 text-[11px] font-extrabold text-primary">+ Add Package Type</button>
      </div>
      {prices.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-xs text-slate-500">No package price tiers added yet.</p>}
      {prices.map((item: any, index: number) => (
        <div key={index} className="grid grid-cols-[minmax(0,1fr)_220px_40px] gap-3 rounded-xl border border-slate-200 bg-white p-3 max-md:grid-cols-1">
          <label className="text-[10px] font-bold text-slate-700">PACKAGE TYPE<input value={item.packageType || ''} onChange={(e) => { const next = [...prices]; next[index] = { ...next[index], packageType: e.target.value }; updatePrices(next); }} placeholder="Quad Occupancy" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
          <label className="text-[10px] font-bold text-slate-700">PRICE (£)<input type="number" min="0" step="0.01" value={item.price ?? ''} onChange={(e) => { const next = [...prices]; next[index] = { ...next[index], price: e.target.value }; updatePrices(next); }} placeholder="17995.00" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label>
          <button type="button" onClick={() => updatePrices(prices.filter((_: any, priceIndex: number) => priceIndex !== index))} className="self-end rounded-lg bg-red-50 px-3 py-2 text-red-600" title="Remove package price">×</button>
        </div>
      ))}
    </div>
  );
}

export default function DestinationsClient({ initialDestinations }: { initialDestinations: any[] }) {
  const [items, setItems] = useState(initialDestinations);
  const [form, setForm] = useState<any>(emptyDestination);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editorTab, setEditorTab] = useState<'basic' | 'detail'>('basic');

  const beginCreate = () => {
    setForm({ ...emptyDestination, bannerImages: [''], packageData: { ...emptyPackage, id: `destination-package-${Date.now()}` } });
    setEditing(true); setEditorTab('basic'); setMessage('');
  };

  const beginEdit = (destination: any) => {
    setForm({ ...destination, bannerImages: destination.bannerImages?.length ? destination.bannerImages : [''], packageData: getPackage(destination) });
    setEditing(true); setEditorTab('basic'); setMessage('');
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await saveDestinationAction({ ...form, packagesData: [], packageData: form.packageData });
    if (!result.success) { setMessage(result.error || 'Could not save destination.'); return; }
    window.location.reload();
  };

  const remove = async (id: number) => {
    if (!window.confirm('Delete this destination package?')) return;
    const result = await deleteDestinationAction(id);
    if (result.success) setItems((current) => current.filter((item) => item.id !== id));
  };

  const updateBanner = (index: number, value: string) => {
    const bannerImages = [...form.bannerImages]; bannerImages[index] = value;
    setForm({ ...form, bannerImages });
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...items]; const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved); setDraggedIndex(index); setItems(updated);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    const result = await updateDestinationOrderAction(items.map((item) => item.id));
    if (!result.success) setMessage(result.error || 'Could not update destination order.');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div><h1 className="text-2xl font-extrabold text-slate-900 m-0">Destinations</h1><p className="text-xs text-slate-400 mt-1">Each destination is one package shown on the destinations page.</p></div>
        <button type="button" onClick={beginCreate} className="bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Destination Package</button>
      </div>

      {message && <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs font-semibold text-primary">{message}</div>}

      {editing && <form onSubmit={save} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="font-extrabold text-slate-900">{form.id ? 'Edit destination package' : 'New destination package'}</h2><button type="button" onClick={() => setEditing(false)} className="text-slate-400"><X className="w-4 h-4" /></button></div>
        <div className="md:col-span-2 flex gap-2 border-b border-slate-100 pb-3"><button type="button" onClick={() => setEditorTab('basic')} className={`px-4 py-2 rounded-lg text-xs font-bold ${editorTab === 'basic' ? 'bg-red text-white' : 'bg-slate-100 text-slate-600'}`}>Basic &amp; Card Info</button><button type="button" onClick={() => setEditorTab('detail')} className={`px-4 py-2 rounded-lg text-xs font-bold ${editorTab === 'detail' ? 'bg-red text-white' : 'bg-slate-100 text-slate-600'}`}>Detail Page Content</button></div>
        {editorTab === 'basic' && <>
        <label className="text-xs font-bold text-slate-600">Destination title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label>
        <label className="text-xs font-bold text-slate-600">Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="makkah" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label>
        <label className="md:col-span-2 text-xs font-bold text-slate-600">Description<textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label>
        <label className="text-xs font-bold text-slate-600">Package section title<input value={form.sectionTitle || ''} onChange={(e) => setForm({ ...form, sectionTitle: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal" /></label>
        <label className="text-xs font-bold text-slate-600">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-normal"><option value="published">Published</option><option value="draft">Draft</option></select></label>
        <div className="md:col-span-2"><div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">Banner images <button type="button" onClick={() => setForm({ ...form, bannerImages: [...form.bannerImages, ''] })} className="text-primary">+ Add image</button></div>{form.bannerImages.map((image: string, index: number) => <div key={index} className="flex items-start gap-2 mb-3"><div className="flex-1"><ImageUploadWidget value={image} onChange={(value) => updateBanner(index, value)} subfolder="destinations" compact /></div>{form.bannerImages.length > 1 && <button type="button" onClick={() => setForm({ ...form, bannerImages: form.bannerImages.filter((_: string, itemIndex: number) => itemIndex !== index) })} className="text-red-500 mt-2"><X className="w-4 h-4" /></button>}</div>)}</div>
        <DestinationPackagePrices packageData={form.packageData} setPackageData={(packageData) => setForm({ ...form, packageData })} />
        <div className="md:col-span-2 border-t border-slate-100 pt-4"><div className="mb-3 text-xs font-extrabold uppercase tracking-wider text-primary">Package card details</div><HajjCardFields pkgData={form.packageData} setPkgData={(packageData) => setForm({ ...form, packageData })} includePackageMeta hideBadge /></div>
        </>}
        {editorTab === 'detail' && <div className="md:col-span-2"><DetailPageDataFields data={{ ...defaultDetailPageData, ...(form.packageData?.detailPageData || {}) }} onChange={(detailPageData) => setForm({ ...form, packageData: { ...form.packageData, detailPageData } })} packagesGallery={form.packageData?.packagesGallery || []} onGalleryChange={(packagesGallery) => setForm({ ...form, packageData: { ...form.packageData, packagesGallery } })} /></div>}
        <div className="md:col-span-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-4"><button type="button" onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold">Cancel</button><button type="submit" className="px-4 py-2 rounded-lg bg-red text-white text-xs font-bold">Save destination package</button></div>
      </form>}

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
        {items.length === 0 ? <p className="p-8 text-center text-sm text-slate-400">No destination packages created yet.</p> : items.map((item, index) => { const pkg = getPackage(item); return <div key={item.id} draggable onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => handleDragOver(event, index)} onDragEnd={handleDragEnd} className={`flex items-center gap-4 border-b border-slate-100 p-4 last:border-0 ${draggedIndex === index ? 'bg-emerald-50 opacity-60' : ''}`}><span className="cursor-grab select-none text-slate-400">⋮⋮</span><div className="w-20 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">{pkg.cardData?.bannerImage && <img src={pkg.cardData.bannerImage} alt="" className="w-full h-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="font-bold text-sm text-slate-900">{item.title}</div><div className="text-xs text-slate-400">/destinations/{item.slug} · {pkg.title || item.title} · {pkg.status || 'available'}</div></div><button type="button" onClick={() => beginEdit(item)} className="p-2 text-primary" title="Edit destination package"><Pencil className="w-4 h-4" /></button><button type="button" onClick={() => remove(item.id)} className="p-2 text-red-500" title="Delete destination package"><Trash2 className="w-4 h-4" /></button></div>; })}
      </div>
    </div>
  );
}
