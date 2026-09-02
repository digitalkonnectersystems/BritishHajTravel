import React from 'react';
import { Sun, MoonStar, Eye, EyeOff } from 'lucide-react';
import { StructuredDuration } from '@/lib/packageHelpers';

interface DurationInputProps {
  value?: StructuredDuration | string | number | null;
  onChange: (val: StructuredDuration) => void;
  className?: string;
  defaultUnit?: 'days' | 'nights';
  showToggle?: boolean;
  enabled?: boolean;
  onToggleChange?: (enabled: boolean) => void;
}

export default function DurationInput({
  value,
  onChange,
  className = '',
  defaultUnit = 'nights',
  showToggle = false,
  enabled = true,
  onToggleChange,
}: DurationInputProps) {
  // Normalize incoming value to { value: number, unit: 'days' | 'nights' }
  let numVal = 14;
  let unitVal: 'days' | 'nights' = defaultUnit;

  if (value && typeof value === 'object' && 'value' in value) {
    const n = parseInt(String(value.value), 10);
    numVal = !isNaN(n) && n > 0 ? n : 14;
    unitVal = value.unit === 'days' ? 'days' : 'nights';
  } else if (typeof value === 'number') {
    numVal = value > 0 ? value : 14;
  } else if (typeof value === 'string' && value.trim()) {
    const match = value.trim().match(/^(\d+)\s*(days?|nights?)?/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n) && n > 0) numVal = n;
      if (match[2]) {
        unitVal = match[2].toLowerCase().startsWith('day') ? 'days' : 'nights';
      }
    }
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      onChange({ value: 1, unit: unitVal });
      return;
    }
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= 1) {
      onChange({ value: val, unit: unitVal });
    }
  };

  const handleUnitToggle = (newUnit: 'days' | 'nights') => {
    onChange({ value: numVal, unit: newUnit });
  };

  return (
    <div className={`flex items-center gap-1.5 flex-wrap sm:flex-nowrap ${className}`}>
      {/* Number input */}
      <div className="relative min-w-[50px] flex-1">
        <input
          type="number"
          min="1"
          step="1"
          value={numVal}
          disabled={showToggle && !enabled}
          onChange={handleNumberChange}
          className={`w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-primary shadow-2xs ${showToggle && !enabled ? 'bg-slate-100 text-slate-400 opacity-60' : ''
            }`}
          placeholder="e.g. 14"
        />
      </div>

      {/* Segmented Toggle for Days / Nights */}
      <div className={`flex bg-slate-100 p-0.5 gap-0.5 rounded-xl border border-slate-200 shrink-0 ${showToggle && !enabled ? 'opacity-50 pointer-events-none' : ''
        }`}>
        <button
          type="button"
          onClick={() => handleUnitToggle('days')}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1 ${unitVal === 'days'
            ? 'bg-gold text-ink shadow-xs'
            : 'hover:bg-ink/30 text-ink-lt hover:text-ink'
            }`}
        >
          <Sun className="w-3 h-3" />
          <span>Days</span>
        </button>
        <button
          type="button"
          onClick={() => handleUnitToggle('nights')}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center gap-1 ${unitVal === 'nights'
            ? 'bg-gold text-ink shadow-xs'
            : 'hover:bg-ink/30 text-ink-lt hover:text-ink'
            }`}
        >
          <MoonStar className="w-3 h-3" />
          <span>Nights</span>
        </button>
      </div>

      {/* Optional Show/Hide Toggle Button */}
      {showToggle && onToggleChange && (
        <button
          type="button"
          onClick={() => onToggleChange(!enabled)}
          title={enabled ? 'Hide duration badge on frontend' : 'Display duration badge on frontend'}
          className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${enabled
              ? 'bg-emerald-50 text-[#004B39] border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-100 text-amber-500 border-amber-500 hover:bg-amber-200 hover:text-amber-600'
            }`}
        >
          {enabled ? <Eye className="w-3 h-3 text-[#004B39]" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
          <span className="text-[10px] font-bold">{enabled ? 'Show' : 'Hide'}</span>
        </button>
      )}
    </div>
  );
}
