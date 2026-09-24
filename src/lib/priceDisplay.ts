export type PriceStatus = 'numeric' | 'tbc';

export function isTbcPrice(value: unknown, status?: unknown) {
  return status === 'tbc' || String(value ?? '').trim().toLowerCase() === 'tbc';
}

export function displayPrice(value: unknown, status?: unknown, currency = '£') {
  return isTbcPrice(value, status) ? 'TBC' : `${currency} ${String(value ?? '').trim()}`;
}
