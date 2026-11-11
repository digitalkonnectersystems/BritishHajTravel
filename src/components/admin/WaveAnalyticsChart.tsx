'use client';

import React, { useState } from 'react';

export type WaveSeries = {
  name: string;
  values: number[];
  colors?: [string, string, string];
};

export const WAVE_PALETTES: [string, string, string][] = [
  ['#2563eb', '#3b82f6', '#93c5fd'], // Royal Blue (matches primary theme)
  ['#0d9488', '#14b8a6', '#5eead4'], // Emerald / Teal
  ['#f59e0b', '#fbbf24', '#fde68a'], // Amber / Warm Gold
  ['#8b5cf6', '#a78bfa', '#ddd6fe'], // Violet / Purple
  ['#e11d48', '#f43f5e', '#fda4af'], // Crimson / Rose
];

const SVG_WIDTH = 800;
const SVG_HEIGHT = 240;
const LEFT = 42;
const RIGHT = 20;
const TOP = 22;
const BOTTOM = 42;

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
    d += ` C ${(p.x + dx / 3).toFixed(2)} ${(p.y + (dx * tangents[i]) / 3).toFixed(2)} ${(q.x - dx / 3).toFixed(2)} ${(q.y - (dx * tangents[i + 1]) / 3).toFixed(2)} ${q.x.toFixed(2)} ${q.y.toFixed(2)}`;
  }
  return d;
}

