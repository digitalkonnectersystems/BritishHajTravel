'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Trash2, Loader2 } from 'lucide-react';
import { getBlogCategories, saveBlogCategories } from '@/actions/blogActions';
import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';

interface CategoryDropdownProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export default function CategoryDropdown({ value, onChange, className = '' }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalConfig | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCats = async () => {
      setLoading(true);
      const cats = await getBlogCategories();
      setCategories(cats);
      if (value && cats.length > 0 && !cats.includes(value)) {
        // Do nothing, just display the current value even if not in DB yet
      } else if (!value && cats.length > 0) {
        onChange(cats[0]);
      }
      setLoading(false);
    };
    fetchCats();
  }, [value, onChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const cat = newCategory.trim();
    if (categories.includes(cat)) {
      onChange(cat);
      setNewCategory('');
      setIsOpen(false);
      return;
    }

    setSaving(true);
    const newCats = [...categories, cat];
    const res = await saveBlogCategories(newCats);
    if (res.success) {
      setCategories(newCats);
      onChange(cat);
      setNewCategory('');
      setIsOpen(false);
    } else {
      alert(res.error || 'Failed to save category');
    }
    setSaving(false);
  };

  const handleDeleteCategory = (catToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${catToDelete}"? This will not delete the blogs, but they may lose their category styling if the category is missing.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        setSaving(true);
        const newCats = categories.filter((c) => c !== catToDelete);
        const res = await saveBlogCategories(newCats);
        if (res.success) {
          setCategories(newCats);
          if (value === catToDelete) {
            onChange(newCats.length > 0 ? newCats[0] : '');
          }
        } else {
          alert(res.error || 'Failed to delete category');
        }
        setSaving(false);
      }
    });
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-left outline-none focus:border-primary disabled:opacity-50"
      >
        <span className="truncate">{loading ? 'Loading...' : value || 'Select Category'}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col max-h-[300px]">
          <div className="overflow-y-auto flex-1 py-1">
            {categories.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500 text-center">No categories found</div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat}
                  className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 transition-colors group ${value === cat ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700'
                    }`}
                  onClick={() => {
                    onChange(cat);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate pr-2">{cat}</span>
                  <button
                    type="button"
                    title="Delete category"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                    onClick={(e) => handleDeleteCategory(cat, e)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-2 bg-slate-50 flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              placeholder="Custom Category..."
              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              disabled={saving || !newCategory.trim()}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-[#003829] disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      <ConfirmModal config={confirmModal} onClose={() => setConfirmModal(null)} />
    </div>
  );
}
