'use server';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/requireAdmin';
import { getCurrencyConfiguration } from '@/lib/currencyService';
import { normalizeCurrency } from '@/lib/currencySettings';

export async function getCurrencySettingsAction() {
  await requireAdmin(['admin']);
  return getCurrencyConfiguration();
}
export async function saveCurrencySettingsAction(input: unknown) {
  await requireAdmin(['admin']);
  const settings = normalizeCurrency(input);
  await db.insert(siteSettings).values({ key: 'currency_settings', value: JSON.stringify(settings) })
    .onDuplicateKeyUpdate({ set: { value: JSON.stringify(settings), updatedAt: new Date() } });
  revalidatePath('/', 'layout');
  return { success: true, settings };
}
