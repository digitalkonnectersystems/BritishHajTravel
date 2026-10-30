'use server';
import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/requireAdmin';
const KEY = 'sold_out_badge_image';

export async function getGlobalSoldOutBadgeAction(): Promise<string> {
  try {
    const rows = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, KEY)).limit(1);
    return String(rows[0]?.value || '').trim();
  } catch (error) {
    console.error('Unable to read global Sold Out badge', error);
    return '';
  }
}
export async function saveGlobalSoldOutBadgeAction(value: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin(['admin', 'content_editor']);
  const url = String(value || '').trim();
  if (url && !/^\/(?!\/)[^\s<>]*$/.test(url) && !/^https:\/\/[^\s<>]+$/i.test(url)) {
    return { success: false, error: 'Choose an uploaded image URL or a valid HTTPS media URL.' };
  }
  try {
    await db.insert(siteSettings).values({ key: KEY, value: url })
      .onDuplicateKeyUpdate({ set: { value: url, updatedAt: new Date() } });
    revalidatePath('/', 'layout');
    revalidatePath('/admin/packages');
    revalidatePath('/hajj-packages');
    revalidatePath('/umrah-packages');
    revalidatePath('/destinations');
    return { success: true };
  } catch (error) {
    console.error('Unable to save global Sold Out badge', error);
    return { success: false, error: 'Could not save shared badge.' };
  }
}
