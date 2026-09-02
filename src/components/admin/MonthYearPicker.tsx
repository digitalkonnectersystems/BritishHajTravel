'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatTravelMonth, parseLegacyTravelMonth } from '@/lib/packageHelpers';

const MONTHS = [
  { short: 'Jan', index: 0 },
  { short: 'Feb', index: 1 },
  { short: 'Mar', index: 2 },
  { short: 'Apr', index: 3 },
  { short: 'May', index: 4 },
  { short: 'Jun', index: 5 },
  { short: 'Jul', index: 6 },
  { short: 'Aug', index: 7 },
  { short: 'Sep', index: 8 },
  { short: 'Oct', index: 9 },
  { short: 'Nov', index: 10 },
  { short: 'Dec', index: 11 },
];

interface MonthYearPickerProps {
  value?: string | null;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MonthYearPicker({
  value,
  onChange,
  placeholder = 'Select Travel Month',
  className = '',
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse existing value or default to current year
  const parsed = parseLegacyTravelMonth(value);
  const storedValue = parsed.travelMonth;

  let selectedYear: number | null = null;
  let selectedMonthIdx: number | null = null;

  if (storedValue && /^\d{4}-\d{2}$/.test(storedValue)) {
    const parts = storedValue.split('-');
    selectedYear = parseInt(parts[0], 10);
    selectedMonthIdx = parseInt(parts[1], 10) - 1;
  }

  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState<number>(selectedYear || currentYear);

  // Sync viewYear when selectedYear changes
  useEffect(() => {
    if (selectedYear) {
      setViewYear(selectedYear);
    }
  }, [selectedYear]);

  // Close on click outside
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

  const handleSelectMonth = (monthIdx: number) => {
    const monthNum = String(monthIdx + 1).padStart(2, '0');
    const formattedVal = `${viewYear}-${monthNum}`;
    onChange(formattedVal);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleThisMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = new Date();
    const curY = now.getFullYear();
    const curM = String(now.getMonth() + 1).padStart(2, '0');
    onChange(`${curY}-${curM}`);
    setIsOpen(false);
  };

  const displayLabel = formatTravelMonth(value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-primary text-xs transition-colors cursor-pointer outline-none focus:border-primary shadow-2xs text-left"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <span className={displayLabel ? 'font-semibold text-slate-800' : 'text-slate-400'}>
            {displayLabel || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {displayLabel && (
            <span
              role="button"
              onClick={handleClear}
              className="p-1 bg-red-600 hover:bg-red-700 rounded-full text-white hover:text-white transition-colors"
              title="Clear travel month"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </button>

      {/* Month + Year Calendar Picker Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 animate-in fade-in-50 zoom-in-95">
          {/* Year Header / Navigator */}
          <div className="flex items-center justify-between mb-4 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
            <button
              type="button"
              onClick={() => setViewYear((y) => y - 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer border-none"
              title="Previous Year"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-extrabold text-sm text-slate-900 tracking-wide">
              {viewYear}
            </span>

            <button
              type="button"
              onClick={() => setViewYear((y) => y + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer border-none"
              title="Next Year"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month 3x4 Grid (Jan - Dec) */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((m) => {
              const isSelected = selectedYear === viewYear && selectedMonthIdx === m.index;
              const isCurrentMonth =
                new Date().getFullYear() === viewYear && new Date().getMonth() === m.index;

              return (
                <button
                  key={m.short}
                  type="button"
                  onClick={() => handleSelectMonth(m.index)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${isSelected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : isCurrentMonth
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                >
                  {m.short}
                </button>
              );
            })}
          </div>

          {/* Quick Actions (Clear, This Month) */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 font-semibold cursor-pointer border-none bg-transparent"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleThisMonth}
              className="text-primary hover:underline font-bold cursor-pointer border-none bg-transparent"
            >
              This Month
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
