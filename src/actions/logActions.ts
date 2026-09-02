'use server';

import { db } from '@/db';
import { emailDeliveryLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function getEmailDeliveryLogsAction() {
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
