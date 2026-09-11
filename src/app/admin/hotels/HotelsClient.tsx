'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import {
  createHotelAction,
  createHotelCategoryAction,
  deleteHotelAction,
  deleteHotelCategoryAction,
  updateHotelCategoryOrderAction,
  getHotelAdminData,
  updateHotelAction,
  updateHotelCategoryAction,
  updateHotelOrderAction,
  type HotelInput,
} from '@/actions/hotelActions';

const emptyHotel: HotelInput = {
  categoryId: 0,
  name: '',
  city: '',
  imageUrl: '',
  rating: '5.0',
  description: '',
  priceLabel: 'TBC',
  pricePeriod: 'per Night',
  websiteUrl: '',
  displayOrder: 0,
  isPublished: true,
};

function fieldClass() {
  return 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary';
}

export default function HotelsClient() {
  const [categories, setCategories] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [hotelForm, setHotelForm] = useState<HotelInput>(emptyHotel);
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [draggedCategoryIndex, setDraggedCategoryIndex] = useState<number | null>(null);
  const [draggedHotelIndex, setDraggedHotelIndex] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await getHotelAdminData();
    setCategories(data.categories);
    setHotels(data.hotels);
    setHotelForm((current) => ({ ...current, categoryId: current.categoryId || data.categories[0]?.id || 0 }));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = editingCategoryId
      ? await updateHotelCategoryAction(editingCategoryId, { name: categoryName })
      : await createHotelCategoryAction({ name: categoryName });
    if (!result.success) return notify(result.error || 'Unable to save category.');
    setCategoryName('');
    setEditingCategoryId(null);
    notify('Category saved.');
    await loadData();
  };

  const saveHotel = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = editingHotelId
      ? await updateHotelAction(editingHotelId, hotelForm)
      : await createHotelAction(hotelForm);
    if (!result.success) return notify(result.error || 'Unable to save hotel.');
    setHotelForm({ ...emptyHotel, categoryId: categories[0]?.id || 0 });
    setEditingHotelId(null);
    notify('Hotel saved.');
    await loadData();
  };

  const editHotel = (hotel: any) => {
    setEditingHotelId(hotel.id);
    setHotelForm({
      categoryId: hotel.categoryId,
      name: hotel.name || '',
      city: hotel.city || '',
      imageUrl: hotel.imageUrl || '',
      rating: String(hotel.rating || '5.0'),
      description: hotel.description || '',
      priceLabel: hotel.priceLabel || 'TBC',
      pricePeriod: hotel.pricePeriod || 'per Night',
      websiteUrl: hotel.websiteUrl || '',
      displayOrder: hotel.displayOrder || 0,
      isPublished: hotel.isPublished !== false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeHotel = async (id: number) => {
    if (!window.confirm('Delete this hotel?')) return;
    const result = await deleteHotelAction(id);
    if (result.success) { notify('Hotel deleted.'); await loadData(); }
  };

  const removeCategory = async (id: number) => {
    if (!window.confirm('Delete this category and all hotels inside it?')) return;
    const result = await deleteHotelCategoryAction(id);
    if (result.success) { notify('Category deleted.'); await loadData(); }
    else notify(result.error || 'Unable to delete category.');
  };

  const reorderCategories = async (index: number) => {
    if (draggedCategoryIndex === null || draggedCategoryIndex === index) return;
    const updated = [...categories];
    const [moved] = updated.splice(draggedCategoryIndex, 1);
    updated.splice(index, 0, moved);
    setDraggedCategoryIndex(index);
    setCategories(updated);
  };

  const finishCategoryReorder = async () => {
    setDraggedCategoryIndex(null);
    const result = await updateHotelCategoryOrderAction(categories.map((category) => category.id));
    if (!result.success) notify(result.error || 'Unable to update category order.');
  };

  const reorderHotels = (index: number) => {
    if (draggedHotelIndex === null || draggedHotelIndex === index) return;
    const updated = [...hotels];
    const [moved] = updated.splice(draggedHotelIndex, 1);
    updated.splice(index, 0, moved);
    setDraggedHotelIndex(index);
    setHotels(updated);
  };

  const finishHotelReorder = async () => {
    setDraggedHotelIndex(null);
    const result = await updateHotelOrderAction(hotels.map((hotel) => hotel.id));
    if (!result.success) notify(result.error || 'Unable to update hotel order.');
  };

  return (
    <AdminLayout user={{ name: 'Admin User', role: 'Super Admin' }}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-extrabold text-slate-900">Hotels</h1>
            <p className="mt-1 text-xs text-slate-500">Manage hotel listings, city categories, images, and external detail links.</p>
          </div>
          {message && <div className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">{message}</div>}
        </div>

        <div className="grid gap-6 xl:grid-cols-[330px_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-primary">Hotel categories</h2>
            <form onSubmit={saveCategory} className="flex flex-col gap-3">
              <input className={fieldClass()} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g. Makkah" required />
              <button className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-white hover:text-primary" type="submit">
                {editingCategoryId ? 'Update Category' : 'Add Category'}
              </button>
              {editingCategoryId && <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryName(''); }} className="text-xs font-bold text-slate-500">Cancel editing</button>}
            </form>
            <div className="mt-5 flex flex-col gap-2">
              {categories.map((category, categoryIndex) => (
                <div key={category.id} draggable onDragStart={() => setDraggedCategoryIndex(categoryIndex)} onDragOver={(event) => { event.preventDefault(); reorderCategories(categoryIndex); }} onDragEnd={finishCategoryReorder} className={`flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 ${draggedCategoryIndex === categoryIndex ? 'opacity-40' : ''}`}>
                  <span className="mr-2 cursor-grab select-none text-slate-400" title="Drag to reorder">⋮⋮</span>
                  <a href={`/hotels/#${category.slug}`} target="_blank" className="text-sm font-bold text-primary">{category.name}</a>
                  <div className="ml-auto flex gap-2 text-[11px] font-bold">
                    <button type="button" onClick={() => { setEditingCategoryId(category.id); setCategoryName(category.name); }} className="text-blue-600">Edit</button>
                    <button type="button" onClick={() => removeCategory(category.id)} className="text-red-600">Delete</button>
                  </div>
                </div>
              ))}
              {!categories.length && <p className="text-xs text-slate-400">Create a city or place category first.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-extrabold uppercase tracking-wide text-primary">{editingHotelId ? 'Edit hotel' : 'Add hotel'}</h2>
            <form onSubmit={saveHotel} className="grid gap-3 md:grid-cols-2">
              <select className={fieldClass()} value={hotelForm.categoryId} onChange={(e) => setHotelForm({ ...hotelForm, categoryId: Number(e.target.value) })} required>
                <option value={0}>Select category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <input className={fieldClass()} value={hotelForm.name} onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })} placeholder="Hotel name" required />
              <input className={fieldClass()} value={hotelForm.city} onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })} placeholder="City or place" required />
              <input className={fieldClass()} value={hotelForm.websiteUrl} onChange={(e) => setHotelForm({ ...hotelForm, websiteUrl: e.target.value })} placeholder="https://hotel-website.com" type="url" required />
              <input className={fieldClass()} value={hotelForm.priceLabel} onChange={(e) => setHotelForm({ ...hotelForm, priceLabel: e.target.value })} placeholder="Price label, e.g. £180" />
              <input className={fieldClass()} value={hotelForm.pricePeriod} onChange={(e) => setHotelForm({ ...hotelForm, pricePeriod: e.target.value })} placeholder="per Night" />
              <input className={fieldClass()} value={hotelForm.rating} onChange={(e) => setHotelForm({ ...hotelForm, rating: e.target.value })} placeholder="Rating 0-5" type="number" min="0" max="5" step="0.1" />
              <div className="md:col-span-2"><ImageUploadWidget value={hotelForm.imageUrl || ''} onChange={(url) => setHotelForm({ ...hotelForm, imageUrl: url })} subfolder="hotels" /></div>
              <textarea className={`${fieldClass()} md:col-span-2`} rows={3} value={hotelForm.description} onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })} placeholder="Short hotel description" />
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={hotelForm.isPublished !== false} onChange={(e) => setHotelForm({ ...hotelForm, isPublished: e.target.checked })} /> Published on website</label>
              <div className="flex gap-2 md:col-span-2">
                <button className="rounded-lg bg-[#ff1010] px-5 py-2 text-xs font-bold text-white hover:bg-[#c90000]" type="submit">{editingHotelId ? 'Update Hotel' : 'Add Hotel'}</button>
                {editingHotelId && <button type="button" onClick={() => { setEditingHotelId(null); setHotelForm({ ...emptyHotel, categoryId: categories[0]?.id || 0 }); }} className="rounded-lg border border-slate-300 px-5 py-2 text-xs font-bold text-slate-600">Cancel</button>}
              </div>
            </form>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4"><h2 className="m-0 text-sm font-extrabold uppercase tracking-wide text-primary">Current hotels</h2></div>
          {loading ? <p className="p-5 text-sm text-slate-500">Loading hotels...</p> : (
            <div className="divide-y divide-slate-100">
              {hotels.map((hotel, hotelIndex) => (
                <div key={hotel.id} draggable onDragStart={() => setDraggedHotelIndex(hotelIndex)} onDragOver={(event) => { event.preventDefault(); reorderHotels(hotelIndex); }} onDragEnd={finishHotelReorder} className={`grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 ${draggedHotelIndex === hotelIndex ? 'bg-emerald-50 opacity-60' : ''}`}>
                  <span className="cursor-grab select-none text-slate-400" title="Drag to reorder">⋮⋮</span>
                  <div className="flex min-w-0 items-center justify-self-start gap-3">
                    {hotel.imageUrl ? <img src={hotel.imageUrl} alt="" className="h-14 w-20 rounded object-cover" /> : <div className="h-14 w-20 rounded bg-slate-100" />}
                    <div className="min-w-0"><p className="m-0 text-sm font-bold text-slate-900">{hotel.name}</p><p className="m-0 text-xs text-slate-500">{hotel.city} · {categories.find((category) => category.id === hotel.categoryId)?.name || 'Uncategorised'}</p></div>
                  </div>
                  <div className="flex justify-self-end gap-2"><button type="button" onClick={() => editHotel(hotel)} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">Edit</button><button type="button" onClick={() => removeHotel(hotel.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600">Delete</button></div>
                </div>
              ))}
              {!hotels.length && <p className="p-5 text-sm text-slate-500">No hotels added yet.</p>}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
