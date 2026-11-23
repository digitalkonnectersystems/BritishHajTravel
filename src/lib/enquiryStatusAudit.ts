import 'server-only';
import { headers } from 'next/headers';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';
import type { UserSession } from '@/lib/auth';

/** Internal helper, deliberately NOT a remotely callable Server Action. */
export async function writeEnquiryStatusAudit(input: {
  actor: UserSession;
  enquiryNumber: string;
  fullName: string;
  previousStatus: string;
  newStatus: string;
}): Promise<void> {
  let ipAddress: string | null = null;
  try {
    const h = await headers();
    ipAddress = (h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') || h.get('cf-connecting-ip') || '').slice(0, 64) || null;
  } catch { /* No request metadata available */ }

  await db.insert(activityLogs).values({
    name: 'Updated Enquiry Status',
    status: 'UPDATE',
    userId: input.actor.userId,
    ipAddress,
    previousEntry: JSON.stringify({ status: input.previousStatus }),
    newEntry: JSON.stringify({
      type: 'enquiries',
      user: input.actor.name,
      userEmail: input.actor.email,
      details: `Enquiry ${input.enquiryNumber} (${input.fullName}) status changed to "${input.newStatus}"`,
      entry: { status: input.newStatus },
    }),
  });
}
