'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { icons, Search, X, ChevronDown, Check } from 'lucide-react';
import DynamicIcon from '@/components/ui/DynamicIcon';

// Generate a searchable list from real lucide-react icons
const allLucideIcons: { name: string; label: string }[] = Object.keys(icons || {}).map((iconName) => {
  // Convert PascalCase to Human Readable Label (e.g. "PlaneTakeoff" -> "Plane Takeoff")
  const label = iconName.replace(/([A-Z])/g, ' $1').trim();
  return {
    name: iconName,
    label,
  };
});

// Common travel/hotel/package icons prioritized at top
const priorityIconNames = [
  'Plane', 'Hotel', 'Utensils', 'Bus', 'Gift', 'FileText', 'FileCheck', 'Shield',
  'ShieldCheck', 'Users', 'UserCheck', 'Star', 'Calendar', 'Clock', 'Compass',
  'MapPin', 'Bed', 'Coffee', 'CheckCircle', 'Sparkles', 'Ticket', 'Luggage', 'Moon', 'Sun'
];

interface IconPickerProps {
  value?: string | { provider: string; name: string } | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function IconPicker({
  value,
  onChange,
  placeholder = 'Select Icon',
  className = '',
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeProviderTab, setActiveProviderTab] = useState<'lucide' | 'dynamic'>('lucide');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Extract selected icon name string
  const selectedIconName = typeof value === 'object' && value !== null ? value.name : (value || '');

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
      setFocusedIndex(0);
    }
  }, [isOpen]);

  // Filtered icons with performance limit
  const filteredIcons = useMemo(() => {
    if (activeProviderTab === 'dynamic') return [];

    const q = search.toLowerCase().trim();
    if (!q) {
      // Prioritize common icons when search is empty
      const prioritySet = new Set(priorityIconNames);
      const topItems = allLucideIcons.filter((i) => prioritySet.has(i.name));
      const rest = allLucideIcons.filter((i) => !prioritySet.has(i.name)).slice(0, 40);
      return [...topItems, ...rest];
    }

    return allLucideIcons
      .filter(
        (icon) =>
          icon.name.toLowerCase().includes(q) ||
          icon.label.toLowerCase().includes(q)
      )
      .slice(0, 60); // Limit rendered search results for high performance
  }, [search, activeProviderTab]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, filteredIcons.length - 1));
      scrollFocusedIntoView(focusedIndex + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
      scrollFocusedIntoView(focusedIndex - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredIcons[focusedIndex]) {
        handleSelect(filteredIcons[focusedIndex].name);
      }
    }
  };

  const scrollFocusedIntoView = (idx: number) => {
    if (!listContainerRef.current) return;
    const items = listContainerRef.current.querySelectorAll('[data-icon-item]');
    if (items[idx]) {
      (items[idx] as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  };

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Selected item human label
  const selectedLabel = useMemo(() => {
    if (!selectedIconName) return '';
    const item = allLucideIcons.find(
      (i) => i.name.toLowerCase() === selectedIconName.toLowerCase()
    );
    return item ? item.label : selectedIconName;
  }, [selectedIconName]);

  return (
    <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-primary text-xs transition-colors cursor-pointer outline-none focus:border-primary shadow-2xs text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 overflow-hidden truncate">
          {selectedIconName ? (
            <>
              <div className="w-5 h-5 rounded-md bg-emerald-50 text-primary flex items-center justify-center shrink-0">
                <DynamicIcon name={selectedIconName} className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-slate-800 truncate">{selectedLabel}</span>
            </>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedIconName && (
            <span
              role="button"
              onClick={handleClear}
              className="p-1 bg-red-600 hover:bg-red-700 rounded-full text-white hover:text-white transition-colors"
              title="Clear icon"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Provider Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveProviderTab('lucide')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${activeProviderTab === 'lucide'
                ? 'bg-gold text-ink shadow-xs'
                : 'hover:bg-ink/30 text-ink-lt hover:text-ink'
                }`}
            >
              Lucide Icons
            </button>
            <button
              type="button"
              onClick={() => setActiveProviderTab('dynamic')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${activeProviderTab === 'dynamic'
                ? 'bg-gold text-ink shadow-xs'
                : 'hover:bg-ink/30 text-ink-lt hover:text-ink'
                }`}
            >
              Dynamic Icons
            </button>
          </div>

          {activeProviderTab === 'dynamic' ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <p className="font-medium text-slate-500">Dynamic icons unavailable</p>
              <p className="text-[10px] text-slate-400">
                External dynamic icon provider is not configured. Please choose from the available Lucide icon library.
              </p>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-white">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search icons (e.g. plane, hotel, utensils)..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setFocusedIndex(0);
                  }}
                  className="w-full text-xs outline-none bg-transparent placeholder:text-slate-400 text-slate-800"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Icon List */}
              <div
                ref={listContainerRef}
                className="max-h-60 overflow-y-auto p-1.5 space-y-0.5"
                role="listbox"
              >
                {filteredIcons.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No icons found for &ldquo;{search}&rdquo;
                  </div>
                ) : (
                  filteredIcons.map((icon, idx) => {
                    const isSelected = selectedIconName.toLowerCase() === icon.name.toLowerCase();
                    const isFocused = focusedIndex === idx;
                    return (
                      <div
                        key={icon.name}
                        data-icon-item
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(icon.name)}
                        onMouseEnter={() => setFocusedIndex(idx)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-colors ${isSelected
                          ? 'bg-emerald-50 text-primary font-bold'
                          : isFocused
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                          >
                            <DynamicIcon name={icon.name} className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{icon.label}</span>
                        </div>

                        {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0 ml-2" />}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
