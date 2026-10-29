'use server';
import { db } from '@/db';
import { backendLogs } from '@/db/schema';
import { requireAdmin } from '@/lib/requireAdmin';
import { writeBackendLog } from '@/lib/backendLogger';
import { desc, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function listBackendLogsAction(limit=250) {
 await requireAdmin(['admin']);
 return db.select().from(backendLogs).where(isNull(backendLogs.deletedAt)).orderBy(desc(backendLogs.createdAt)).limit(Math.min(500,Math.max(1,Math.trunc(Number(limit)||250))));
}
export async function testBackendLoggerAction() {
 await requireAdmin(['admin']);
 const success=await writeBackendLog({severity:'info',category:'Logger',message:'Manual diagnostic test completed.',source:'admin/backend-logs'});
 if(success) revalidatePath('/admin/backend-logs');
 return success ? {success:true} : {success:false,error:'Backend log could not be persisted. Check database connectivity.'};
}
