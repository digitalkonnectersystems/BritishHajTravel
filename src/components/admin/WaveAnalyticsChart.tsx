'use client';

import React, { useId } from 'react';

export type WaveSeries = {
  name: string;
  values: number[];
  colors?: [string, string, string];
};

export const WAVE_PALETTES: [string, string, string][] = [
  ['#0d9488', '#38bdf8', '#6366f1'],
  ['#2563eb', '#8b5cf6', '#d946ef'],
  ['#f59e0b', '#fb7185', '#8b5cf6'],
  ['#10b981', '#06b6d4', '#3b82f6'],
  ['#8b5cf6', '#ec4899', '#f97316'],
];

const SVG_WIDTH = 720;
const SVG_HEIGHT = 236;
const LEFT = 38;
const RIGHT = 14;
const TOP = 22;
const BOTTOM = 36;

function monotoneCurve(points: { x: number; y: number }[]): string {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  // Monotone cubic Hermite interpolation prevents overshoot and negative-looking counts.
  const slopes = points.slice(1).map((p, i) => (p.y - points[i].y) / (p.x - points[i].x));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === points.length - 1) return slopes[slopes.length - 1];
    if (slopes[i - 1] * slopes[i] <= 0) return 0;
    return (2 * slopes[i - 1] * slopes[i]) / (slopes[i - 1] + slopes[i]);
  });
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p = points[i];
    const q = points[i + 1];
    const dx = q.x - p.x;
    d += ` C ${(p.x + dx / 3).toFixed(2)} ${(p.y + dx * tangents[i] / 3).toFixed(2)} ${(q.x - dx / 3).toFixed(2)} ${(q.y - dx * tangents[i + 1] / 3).toFixed(2)} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`;
  }
  return d;
}

