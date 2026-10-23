'use server';
import { db } from '@/db';
import { backendLogs } from '@/db/schema';
import { requireAdmin } from '@/lib/requireAdmin';
import { desc, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/** DB event log, not a substitute for Hostinger runtime stdout or build logs. */
export async function writeBackendLog(input: {severity:'info'|'warning'|'error';category:string;message:string;source?:string}) {
  // Never pass credentials, request bodies, phone numbers, or personal user details here.
  try {
    await db.insert(backendLogs).values({severity:input.severity,category:input.category.slice(0,70),message:input.message.slice(0,2000),source:input.source?.slice(0,191)});
  } catch (error) { console.error('Failed to store backend diagnostic:',error); }
}
export async function listBackendLogsAction() {
  await requireAdmin(['admin']);
  return db.select().from(backendLogs).where(isNull(backendLogs.deletedAt)).orderBy(desc(backendLogs.createdAt)).limit(250);
}
export async function testBackendLoggerAction() {
  await requireAdmin(['admin']);
  await writeBackendLog({severity:'info',category:'Logger',message:'Manual diagnostic test completed.',source:'admin/backend-logs'});
  revalidatePath('/admin/backend-logs');
  return {success:true};
}
