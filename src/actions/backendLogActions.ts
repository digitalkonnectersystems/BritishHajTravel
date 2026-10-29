'use server';
import { db } from '@/db';
import { backendLogs } from '@/db/schema';
import { requireAdmin } from '@/lib/requireAdmin';
import { writeBackendLog } from '@/lib/backendLogger';
import { and, desc, eq, isNull } from 'drizzle-orm';
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

export async function updateBackendLogStatusAction(id:number,status:'open'|'acknowledged'|'resolved') {
 await requireAdmin(['admin']);
 if (!Number.isInteger(id) || id <= 0 || !['open','acknowledged','resolved'].includes(status)) return {success:false,error:'Invalid log status or ID.'};
 try {
  await db.update(backendLogs).set({status,updatedAt:new Date()}).where(and(eq(backendLogs.id,id),isNull(backendLogs.deletedAt)));
  revalidatePath('/admin/backend-logs');
  return {success:true};
 } catch {return {success:false,error:'Unable to update diagnostic status.'};}
}
export async function deleteBackendLogAction(id:number) {
 await requireAdmin(['admin']);
 if (!Number.isInteger(id) || id <= 0) return {success:false,error:'Invalid log ID.'};
 try {
  await db.update(backendLogs).set({deletedAt:new Date(),updatedAt:new Date()}).where(and(eq(backendLogs.id,id),isNull(backendLogs.deletedAt)));
  revalidatePath('/admin/backend-logs');
  return {success:true};
 } catch {return {success:false,error:'Unable to archive diagnostic event.'};}
}