export function WaveAnalyticsChart({
  title, description, labels, series, mode = 'timeline', emptyText = 'No records for this period', compact = false,
}: {
  title?: string;
  description?: string;
  labels: string[];
  series: WaveSeries[];
  mode?: 'timeline' | 'categories';
  emptyText?: string;
  compact?: boolean;
}) {
  const chartId = useId().replace(/:/g, '');
  const count = labels.length;
  const active = series.filter(s => s.values.length === count && count > 0);
  const maxValue = Math.max(0, ...active.flatMap(s => s.values.map(v => Number.isFinite(v) ? Math.max(0, v) : 0)));
  const maxY = Math.max(1, Math.ceil(maxValue * 1.14));
  const baseY = SVG_HEIGHT - BOTTOM;
  const chartWidth = SVG_WIDTH - LEFT - RIGHT;
  const chartHeight = baseY - TOP;
  const coords = (values: number[]) => values.map((value, index) => ({
    x: LEFT + (count === 1 ? chartWidth / 2 : (chartWidth * index / (count - 1))),
    y: baseY - Math.min(maxY, Math.max(0, Number.isFinite(value) ? value : 0)) * chartHeight / maxY,
  }));
  const visibleTicks = count > 1 ? [0, Math.round((count - 1) / 2), count - 1] : count ? [0] : [];
  const noData = maxValue === 0;

  return (
    <section className={`overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_20px_50px_-35px_rgba(30,41,59,.48)] ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      {(title || description) && <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>{title && <h3 className="m-0 text-base font-extrabold tracking-tight text-slate-900">{title}</h3>}{description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}</div>
        <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-teal-700">{mode === 'timeline' ? 'Daily activity' : 'Category snapshot'}</span>
      </div>}
      <div className="rounded-[20px] border border-slate-100 bg-gradient-to-br from-[#f7fbff] via-[#f8f7ff] to-[#f0fbf6] p-3 sm:p-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Chart series">
          {active.map((s, i) => <div key={`${s.name}-${i}`} className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-600"><span className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ background: `linear-gradient(90deg, ${(s.colors || WAVE_PALETTES[i % WAVE_PALETTES.length]).join(', ')})` }} />{s.name}</div>)}
        </div>
        <svg className="mt-3 block w-full" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} role="img" aria-label={`${title || 'Analytics'}: ${active.map(s => `${s.name}: ${s.values.join(', ')}`).join('; ')}`}>
          <defs>
            {active.map((s, i) => {
              const colors = s.colors || WAVE_PALETTES[i % WAVE_PALETTES.length];
              return <React.Fragment key={`${chartId}-${i}`}>
                <linearGradient id={`${chartId}-line-${i}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={colors[0]}/><stop offset="50%" stopColor={colors[1]}/><stop offset="100%" stopColor={colors[2]}/></linearGradient>
                <linearGradient id={`${chartId}-shade-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors[1]} stopOpacity=".24"/><stop offset="50%" stopColor={colors[0]} stopOpacity=".10"/><stop offset="100%" stopColor={colors[2]} stopOpacity="0"/></linearGradient>
              </React.Fragment>;
            })}
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
            const y = baseY - step * chartHeight;
            return <g key={step}>
              <line x1={LEFT} x2={SVG_WIDTH - RIGHT} y1={y} y2={y} stroke="#94a3b8" strokeOpacity=".23" strokeDasharray={i === 0 ? undefined : '4 7'} />
              <text x={LEFT - 9} y={y + 4} fontSize="10" textAnchor="end" fill="#64748b">{Math.round(maxY * step)}</text>
            </g>;
          })}
          {visibleTicks.map(i => <text key={i} x={coords(Array(count).fill(0))[i].x} y={SVG_HEIGHT - 11} textAnchor={i === 0 ? 'start' : i === count - 1 ? 'end' : 'middle'} fontSize="10" fontWeight="600" fill="#64748b">{labels[i]}</text>)}
          {active.map((s, i) => {
            if (noData) return null;
            const points = coords(s.values);
            const line = monotoneCurve(points);
            const area = `${line} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;
            return <g key={`${chartId}-series-${i}`}>
              <path d={area} fill={`url(#${chartId}-shade-${i})`} />
              <path d={line} fill="none" stroke={`url(#${chartId}-line-${i})`} strokeWidth="9" opacity=".12" strokeLinecap="round" />
              <path d={line} fill="none" stroke={`url(#${chartId}-line-${i})`} strokeWidth="3.8" strokeLinecap="round" />
              {(count <= 10 ? points : [points[0], points[points.length - 1]]).map((p, j) => {
                const idx = count <= 10 ? j : j === 0 ? 0 : count - 1;
                return <circle key={idx} cx={p.x} cy={p.y} r="4.5" fill={(s.colors || WAVE_PALETTES[i % WAVE_PALETTES.length])[0]} stroke="white" strokeWidth="2.5"><title>{`${labels[idx]}: ${s.name} ${s.values[idx]}`}</title></circle>;
              })}
            </g>;
          })}
          {noData && <text x={SVG_WIDTH / 2} y={baseY - chartHeight / 2} textAnchor="middle" fontSize="14" fontWeight="600" fill="#64748b">{emptyText}</text>}
        </svg>
      </div>
    </section>
  );
}

/** Last N UTC calendar days. Time-series bars reflect recorded events, never synthetic activity. */
export function chartDays(count = 14, now = new Date()): { keys: string[]; labels: string[] } {
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const keys = Array.from({ length: count }, (_, i) => {
    const day = new Date(midnight);
    day.setUTCDate(midnight.getUTCDate() - count + 1 + i);
    return day.toISOString().slice(0, 10);
  });
  return { keys, labels: keys.map(s => new Date(`${s}T00:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' })) };
}

export function dailySeries<T>(rows: T[], keys: string[], getDate: (row: T) => unknown, predicate: (row: T) => boolean = () => true): number[] {
  const buckets = new Map(keys.map(k => [k, 0]));
  rows.forEach(row => {
    if (!predicate(row)) return;
    const raw = getDate(row);
    if (!raw) return;
    const date = new Date(raw as string | number | Date);
    if (Number.isNaN(date.getTime())) return;
    const key = date.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) || 0) + 1);
  });
  return keys.map(key => buckets.get(key) || 0);
}
