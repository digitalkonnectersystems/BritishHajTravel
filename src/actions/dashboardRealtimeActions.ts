'use server';
import { db } from '@/db';
import { enquiries, packages, visaServices, sitePages, blogPosts, activityLogs, notFoundHits, redirectRules } from '@/db/schema';
import { requireAdmin } from '@/lib/requireAdmin';
import { count, eq, gte, sql, desc } from 'drizzle-orm';

const days = 14;
const dayKey = (date:Date) => date.toISOString().slice(0,10);
export async function getDashboardRealtimeAction() {
  await requireAdmin(['admin','enquiry_manager','content_editor','seo_manager']);
  const earliest = new Date(); earliest.setUTCHours(0,0,0,0); earliest.setUTCDate(earliest.getUTCDate()-days+1);
  const results = await Promise.all([
    db.select({value:count()}).from(enquiries),
    db.select({value:count()}).from(enquiries).where(eq(enquiries.status,'new')),
    db.select({value:count()}).from(packages).where(eq(packages.type,'umrah')),
    db.select({value:count()}).from(packages).where(eq(packages.type,'hajj')),
    db.select({value:count()}).from(visaServices),
    db.select({value:count()}).from(sitePages),
    db.select({value:count()}).from(blogPosts).where(eq(blogPosts.isPublished,true)),
    db.select({value:count()}).from(notFoundHits),
    db.select({value:count()}).from(redirectRules).where(eq(redirectRules.status,'active')),
    db.select({day:sql<string>`DATE_FORMAT(${enquiries.createdAt},'%Y-%m-%d')`,total:count()}).from(enquiries).where(gte(enquiries.createdAt,earliest)).groupBy(sql`DATE(${enquiries.createdAt})`),
    db.select({day:sql<string>`DATE_FORMAT(${activityLogs.createdAt},'%Y-%m-%d')`,total:count()}).from(activityLogs).where(gte(activityLogs.createdAt,earliest)).groupBy(sql`DATE(${activityLogs.createdAt})`),
    db.select({ type: enquiries.type, total: count() }).from(enquiries).groupBy(enquiries.type),
  ]);
  const labels=Array.from({length:days},(_,i)=>{const d=new Date(earliest);d.setUTCDate(d.getUTCDate()+i);return dayKey(d)});
  const map=(rows:any[])=>{const r=new Map(rows.map(v=>[v.day,Number(v.total)]));return labels.map(day=>Number(r.get(day)||0));};
  return {refreshedAt:new Date().toISOString(),counts:{enquiries:results[0][0]?.value||0,newEnquiries:results[1][0]?.value||0,umrah:results[2][0]?.value||0,hajj:results[3][0]?.value||0,visas:results[4][0]?.value||0,pages:results[5][0]?.value||0,blogs:results[6][0]?.value||0,brokenPaths:results[7][0]?.value||0,redirects:results[8][0]?.value||0},days:labels,enquiryTrend:map(results[9]),activityTrend:map(results[10]), enquiryTypes:Object.fromEntries((results[11] as {type:string,total:number}[]).map(row=>[row.type,Number(row.total)]))};
}

// Dashboard-only projection: legacy databases can lack optional email-audit columns.
// Never turn query failures into an empty list, which looks like zero actual enquiries.
export async function getDashboardRecentEnquiriesAction() {
  await requireAdmin(['admin','enquiry_manager']);
  return db.select({
    id: enquiries.id,
    enquiryNumber: enquiries.enquiryNumber,
    fullName: enquiries.fullName,
    phone: enquiries.phone,
    type: enquiries.type,
    status: enquiries.status,
    createdAt: enquiries.createdAt,
  }).from(enquiries).orderBy(desc(enquiries.createdAt)).limit(5);
}
