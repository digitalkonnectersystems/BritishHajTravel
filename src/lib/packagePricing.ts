/** Shared package pricing rules for the admin, API actions and public pages.
 * A numeric price of zero is valid. TBC is a separate status, not a price.
 */
import { isTbcPrice } from './priceDisplay';

export type PackagePriceStatus = 'numeric' | 'tbc';

export interface StoredPackagePrice {
  packageType: string;
  price: string;
  priceStatus: PackagePriceStatus;
}

export interface PackagePriceOption {
  packageType: string;
  price: number;
  priceStatus: PackagePriceStatus;
}

export function validatePackagePriceRows(input: unknown): { rows: StoredPackagePrice[]; error?: string } {
  if (!Array.isArray(input)) return { rows: [], error: 'Please add at least one Package Type & Price.' };

  const rows: StoredPackagePrice[] = [];
  for (const item of input) {
    const packageType = String(item?.packageType ?? item?.type ?? '').trim();
    const rawPrice = String(item?.price ?? item?.amount ?? '').trim();
    const priceStatus: PackagePriceStatus = isTbcPrice(rawPrice, item?.priceStatus) ? 'tbc' : 'numeric';

    // Ignore a genuinely unused row, but never ignore a TBC selection.
    if (!packageType && !rawPrice && priceStatus === 'numeric') continue;
    if (!packageType) return { rows: [], error: 'Package Type cannot be empty.' };

    if (priceStatus === 'tbc') {
      rows.push({ packageType, price: '0', priceStatus });
      continue;
    }

    // Do not use truthiness here: 0 and 0.00 are legitimate numeric prices.
    if (!/^\d+(?:\.\d{1,2})?$/.test(rawPrice) || !Number.isFinite(Number(rawPrice))) {
      return { rows: [], error: `Please enter a valid price of 0 or more for "${packageType}".` };
    }
    rows.push({ packageType, price: Number(rawPrice).toFixed(2), priceStatus });
  }

  if (!rows.length) return { rows: [], error: 'Please add at least one Package Type & Price.' };
  return { rows };
}

export function getStartingPriceFromRows(rows: StoredPackagePrice[]): string {
  const numeric = rows
    .filter((row) => row.priceStatus !== 'tbc')
    .map((row) => Number(row.price))
    .filter((value) => Number.isFinite(value) && value >= 0);
  return numeric.length ? Math.min(...numeric).toFixed(2) : '0.00';
}

function parseObject(value: any): any {
  if (value && typeof value === 'object') return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { /* legacy plain text */ }
  }
  return {};
}

/** Read the saved per-occupancy rows, falling back to legacy package records. */
export function getPackagePriceOptions(pkg: any): PackagePriceOption[] {
  if (!pkg) return [];
  const card = parseObject(pkg.cardData);
  const detail = parseObject(pkg.detailPageData);
  const arrays = [card?.packagePrices, detail?.packagePrices, pkg.packagePrices];
  let raw: any[] | undefined = arrays.find((arr) => Array.isArray(arr) && arr.length > 0);

  if (!raw && Array.isArray(pkg.prices) && pkg.prices.length) {
    raw = pkg.prices.map((item: any) => ({
      packageType: item.occupancyType === 'quad' ? 'Quad Occupancy'
        : item.occupancyType === 'triple' ? 'Triple Occupancy'
          : item.occupancyType === 'double' ? 'Double Occupancy'
            : item.occupancyType === 'single' ? 'Single Occupancy' : item.notes || 'Package Type',
      price: item.amount,
      priceStatus: item.priceStatus,
    }));
  }

  if (raw) {
    return raw.map((item: any) => {
      const rawValue = typeof item === 'object' && item !== null
        ? item.price ?? item.amount ?? '' : item;
      const status: PackagePriceStatus = isTbcPrice(rawValue, item?.priceStatus) ? 'tbc' : 'numeric';
      const stringValue = String(rawValue ?? '').trim().replace(/,/g, '').replace(/^[£$]\s*/, '');
      const parsed = Number(stringValue);
      return {
        packageType: String(item?.packageType ?? item?.type ?? '').trim(),
        price: status === 'tbc' ? 0 : parsed,
        priceStatus: status,
        isValid: status === 'tbc' || (stringValue !== '' && Number.isFinite(parsed) && parsed >= 0),
      };
    }).filter((item: any) => item.packageType && item.isValid)
      .map(({ packageType, price, priceStatus }: any) => ({ packageType, price, priceStatus }));
  }

  const legacy = String(pkg.startingPrice ?? pkg.price ?? '').trim();
  const legacyNum = Number(legacy.replace(/,/g, '').replace(/^[£$]\s*/, ''));
  if (isTbcPrice(legacy) || legacy === '0' || legacy === '0.00') {
    // Before explicit priceStatus existed, a package-level zero represented TBC.
    return [{ packageType: 'Quad Occupancy', price: 0, priceStatus: 'tbc' }];
  }
  if (legacy && Number.isFinite(legacyNum) && legacyNum > 0) {
    return [
      { packageType: 'Quad Occupancy', price: legacyNum, priceStatus: 'numeric' },
      { packageType: 'Triple Occupancy', price: legacyNum + 400, priceStatus: 'numeric' },
      { packageType: 'Double Occupancy', price: legacyNum + 800, priceStatus: 'numeric' },
    ];
  }
  return [];
}

export function getLowestPriceOption(options: PackagePriceOption[]): PackagePriceOption | null {
  if (!options.length) return null;
  const numeric = options.filter((item) => item.priceStatus === 'numeric' && Number.isFinite(item.price) && item.price >= 0);
  if (!numeric.length) return options[0];
  return numeric.reduce((min, item) => item.price < min.price ? item : min, numeric[0]);
}

export function formatPackagePriceOption(item: PackagePriceOption | null, currency = '£', locale = 'en-GB', fractionDigits = 0): string {
  if (!item || item.priceStatus === 'tbc') return 'Coming Soon';
  return `${currency}${item.price.toLocaleString(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
}

export function formatStartingPrice(pkg: any, currency = '£', locale = 'en-GB', fractionDigits = 2): string {
  return formatPackagePriceOption(getLowestPriceOption(getPackagePriceOptions(pkg)), currency, locale, fractionDigits);
}
