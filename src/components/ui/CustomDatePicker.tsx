'use client';

import { useRef } from 'react';
import { Calendar } from 'lucide-react';

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export default function CustomDatePicker({ value, onChange, className = '' }: CustomDatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  let formattedDate = 'Select Date';
  if (value) {
    const d = new Date(value);
    // Add timezone offset to prevent date shifting to previous day
    const userTimezoneOffset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d.getTime() + userTimezoneOffset);
    formattedDate = localDate.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
  }

  const handleClick = () => {
    if (inputRef.current && 'showPicker' in HTMLInputElement.prototype) {
      try {
        inputRef.current.showPicker();
      } catch (e) {
        inputRef.current.focus();
      }
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-left cursor-pointer hover:border-primary transition-colors"
      >
        <span className={value ? 'text-slate-800' : 'text-slate-400'}>{formattedDate}</span>
        <Calendar className="w-4 h-4 text-slate-400" />
      </div>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute bottom-0 left-0 w-0 h-0 opacity-0 pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
}
