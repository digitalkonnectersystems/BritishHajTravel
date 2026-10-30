export type CurrencySettings = { code: string; symbol: string; locale: string };
export const DEFAULT_CURRENCY: CurrencySettings = { code: 'GBP', symbol: '£', locale: 'en-GB' };
const CURRENCIES: Record<string, CurrencySettings> = {
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'en-IE' },
  CAD: { code: 'CAD', symbol: 'CAD', locale: 'en-CA' },
  SAR: { code: 'SAR', symbol: 'SAR', locale: 'en-GB' },
  PKR: { code: 'PKR', symbol: 'PKR', locale: 'en-PK' },
};
export const CURRENCY_OPTIONS = Object.values(CURRENCIES);
export function normalizeCurrency(input: unknown): CurrencySettings {
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const selected = CURRENCIES[String(record.code || 'GBP').toUpperCase()] || DEFAULT_CURRENCY;
  const manual = String(record.symbol || '').trim();
  return { ...selected, symbol: manual && manual.length <= 8 && !/[<>]/.test(manual) ? manual : selected.symbol };
}
export function formatConfiguredPrice(value: unknown, currency: CurrencySettings = DEFAULT_CURRENCY): string {
  const stringValue = String(value ?? '').trim();
  if (!stringValue) return '';
  if (/^(tbc|on request|price on request)$/i.test(stringValue)) return stringValue.toUpperCase() === 'TBC' ? 'TBC' : stringValue;
  const numberValue = Number(stringValue.replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(numberValue)) return stringValue;
  return `${currency.symbol} ${numberValue.toLocaleString(currency.locale, { maximumFractionDigits: 2 })}`;
}
