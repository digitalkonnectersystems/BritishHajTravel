'use server';

import { requireAdmin } from '@/lib/requireAdmin';

import { db } from '@/db';
import { emailDeliveryLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function getEmailDeliveryLogsAction() {
  await requireAdmin(['admin']);

  try {
    const logs = await db
      .select()
      .from(emailDeliveryLogs)
      .orderBy(desc(emailDeliveryLogs.createdAt))
      .limit(100);

    return { success: true, logs };
  } catch (error: any) {
    console.error('Error fetching email delivery logs:', error);
    return { success: false, error: 'Failed to fetch logs.' };
  }
}
