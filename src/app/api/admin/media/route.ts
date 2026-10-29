import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaFiles } from '@/db/schema';
import { asc, count, desc, eq, like, or, and, gt, gte } from 'drizzle-orm';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getCurrentSession } from '@/lib/auth';
import { logAdminActivityAction } from '@/actions/activityActions';
import { getMediaDirectories, getMediaRoot, hashBuffer, imageType, MAX_OPTIMIZED_BYTES, safeMediaPath, validMediaPath, walkMediaFiles } from '@/lib/mediaStorage';
import sharp from 'sharp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const CAN_MANAGE = ['super_admin','admin','content_editor'];
function mimeOf(relative: string) {
  const ext = path.extname(relative).toLowerCase();
  return ({'.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.avif':'image/avif','.ico':'image/x-icon','.pdf':'application/pdf','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime'} as Record<string,string>)[ext] || 'application/octet-stream';
}
function jsonError(error: unknown, status=500) {
  const message = error instanceof Error ? error.message : 'Media operation failed';
  console.error('Media Library:', error);
  return NextResponse.json({success:false,error:message},{status});
}
export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || !CAN_MANAGE.includes(session.role)) return NextResponse.json({success:false,error:'Forbidden'}, {status:403});
  try {
    const url = new URL(req.url);
    const page = Math.max(1, Math.floor(Number(url.searchParams.get('page')) || 1));
    const limit = Math.min(100,Math.max(1,Number(url.searchParams.get('limit')) || 40));
    const search = (url.searchParams.get('search') || '').slice(0,120);
    const type = url.searchParams.get('type') || 'all';
    const status = url.searchParams.get('status') === 'trash' ? 'trash' : 'active';
    const sort = url.searchParams.get('sort') === 'oldest' ? asc(mediaFiles.id) : desc(mediaFiles.id);
    const predicates = [eq(mediaFiles.status,status)];
    if (search) predicates.push(or(like(mediaFiles.name,`%${search.replace(/[%_]/g,'\\$&')}%`), like(mediaFiles.relativePath,`%${search.replace(/[%_]/g,'\\$&')}%`))!);
    if (type === 'images') predicates.push(like(mediaFiles.mimeType,'image/%'));
    if (type === 'documents') predicates.push(eq(mediaFiles.mimeType,'application/pdf'));
    if (type === 'videos') predicates.push(like(mediaFiles.mimeType,'video/%'));
    const where = and(...predicates);
    const [rows, totals, activeCounts, trashCounts] = await Promise.all([
      db.select().from(mediaFiles).where(where).orderBy(sort).limit(limit).offset((page-1)*limit),
      db.select({value:count()}).from(mediaFiles).where(where),
      db.select({value:count()}).from(mediaFiles).where(eq(mediaFiles.status,'active')),
      db.select({value:count()}).from(mediaFiles).where(eq(mediaFiles.status,'trash')),
    ]);
    return NextResponse.json({success:true,items:rows.map(({contentHash,...row}) => ({...row,url:`/images_BHT/${row.relativePath}`})),total:totals[0]?.value||0,active:activeCounts[0]?.value||0,trash:trashCounts[0]?.value||0,page,limit});
  } catch(error) { return jsonError(error); }
}

