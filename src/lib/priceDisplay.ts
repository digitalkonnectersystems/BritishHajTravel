export type PriceStatus = 'numeric' | 'tbc';

export function isTbcPrice(value: unknown, status?: unknown) {
  return ['tbc', 'coming soon'].includes(String(status ?? '').trim().toLowerCase()) ||
    ['tbc', 'coming soon'].includes(String(value ?? '').trim().toLowerCase());
}

export function displayPrice(value: unknown, status?: unknown, currency = '£') {
  return isTbcPrice(value, status) ? 'Coming Soon' : `${currency} ${String(value ?? '').trim()}`;
}
