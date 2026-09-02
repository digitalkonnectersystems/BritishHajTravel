'use client';

import { useState } from 'react';
import { createVisaService, updateVisaServiceAction, deleteVisaServiceAction } from '@/actions/visaActions';
import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import { Trash2, Edit2, Plus } from 'lucide-react';

interface VisasClientProps {
  initialVisas: any[];
}

export default function VisasClient({ initialVisas }: VisasClientProps) {
  const [visas, setVisas] = useState<any[]>(initialVisas);
  const [editingVisa, setEditingVisa] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);

  const [newVisa, setNewVisa] = useState({
    title: '',
    processingTime: '24-48 Hours',
    shortDescription: '',
    fullDescription: '',
    requirements: 'Canadian Passport, Digital Photo',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newVisa.title);
    formData.append('processingTime', newVisa.processingTime);
    formData.append('shortDescription', newVisa.shortDescription);
    formData.append('fullDescription', newVisa.fullDescription);

    const res = await createVisaService(formData);
    if (res.success) {
      setSaveMsg('Visa category created successfully!');
      setTimeout(() => setSaveMsg(null), 3000);
      setIsCreating(false);
      setNewVisa({
        title: '',
        processingTime: '24-48 Hours',
        shortDescription: '',
        fullDescription: '',
        requirements: 'Canadian Passport, Digital Photo',
      });
      window.location.reload();
    } else {
      alert(res.error || 'Failed to create visa category.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisa) return;

    const res = await updateVisaServiceAction(editingVisa.id, {
      title: editingVisa.title,
      processingTime: editingVisa.processingTime,
      shortDescription: editingVisa.shortDescription,
      fullDescription: editingVisa.fullDescription,
      requirements: editingVisa.requirements,
      isPublished: editingVisa.isPublished ?? true,
    });

    if (res.success) {
      setVisas((prev) => prev.map((v) => (v.id === editingVisa.id ? editingVisa : v)));
      setEditingVisa(null);
      setSaveMsg('Visa service updated successfully!');
      setTimeout(() => setSaveMsg(null), 3000);
    } else {
      alert(res.error || 'Failed to update visa service.');
    }
  };

  const handleDeleteInitiate = (id: number, title: string) => {
    setConfirmConfig({
      icon: <Trash2 className="w-4 h-4 text-red-600" />,
      title: `Delete ${title}?`,
      message: `Are you sure you want to delete "${title}"? This will permanently remove it from the database.`,
      confirmText: 'Yes, Delete Category',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        const res = await deleteVisaServiceAction(id);
        if (res.success) {
          setVisas((prev) => prev.filter((v) => v.id !== id));
          setSaveMsg('Visa service deleted.');
          setTimeout(() => setSaveMsg(null), 3000);
        } else {
          alert(res.error || 'Failed to delete visa service.');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">Saudi Visa Services</h1>
          <p className="text-xs text-slate-500 mt-1 mb-0">
            Manage authorized Saudi visa processing categories, requirements &amp; guidelines
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-xs font-bold text-primary animate-in fade-in">{saveMsg}</span>}
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="bg-primary hover:bg-[#00382B] text-white px-5 py-2.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer border-none shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Close Form' : 'Add Visa Category'}
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs animate-in fade-in">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4">
            ✦ Add New Visa Service Category
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Visa Title *</label>
              <input
                type="text"
                placeholder="e.g. Saudi Tourist eVisa"
                value={newVisa.title}
                onChange={(e) => setNewVisa({ ...newVisa, title: e.target.value })}
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Processing Time *</label>
              <input
                type="text"
                placeholder="e.g. 24-48 Hours"
                value={newVisa.processingTime}
                onChange={(e) => setNewVisa({ ...newVisa, processingTime: e.target.value })}
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Short Description *</label>
              <input
                type="text"
                placeholder="Brief summary shown on cards"
                value={newVisa.shortDescription}
                onChange={(e) => setNewVisa({ ...newVisa, shortDescription: e.target.value })}
                required
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Description</label>
              <textarea
                rows={3}
                placeholder="Detailed guidance and eligibility terms"
                value={newVisa.fullDescription}
                onChange={(e) => setNewVisa({ ...newVisa, fullDescription: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-5 py-2 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full text-xs font-extrabold bg-primary text-white border-none cursor-pointer shadow-md"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {editingVisa && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-700" /> Edit Visa Category
              </h3>
              <button
                type="button"
                onClick={() => setEditingVisa(null)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none text-base cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Visa Title</label>
                <input
                  type="text"
                  value={editingVisa.title}
                  onChange={(e) => setEditingVisa({ ...editingVisa, title: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Processing Time</label>
                <input
                  type="text"
                  value={editingVisa.processingTime}
                  onChange={(e) => setEditingVisa({ ...editingVisa, processingTime: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingVisa.shortDescription || ''}
                  onChange={(e) => setEditingVisa({ ...editingVisa, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingVisa.fullDescription || ''}
                  onChange={(e) => setEditingVisa({ ...editingVisa, fullDescription: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVisa(null)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-xs font-extrabold bg-primary text-white border-none cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visas.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-100">
            No visa categories created in database yet.
          </div>
        ) : (
          visas.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between relative overflow-hidden hover:border-slate-200 transition-all"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DB9E30] to-[#E7BE6E]" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#92400E] bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    ⏱ {v.processingTime}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingVisa(v)}
                      title="Edit Category"
                      className="w-7 h-7 rounded-full bg-slate-100 hover:bg-primary text-slate-600 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteInitiate(v.id, v.title)}
                      title="Delete Category"
                      className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 m-0 mb-2">{v.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed m-0 mb-4">{v.shortDescription}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ✓ Published
                </span>
                <span className="text-[10px] font-mono text-slate-400">ID: {v.id}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
    </div>
  );
}
