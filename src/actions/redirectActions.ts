'use server';
import { db } from '@/db';
import { redirectRules, notFoundHits } from '@/db/schema';
import { requireAdmin } from '@/lib/requireAdmin';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAdminActivityAction } from '@/actions/activityActions';

const validLocalPath = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') && !path.includes('\\') &&
  !/[\x00-\x1f]/.test(path) && !path.includes('?') && !path.includes('#') && path.length <= 500 &&
  !/\/(?:admin|api|_next|letstravel)(?:\/|$)/i.test(path);

export async function listRedirectsAction() {
  await requireAdmin(['admin', 'content_editor']);
  const [rules, hits] = await Promise.all([
    db.select().from(redirectRules).where(isNull(redirectRules.deletedAt)).orderBy(desc(redirectRules.createdAt)),
    db.select().from(notFoundHits).where(isNull(notFoundHits.deletedAt)).orderBy(desc(notFoundHits.lastSeen)).limit(200),
  ]);
  return { rules, hits };
}
export async function saveRedirectAction(raw: {id?:number; sourcePath:string; destinationPath:string; httpCode:number}) {
  await requireAdmin(['admin', 'content_editor']);
  const sourcePath = raw.sourcePath.trim().replace(/\/+$/, '') || '/';
  const destinationPath = raw.destinationPath.trim().replace(/\/+$/, '') || '/';
  if (!validLocalPath(sourcePath) || !validLocalPath(destinationPath) || sourcePath===destinationPath || ![307,308].includes(raw.httpCode))
    return { success:false, error:'Enter two distinct internal paths and a valid HTTP redirect code.' };
  try {
    // A redirect must not target another active redirect or create a chain.
    const targetRule = await db.select({sourcePath:redirectRules.sourcePath}).from(redirectRules)
      .where(and(eq(redirectRules.sourcePath,destinationPath),eq(redirectRules.status,'active'),isNull(redirectRules.deletedAt))).limit(1);
    if (targetRule.length) return {success:false,error:'Destination already redirects. Choose its final URL.'};
    if (raw.id) {
      await db.update(redirectRules).set({sourcePath,destinationPath,httpCode:raw.httpCode,updatedAt:new Date()}).where(and(eq(redirectRules.id,raw.id),isNull(redirectRules.deletedAt)));
    } else await db.insert(redirectRules).values({sourcePath,destinationPath,httpCode:raw.httpCode});
    await logAdminActivityAction({type:'settings',action:raw.id ? 'Updated Redirect Rule' : 'Created Redirect Rule',details:`${sourcePath} -> ${destinationPath}`});
    revalidatePath('/admin/redirects');
    return {success:true};
  } catch (err) {
    console.error('Redirect save failed',err);
    return {success:false,error:'Could not save redirect. Source path may already exist.'};
  }
}
export async function disableRedirectAction(id:number) {
  await requireAdmin(['admin','content_editor']);
  if (!Number.isInteger(id) || id<1) throw new Error('Invalid ID');
  await db.update(redirectRules).set({status:'disabled',updatedAt:new Date()}).where(eq(redirectRules.id,id));
  await logAdminActivityAction({type:'settings',action:'Disabled Redirect Rule',details:`Redirect rule #${id} disabled`});
  revalidatePath('/admin/redirects');
  return {success:true};
}
export async function enableRedirectAction(id:number) {
  await requireAdmin(['admin','content_editor']);
  if (!Number.isInteger(id) || id<1) return {success:false,error:'Invalid redirect ID.'};
  try {
    const [rule] = await db.select().from(redirectRules).where(and(eq(redirectRules.id,id),isNull(redirectRules.deletedAt))).limit(1);
    if (!rule) return {success:false,error:'Redirect rule was not found.'};
    const target = await db.select().from(redirectRules).where(and(eq(redirectRules.sourcePath,rule.destinationPath),eq(redirectRules.status,'active'),isNull(redirectRules.deletedAt))).limit(1);
    if (target.length) return {success:false,error:'Cannot enable: the destination is an active redirect.'};
    await db.update(redirectRules).set({status:'active',updatedAt:new Date()}).where(eq(redirectRules.id,id));
    await logAdminActivityAction({type:'settings',action:'Enabled Redirect Rule',details:`Redirect rule #${id} enabled`});
    revalidatePath('/admin/redirects');
    return {success:true};
  } catch { return {success:false,error:'Could not enable this redirect.'}; }
}
export async function deleteRedirectAction(id:number) {
  await requireAdmin(['admin','content_editor']);
  if (!Number.isInteger(id) || id<1) return {success:false,error:'Invalid redirect ID.'};
  try {
    await db.update(redirectRules).set({status:'disabled',deletedAt:new Date(),updatedAt:new Date()}).where(and(eq(redirectRules.id,id),isNull(redirectRules.deletedAt)));
    await logAdminActivityAction({type:'settings',action:'Deleted Redirect Rule',details:`Redirect rule #${id} archived`});
    revalidatePath('/admin/redirects');
    return {success:true};
  } catch { return {success:false,error:'Could not delete this redirect.'}; }
}
export async function updateNotFoundHitStatusAction(id:number,status:'unresolved'|'resolved') {
  await requireAdmin(['admin','content_editor']);
  if (!Number.isInteger(id) || id<1 || !['unresolved','resolved'].includes(status)) return {success:false,error:'Invalid 404 log or status.'};
  try {
    await db.update(notFoundHits).set({status,updatedAt:new Date()}).where(and(eq(notFoundHits.id,id),isNull(notFoundHits.deletedAt)));
    revalidatePath('/admin/redirects');
    return {success:true};
  } catch { return {success:false,error:'Could not update the 404 status.'}; }
}
export async function deleteNotFoundHitAction(id:number) {
  await requireAdmin(['admin','content_editor']);
  if (!Number.isInteger(id) || id<1) return {success:false,error:'Invalid 404 log ID.'};
  try {
    await db.update(notFoundHits).set({deletedAt:new Date(),updatedAt:new Date()}).where(and(eq(notFoundHits.id,id),isNull(notFoundHits.deletedAt)));
    revalidatePath('/admin/redirects');
    return {success:true};
  } catch { return {success:false,error:'Could not remove the 404 entry.'}; }
}
export async function lookupRedirect(path:string) {
  if (!validLocalPath(path)) return null;
  const result=await db.select().from(redirectRules)
    .where(and(eq(redirectRules.sourcePath,path),eq(redirectRules.status,'active'),isNull(redirectRules.deletedAt))).limit(1);
  return result[0] || null;
}
export async function recordNotFound(path:string) {
  if (!validLocalPath(path)) return;
  try {
    await db.insert(notFoundHits).values({requestPath:path}).onDuplicateKeyUpdate({set:{hits:sql`${notFoundHits.hits} + 1`,lastSeen:new Date(),updatedAt:new Date()}});
  } catch (error) { console.error('Unable to record 404 hit:',error); }
}
