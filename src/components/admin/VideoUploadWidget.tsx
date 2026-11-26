'use client';

import { Film, Trash2 } from 'lucide-react';
import { useMediaPicker } from './MediaPickerProvider';

export default function VideoUploadWidget({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const open = useMediaPicker();
  const choose = () => open({
    accept: 'video/mp4,.mp4',
    multiple: false,
    onSelect: items => {
      if (items[0]) onChange(items[0].url);
    },
  });

  return (
    <div className="flex w-full flex-col gap-3">
      {value ? (
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-emerald-200 bg-slate-50">
          <video src={value} controls preload="metadata" className="aspect-video w-full bg-slate-950" />
          <div className="flex items-center justify-between gap-2 p-2">
            <button type="button" onClick={choose} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-800">
              <Film className="h-4 w-4" /> Change MP4
            </button>
            <button type="button" aria-label="Remove video" onClick={() => onChange('')} className="rounded-lg bg-red p-1.5 text-white">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={choose} className="inline-flex items-center justify-center gap-2 self-start rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 hover:border-emerald-600 hover:bg-emerald-100">
          <Film className="h-4 w-4" /> Choose MP4 from Media Library
        </button>
      )}
      <input
        type="text"
        value={value || ''}
        onChange={event => onChange(event.target.value)}
        placeholder="Or paste an MP4 URL..."
        className="min-w-0 w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500"
      />
      <p className="m-0 text-[11px] text-gray-500">Choose or upload an MP4 in the Media Library (maximum 100 MB).</p>
    </div>
  );
}
