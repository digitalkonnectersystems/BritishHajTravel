'use server';

import { requireAdmin } from '@/lib/requireAdmin';
import { getPublicSmtpRuntimeStatus } from '@/lib/smtpRuntimeConfig';

import { db } from '@/db';
import { emailDeliveryLogs } from '@/db/schema';
import { desc, isNull } from 'drizzle-orm';

export async function getEmailDeliveryLogsAction() {
  await requireAdmin(['admin']);

  try {
    const logs = await db
      .select()
      .from(emailDeliveryLogs)
      .where(isNull(emailDeliveryLogs.deletedAt))
      .orderBy(desc(emailDeliveryLogs.createdAt))
      .limit(250);

    return { success: true, logs };
  } catch (error: any) {
    console.error('Error fetching email delivery logs:', error);
    return { success: false, error: 'Failed to fetch logs.' };
  }
}

/** Server-only, secret-free SMTP environment inspection for the admin settings UI. */
export async function getMailRuntimeStatusAction() {
  await requireAdmin(['admin']);
  return getPublicSmtpRuntimeStatus();
}
