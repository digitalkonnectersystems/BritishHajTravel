"use client";

import React from 'react';

export interface SeoSettings {
  includeInSitemap?: boolean;
  priority?: string;
  changeFrequency?: string;
  canonicalUrl?: string;
  customUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  lastModifiedOverride?: string;
}

interface Props {
  data: SeoSettings;
  onChange: (data: SeoSettings) => void;
}

export default function SeoSettingsForm({ data, onChange }: Props) {
  const update = (key: keyof SeoSettings, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="flex items-center gap-2 cursor-pointer bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <input
            type="checkbox"
            checked={data.includeInSitemap !== false}
            onChange={(e) => update('includeInSitemap', e.target.checked)}
            className="w-4 h-4 text-primary rounded border-slate-300"
          />
          <div>
            <span className="block text-sm font-bold text-slate-800">Include in Sitemap</span>
            <span className="block text-xs text-slate-500">Allow search engines to index this page</span>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <input
            type="checkbox"
            checked={data.noIndex || false}
            onChange={(e) => update('noIndex', e.target.checked)}
            className="w-4 h-4 text-red-600 rounded border-slate-300"
          />
          <div>
            <span className="block text-sm font-bold text-slate-800">NoIndex</span>
            <span className="block text-xs text-slate-500">Add noindex meta tag (excludes from sitemap)</span>
          </div>
        </label>

        <label className="flex items-center gap-2 cursor-pointer bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <input
            type="checkbox"
            checked={data.noFollow || false}
            onChange={(e) => update('noFollow', e.target.checked)}
            className="w-4 h-4 text-orange-600 rounded border-slate-300"
          />
          <div>
            <span className="block text-sm font-bold text-slate-800">NoFollow</span>
            <span className="block text-xs text-slate-500">Add nofollow meta tag to links</span>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Priority</label>
          <input
            type="number"
            step="0.1"
            min="0.0"
            max="1.0"
            value={data.priority || ''}
            placeholder="e.g. 0.8"
            onChange={(e) => update('priority', e.target.value)}
            className="w-full text-sm p-3 border border-slate-200 rounded-lg outline-none focus:border-primary"
          />
          <p className="text-[10px] text-slate-500 mt-1">Leave blank to use default (0.0 to 1.0)</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Change Frequency</label>
          <select
            value={data.changeFrequency || ''}
            onChange={(e) => update('changeFrequency', e.target.value)}
            className="w-full text-sm p-3 border border-slate-200 rounded-lg outline-none focus:border-primary"
          >
            <option value="">-- Use Default --</option>
            {['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Canonical URL Override</label>
          <input
            type="url"
            value={data.canonicalUrl || ''}
            placeholder="https://example.com/original-page"
            onChange={(e) => update('canonicalUrl', e.target.value)}
            className="w-full text-sm p-3 border border-slate-200 rounded-lg outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Custom Sitemap URL</label>
          <input
            type="url"
            value={data.customUrl || ''}
            placeholder="https://example.com/my-custom-url"
            onChange={(e) => update('customUrl', e.target.value)}
            className="w-full text-sm p-3 border border-slate-200 rounded-lg outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Last Modified Override</label>
          <input
            type="date"
            value={data.lastModifiedOverride || ''}
            onChange={(e) => update('lastModifiedOverride', e.target.value)}
            className="w-full text-sm p-3 border border-slate-200 rounded-lg outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
