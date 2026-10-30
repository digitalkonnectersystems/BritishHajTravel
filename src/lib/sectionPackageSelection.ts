import { isPackageCardVisible } from './packageCardVisibility';

/** Section category and curated IDs are persisted in site_pages.sections JSON. */
export function filterSectionPackages<T extends { id?: number; type?: string; categoryId?: number | null; status?: string; cardData?: unknown }>(
  rows: T[], data: { categoryId?: string | number | null; packageIds?: Array<number | string> } | null | undefined, type: 'hajj' | 'umrah',
): T[] {
  const wantedIds = Array.isArray(data?.packageIds) ? data!.packageIds!.map(Number).filter(Number.isInteger) : [];
  const category = String(data?.categoryId ?? '');
  const eligible = (rows || []).filter(p => p.type === type && p.status !== 'draft' && p.status !== 'sold_out' && isPackageCardVisible(p));
  let selected = eligible;
  if (category && category !== 'all') {
    selected = selected.filter(p => category === 'none' ? p.categoryId == null : Number(p.categoryId) === Number(category));
  }
  if (wantedIds.length) {
    const order = new Map(wantedIds.map((id, i) => [id, i]));
    selected = selected.filter(p => order.has(Number(p.id))).sort((a, b) => (order.get(Number(a.id)) ?? 0) - (order.get(Number(b.id)) ?? 0));
  }
  return selected;
}
