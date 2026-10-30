import 'server-only';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DEFAULT_CURRENCY, normalizeCurrency, type CurrencySettings } from './currencySettings';

export async function getCurrencyConfiguration(): Promise<CurrencySettings> {
  try {
    const rows = await db.select({ value: siteSettings.value }).from(siteSettings)
      .where(eq(siteSettings.key, 'currency_settings')).limit(1);
    return rows[0]?.value ? normalizeCurrency(JSON.parse(rows[0].value)) : DEFAULT_CURRENCY;
  } catch (error) {
    console.error('[currency] Settings lookup failed:', error);
    return DEFAULT_CURRENCY;
  }
}