async function optimizeOriginal(buffer: Buffer, extension: string) {
  // The filename and extension MUST stay unchanged for existing references.
  const source = sharp(buffer,{failOn:'error',limitInputPixels:100_000_000});
  const meta = await source.metadata();
  if (!meta.width || !meta.height) throw new Error('Invalid image');
  let width = Math.min(meta.width,1920), height = Math.min(meta.height,1920);
  let best = buffer;
  for (let attempt=0;attempt<24;attempt++) {
    const quality = [80,65,50,38,28,18][attempt%6];
    const resized = sharp(buffer).rotate().resize({width,height,fit:'inside',withoutEnlargement:true});
    let candidate: Buffer;
    if (extension === '.webp') candidate = await resized.webp({quality,effort:4}).toBuffer();
    else if (extension === '.jpg' || extension === '.jpeg') candidate = await resized.jpeg({quality,mozjpeg:true}).toBuffer();
    else if (extension === '.png') candidate = await resized.png({palette:true,quality,effort:8}).toBuffer();
    else candidate = await resized.avif({quality,effort:4}).toBuffer();
    if (candidate.length < best.length) best = candidate;
    if (candidate.length <= MAX_OPTIMIZED_BYTES) return candidate;
    if (attempt%6===5) {width=Math.max(64,Math.floor(width*.75));height=Math.max(64,Math.floor(height*.75));}
  }
  throw new Error('Could not optimize this image below 100 KB without changing its filename or format');
}

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session || !CAN_MANAGE.includes(session.role)) return NextResponse.json({success:false,error:'Forbidden'}, {status:403});
  try {
    const body = await req.json();
    const action = String(body.action || '');
    if (action === 'rescan') {
      const cursor = Math.max(0,Math.floor(Number(body.cursor)||0));
      const entries = [] as {root:string;storage:'local'|'public';relative:string;size:number}[];
      for (const {root,storage} of getMediaDirectories()) {
        for (const file of await walkMediaFiles(root)) entries.push({...file,root,storage:storage as 'local'|'public'});
      }
      const batch = entries.slice(cursor,cursor+40);
      for (const file of batch) {
        const name = path.basename(file.relative);
        const hashed = hashBuffer(await fs.readFile(safeMediaPath(file.root,file.relative)));
        await db.insert(mediaFiles).values({name,relativePath:file.relative,contentHash:hashed,mimeType:mimeOf(file.relative),sizeBytes:file.size,storage:file.storage})
          .onDuplicateKeyUpdate({set:{sizeBytes:file.size,contentHash:hashed,storage:file.storage,updatedAt:new Date()}});
      }
      return NextResponse.json({success:true,indexed:batch.length,hasMore:cursor+batch.length<entries.length,nextCursor:cursor+batch.length,total:entries.length});
    }
    if (action === 'trash' || action === 'restore') {
      const ids: number[] = Array.isArray(body.ids) ? body.ids.filter((v:unknown) => Number.isInteger(v) && Number(v)>0).slice(0,100) : [];
      if (!ids.length) return NextResponse.json({success:false,error:'Choose media files'}, {status:400});
      for (const id of ids) await db.update(mediaFiles).set({status:action==='trash'?'trash':'active',deletedAt:action==='trash'?new Date():null}).where(eq(mediaFiles.id,id));
      await logAdminActivityAction({type:'media',action:action==='trash'?'Moved Media to Trash':'Restored Media',details:`${ids.length} media records`,newEntry:{ids}});
      // Never unlink shared media here: a URL may be used by many pages.
      return NextResponse.json({success:true,updated:ids.length});
    }
    if (action === 'optimize') {
      const id = Number(body.id || 0);
      const cursor = Math.max(0,Math.floor(Number(body.cursor)||0));
      const allRows = id
        ? await db.select().from(mediaFiles).where(eq(mediaFiles.id,id))
        : await db.select().from(mediaFiles).where(and(eq(mediaFiles.status,'active'),gte(mediaFiles.sizeBytes,100*1024),like(mediaFiles.mimeType,'image/%'),gt(mediaFiles.id,cursor))).orderBy(asc(mediaFiles.id)).limit(13);
      const rows = allRows.slice(0,12);
      const stats = {checked:0,optimized:0,skipped:0,failed:0,bytesSaved:0,failures:[] as string[]};
      for (const row of rows) {
        if (row.sizeBytes < 100*1024 || !imageType(path.extname(row.relativePath))) {stats.skipped++;continue;}
        if (!['local','public'].includes(row.storage) || !validMediaPath(row.relativePath)) {stats.skipped++;continue;}
        stats.checked++;
        let tempFile = '';
        try {
          const target = safeMediaPath(row.storage==='public'?path.join(process.cwd(),'public','images_BHT'):getMediaRoot(),row.relativePath);
          const original = await fs.readFile(target);
          if (original.length < 100*1024) {stats.skipped++;continue;}
          const result = await optimizeOriginal(original,path.extname(row.relativePath).toLowerCase());
          tempFile = `${target}.optimizing-${crypto.randomUUID()}`;
          await fs.writeFile(tempFile,result,{flag:'wx'});
          await fs.rename(tempFile,target);
          tempFile='';
          await db.update(mediaFiles).set({sizeBytes:result.length,contentHash:hashBuffer(result)}).where(eq(mediaFiles.id,row.id));
          stats.optimized++;stats.bytesSaved+=original.length-result.length;
        } catch(error) {
          stats.failed++;
          if (stats.failures.length<10) stats.failures.push(`${row.name}: ${error instanceof Error ? error.message : 'Failed'}`);
        } finally { if (tempFile) await fs.unlink(tempFile).catch(()=>{}); }
      }
      if (id && stats.optimized>0) await logAdminActivityAction({type:'media',action:'Optimized Media Asset',details:`Optimized media #${id}`,newEntry:{id,bytesSaved:stats.bytesSaved}});
      return NextResponse.json({success:true,...stats,hasMore:!id&&allRows.length>12,nextCursor:rows.length?rows[rows.length-1].id:cursor});
    }
    return NextResponse.json({success:false,error:'Unknown action'}, {status:400});
  } catch(error) { return jsonError(error); }
}