export function WaveAnalyticsChart({
  title,
  description,
  labels,
  series,
  mode = 'timeline',
  emptyText = 'No records for this period',
  compact = false,
}: {
  title?: string;
  description?: string;
  labels: string[];
  series: WaveSeries[];
  mode?: 'timeline' | 'categories';
  emptyText?: string;
  compact?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const count = labels.length;
  const active = series.filter(s => s.values.length === count && count > 0);
  const totalVolume = active.reduce(
    (sum, s) => sum + s.values.reduce((vSum, v) => vSum + (Number.isFinite(v) ? Math.max(0, v) : 0), 0),
    0
  );
  const maxValue = Math.max(0, ...active.flatMap(s => s.values.map(v => (Number.isFinite(v) ? Math.max(0, v) : 0))));
  const maxY = Math.max(1, Math.ceil(maxValue * 1.15));
  const baseY = SVG_HEIGHT - BOTTOM;
  const chartWidth = SVG_WIDTH - LEFT - RIGHT;
  const chartHeight = baseY - TOP;

  const coords = (values: number[]) =>
    values.map((value, index) => ({
      x: LEFT + (count === 1 ? chartWidth / 2 : (chartWidth * index) / (count - 1)),
      y: baseY - (Math.min(maxY, Math.max(0, Number.isFinite(value) ? value : 0)) * chartHeight) / maxY,
    }));

  // Date-to-date x-axis ticks: show all dates sequentially
  const tickIndices = count <= 16
    ? Array.from({ length: count }, (_, i) => i)
    : Array.from(new Set([...Array.from({length: 9}, (_, i) => Math.round(i * (count - 1) / 8)), count - 1]));

  const noData = maxValue === 0;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (noData || count <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const clampedX = Math.max(LEFT, Math.min(SVG_WIDTH - RIGHT, svgX));
    const rawIndex = Math.round(((clampedX - LEFT) / chartWidth) * (count - 1));
    const index = Math.max(0, Math.min(count - 1, rawIndex));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <section
      className={`overflow-hidden rounded-[26px] border border-slate-200/90 bg-white shadow-[0_12px_36px_-24px_rgba(2,14,67,0.12)] transition-shadow hover:shadow-[0_16px_44px_-24px_rgba(2,14,67,0.18)] ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      {(title || description || !compact) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="m-0 text-base font-extrabold tracking-tight text-[#020e43]">{title}</h3>}
            {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {totalVolume > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Total: <strong className="text-[#020e43] tabular-nums">{totalVolume.toLocaleString()}</strong>
              </span>
            )}
            <span className="rounded-full border border-[#020e43]/15 bg-[#020e43]/5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#020e43]">
              {mode === 'timeline' ? `${count} Days Activity` : 'Category Snapshot'}
            </span>
          </div>
        </div>
      )}

      <div className="relative rounded-[22px] border border-slate-100/90 bg-slate-50 p-3 sm:p-5">
        {/* Series Legend & Date Range */}
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2" aria-label="Chart series">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {active.map((s, i) => {
              const color = (s.colors || WAVE_PALETTES[i % WAVE_PALETTES.length])[0];
              const sTotal = s.values.reduce((sum, v) => sum + (Number.isFinite(v) ? Math.max(0, v) : 0), 0);
              return (
                <div
                  key={`${s.name}-${i}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs border border-slate-200/60"
                >
                  <span className="h-2 w-2 rounded-full shadow-xs" style={{ backgroundColor: color }} />
                  <span>{s.name}</span>
                  <span className="text-[10px] font-semibold text-slate-400 tabular-nums">({sTotal})</span>
                </div>
              );
            })}
          </div>
          {mode === 'timeline' && count > 1 && (
            <span className="text-[11px] font-medium text-slate-400">
              {labels[0]} – {labels[count - 1]}
            </span>
          )}
        </div>

        {/* Hover Tooltip Card */}
        {hoverIndex !== null && !noData && (
          <div
            className="pointer-events-none absolute z-20 hidden sm:flex flex-col gap-1.5 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md transition-all duration-75"
            style={{
              left: `${Math.min(84, Math.max(16, (coords(Array(count).fill(0))[hoverIndex].x / SVG_WIDTH) * 100))}%`,
              top: '12px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1 font-bold text-slate-800">
              <span>{labels[hoverIndex]}</span>
              <span className="text-[10px] font-semibold text-slate-400">
                Day {hoverIndex + 1} of {count}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {active.map((s, i) => {
                const color = (s.colors || WAVE_PALETTES[i % WAVE_PALETTES.length])[0];
                return (
                  <div key={s.name} className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      {s.name}
                    </span>
                    <span className="font-extrabold text-slate-900 tabular-nums">
                      {s.values[hoverIndex] ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Chart SVG */}
        <svg
          className="mt-3 block w-full cursor-crosshair"
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          role="img"
          aria-label={`${title || 'Analytics'}: ${active.map(s => `${s.name}: ${s.values.join(', ')}`).join('; ')}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {active.map((s, i) => {
              const color = (s.colors || WAVE_PALETTES[i % WAVE_PALETTES.length])[0];
              return <filter key={i} id={`line-glow-${i}`} x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor={color} floodOpacity="0.13" />
              </filter>;
            })}
          </defs>

          {/* Horizontal Reference Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((step, i) => {
            const y = baseY - step * chartHeight;
            return (
              <g key={step}>
                <line
                  x1={LEFT}
                  x2={SVG_WIDTH - RIGHT}
                  y1={y}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeOpacity={i === 0 ? '0.6' : '0.35'}
                  strokeDasharray={i === 0 ? undefined : '4 6'}
                  strokeWidth="1"
                />
                <text
                  x={LEFT - 10}
                  y={y + 3.5}
                  fontSize="9.5"
                  fontWeight="600"
                  textAnchor="end"
                  fill="#94a3b8"
                  className="font-mono select-none"
                >
                  {Math.round(maxY * step)}
                </text>
              </g>
            );
          })}

          {/* Interactive Hover Guide Line */}
          {hoverIndex !== null && !noData && (
            <line
              x1={coords(Array(count).fill(0))[hoverIndex].x}
              x2={coords(Array(count).fill(0))[hoverIndex].x}
              y1={TOP}
              y2={baseY}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeOpacity="0.8"
            />
          )}

          {/* X-Axis Date-To-Date Labels & Notches */}
          {tickIndices.map(i => {
            const x = coords(Array(count).fill(0))[i].x;
            const isFirst = i === 0;
            const isLast = i === count - 1;
            const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
            const isHovered = hoverIndex === i;

            return (
              <g key={i} className="transition-opacity">
                <line
                  x1={x}
                  x2={x}
                  y1={baseY}
                  y2={baseY + 4}
                  stroke={isHovered ? '#020e43' : '#cbd5e1'}
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={baseY + 18}
                  textAnchor={anchor}
                  fontSize="9.5"
                  fontWeight={isHovered ? '700' : '600'}
                  fill={isHovered ? '#020e43' : '#64748b'}
                  className="select-none font-medium tracking-tight"
                >
                  {labels[i]}
                </text>
              </g>
            );
          })}

          {/* Solid-color line series and subtle single-color areas */}
          {active.map((s, i) => {
            if (noData) return null;
            const points = coords(s.values);
            const color = (s.colors || WAVE_PALETTES[i % WAVE_PALETTES.length])[0];
            const line = monotoneCurve(points);
            const area = `${line} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;

            return (
              <g key={`${s.name}-${i}`}>
                {/* No gradient stops: uniform fill for each section. */}
                <path d={area} fill={color} fillOpacity="0.045" />

                {/* Main line with stroke-width 2 */}
                <path
                  d={line}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#line-glow-${i})`}
                />

                {/* Point dots: crisp white inner with 2px stroke, glowing on hover */}
                {points.map((p, j) => {
                  const isHovered = hoverIndex === j;
                  const showPoint = isHovered || count <= 16 || j === 0 || j === count - 1;
                  if (!showPoint) return null;

                  return (
                    <g key={j}>
                      {isHovered && (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="8"
                          fill={color}
                          fillOpacity="0.25"
                          className="animate-pulse"
                        />
                      )}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 4.5 : 3.5}
                        fill="#ffffff"
                        stroke={color}
                        strokeWidth="2"
                        className="transition-all duration-150"
                      >
                        <title>{`${labels[j]}: ${s.name} ${s.values[j]}`}</title>
                      </circle>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Empty State */}
          {noData && (
            <text
              x={SVG_WIDTH / 2}
              y={baseY - chartHeight / 2}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="#94a3b8"
            >
              {emptyText}
            </text>
          )}
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
  return {
    keys,
    labels: keys.map(s =>
      new Date(`${s}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        timeZone: 'UTC',
      })
    ),
  };
}

export function dailySeries<T>(
  rows: T[],
  keys: string[],
  getDate: (row: T) => unknown,
  predicate: (row: T) => boolean = () => true
): number[] {
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
