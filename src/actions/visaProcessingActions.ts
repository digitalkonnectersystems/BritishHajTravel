'use server';

import { db } from '@/db';
import { visaProcessing } from '@/db/schema';
import { requireAdmin } from '@/lib/requireAdmin';
import { logAdminActivityAction } from '@/actions/activityActions';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const ROLE = ['admin','content_editor','seo_manager'] as const;
const SLUG_RE = /^\/visa-processing\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getVisaProcessingList() {
  await requireAdmin([...ROLE]);
  return db.select().from(visaProcessing).orderBy(desc(visaProcessing.updatedAt));
}

/** Public-safe projection: only published pages, no draft content or private editor fields. */
export async function getPublishedVisaProcessingCards() {
  try {
    return await db.select({slug: visaProcessing.slug, title: visaProcessing.title})
      .from(visaProcessing).where(eq(visaProcessing.status, 'published'));
  } catch (error) {
    console.error('[visa-processing] Unable to load published homepage cards', error);
    return [];
  }
}

export async function getVisaProcessingById(id: number) {
  await requireAdmin([...ROLE]);
  if (!Number.isSafeInteger(id) || id < 1) return null;
  const page = (await db.select().from(visaProcessing).where(eq(visaProcessing.id,id)).limit(1))[0];
  if (!page) return null;
  let seoData: unknown = null;
  try { seoData = typeof page.seoSettings === 'string' ? JSON.parse(page.seoSettings) : page.seoSettings; } catch { /* Invalid legacy JSON stays editable. */ }
  return {...page, seoData};
}

export async function getPublishedVisaProcessingBySlug(slug: string) {
  if (!SLUG_RE.test(slug)) return null;
  try {
    return (await db.select().from(visaProcessing).where(and(eq(visaProcessing.slug,slug),eq(visaProcessing.status,'published'))).limit(1))[0] || null;
  } catch (error) {
    console.error('[visa-processing] Public page lookup failed', error);
    return null;
  }
}

export async function saveVisaProcessingAction(fd: FormData): Promise<{success:boolean;id?:number;error?:string}> {
  await requireAdmin([...ROLE]);
  const idValue = fd.get('id');
  const id = idValue ? Number(idValue) : null;
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) return {success:false,error:'Invalid record ID.'};
  const title = String(fd.get('title') ?? '').trim().slice(0,255);
  const rawSlug = String(fd.get('slug') ?? '').trim().toLowerCase();
  const slug = rawSlug.startsWith('/') ? rawSlug : '/' + rawSlug;
  if (!title || !SLUG_RE.test(slug) || slug.length > 128)
    return {success:false,error:'Provide a title and a unique URL like /visa-processing/pakistan.'};
  let parsedSections: unknown;
  let parsedSeo: unknown;
  try {
    parsedSections = JSON.parse(String(fd.get('sections') || '[]'));
    parsedSeo = JSON.parse(String(fd.get('seoSettings') || '{}'));
    if (!Array.isArray(parsedSections) || parsedSections.length > 100 || parsedSections.some(s => !s || typeof s !== 'object' || typeof s.type !== 'string')) throw new Error('invalid sections');
    if (!parsedSeo || typeof parsedSeo !== 'object' || Array.isArray(parsedSeo)) throw new Error('invalid SEO');
  } catch {return {success:false,error:'Invalid section or SEO JSON. Reload the editor and retry.'};}
  const str = (key: string, max=10000) => String(fd.get(key) || '').slice(0,max);
  const value = {
    title, slug, status: (fd.get('status') === 'draft' ? 'draft':'published') as 'draft'|'published',
    showInMenu: fd.get('showInMenu') === 'true' || fd.get('showInMenu') === 'on',
    parentPage: str('parentPage',128) || null,
    guideCategory: null,
    guideCardData: str('guideCardData',20000) || null,
    sections: JSON.stringify(parsedSections),
    richText: str('richText',1000000) || null,
    metaTitle: str('metaTitle',255) || null,
    metaDescription: str('metaDescription',2000) || null,
    bannerBgImage: str('bannerBgImage',2000) || null,
    bannerPosition: str('bannerPosition',50) || 'center center',
    bannerSize: str('bannerSize',50) || 'cover',
    bannerTitle: str('bannerTitle',2000) || null,
    bannerDescription: str('bannerDescription',10000) || null,
    seoSettings: parsedSeo,
  };
  try {
    const existingSlug = (await db.select({id:visaProcessing.id}).from(visaProcessing).where(eq(visaProcessing.slug,slug)).limit(1))[0];
    if (existingSlug && existingSlug.id !== id) return {success:false,error:'This visa-processing URL is already in use.'};
    const before = id ? (await db.select().from(visaProcessing).where(eq(visaProcessing.id,id)).limit(1))[0] : null;
    if (id && !before) return {success:false,error:'Visa-processing record was not found.'};
    const newId = id ? id : (await db.insert(visaProcessing).values(value).$returningId())[0].id;
    if (id) await db.update(visaProcessing).set({...value,updatedAt:new Date()}).where(eq(visaProcessing.id,id));
    await logAdminActivityAction({type:'visa_processing',action:id?'Updated Visa Processing Page':'Created Visa Processing Page',details:`${title} (${slug})`,previousEntry:before?{id:before.id,slug:before.slug,title:before.title,status:before.status}:null,newEntry:{id:newId,slug,title,status:value.status}});
    revalidatePath('/admin/visa-processing'); revalidatePath('/admin/pages/edit'); revalidatePath(slug);
    revalidatePath('/', 'layout');
    return {success:true,id:newId};
  } catch(error) {console.error('[visa-processing] Save failed', error);return {success:false,error:'Unable to save visa processing page. Check the database migration and server logs.'};}
}

export async function deleteVisaProcessingAction(id:number) {
  await requireAdmin([...ROLE]);
  if (!Number.isSafeInteger(id) || id < 1) return {success:false,error:'Invalid record ID.'};
  try {
    const before = (await db.select().from(visaProcessing).where(eq(visaProcessing.id,id)).limit(1))[0];
    if (!before) return {success:false,error:'Record not found.'};
    await db.delete(visaProcessing).where(eq(visaProcessing.id,id));
    await logAdminActivityAction({type:'visa_processing',action:'Deleted Visa Processing Page',details:`${before.title} (${before.slug})`,previousEntry:{id:before.id,title:before.title,slug:before.slug}});
    revalidatePath(before.slug);revalidatePath('/admin/visa-processing');revalidatePath('/', 'layout');
    return {success:true};
  } catch(error) {console.error('[visa-processing] Delete failed',error);return {success:false,error:'Could not delete the page.'};}
}

export async function updateVisaProcessingSlugAction(id: number, rawSlug: string) {
  await requireAdmin([...ROLE]);
  if (!Number.isSafeInteger(id) || id < 1) return { success: false, error: 'Invalid record ID.' };

  const cleanSlug = rawSlug.trim().toLowerCase();
  const slug = cleanSlug.startsWith('/') ? cleanSlug : `/${cleanSlug}`;
  if (!SLUG_RE.test(slug) || slug.length > 128) {
    return { success: false, error: 'Use a URL like /visa-processing/pakistan.' };
  }

  try {
    const [page] = await db.select().from(visaProcessing).where(eq(visaProcessing.id, id)).limit(1);
    if (!page) return { success: false, error: 'Visa-processing page was not found.' };
    const [existing] = await db.select({ id: visaProcessing.id }).from(visaProcessing).where(eq(visaProcessing.slug, slug)).limit(1);
    if (existing && existing.id !== id) return { success: false, error: 'This public URL is already in use.' };
    if (page.slug === slug) return { success: true, slug };

    await db.update(visaProcessing).set({ slug, updatedAt: new Date() }).where(eq(visaProcessing.id, id));
    await logAdminActivityAction({
      type: 'visa_processing',
      action: 'Updated Visa Processing URL',
      details: `${page.title}: ${page.slug} → ${slug}`,
      previousEntry: { id, title: page.title, slug: page.slug },
      newEntry: { id, title: page.title, slug },
    });
    revalidatePath(page.slug);
    revalidatePath(slug);
    revalidatePath('/admin/visa-processing');
    revalidatePath('/', 'layout');
    return { success: true, slug };
  } catch (error) {
    console.error('[visa-processing] URL update failed', error);
    return { success: false, error: 'Unable to update the public URL.' };
  }
}

export async function updateVisaProcessingVisibilityAction(id: number, isVisible: boolean) {
  await requireAdmin([...ROLE]);
  if (!Number.isSafeInteger(id) || id < 1) return { success: false, error: 'Invalid record ID.' };

  try {
    const [page] = await db.select().from(visaProcessing).where(eq(visaProcessing.id, id)).limit(1);
    if (!page) return { success: false, error: 'Visa-processing page was not found.' };
    const status = isVisible ? 'published' : 'draft';
    await db.update(visaProcessing).set({ status, updatedAt: new Date() }).where(eq(visaProcessing.id, id));
    await logAdminActivityAction({
      type: 'visa_processing',
      action: isVisible ? 'Published Visa Processing Page' : 'Hid Visa Processing Page',
      details: `${page.title} (${page.slug})`,
      previousEntry: { id, status: page.status },
      newEntry: { id, status },
    });
    revalidatePath(page.slug);
    revalidatePath('/admin/visa-processing');
    revalidatePath('/', 'layout');
    return { success: true, status };
  } catch (error) {
    console.error('[visa-processing] Visibility update failed', error);
    return { success: false, error: 'Unable to update page visibility.' };
  }
}

export async function duplicateVisaProcessingAction(id: number) {
  await requireAdmin([...ROLE]);
  if (!Number.isSafeInteger(id) || id < 1) return { success: false, error: 'Invalid record ID.' };

  try {
    const [source] = await db.select().from(visaProcessing).where(eq(visaProcessing.id, id)).limit(1);
    if (!source) return { success: false, error: 'Visa-processing page was not found.' };

    const baseSlug = source.slug.replace(/-\d+$/, '');
    let suffixText = '-copy';
    let copySlug = `${baseSlug.slice(0, 128 - suffixText.length)}${suffixText}`;
    let suffix = 2;
    while ((await db.select({ id: visaProcessing.id }).from(visaProcessing).where(eq(visaProcessing.slug, copySlug)).limit(1)).length > 0) {
      suffixText = `-copy-${suffix++}`;
      copySlug = `${baseSlug.slice(0, 128 - suffixText.length)}${suffixText}`;
    }

    const title = `Copy of ${source.title}`.slice(0, 255);
    const inserted = await db.insert(visaProcessing).values({
      ...source,
      id: undefined,
      title,
      slug: copySlug,
      status: 'draft',
      showInMenu: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).$returningId();
    const newId = inserted[0]?.id;
    if (!newId) return { success: false, error: 'Unable to create the duplicate page.' };

    await logAdminActivityAction({
      type: 'visa_processing',
      action: 'Duplicated Visa Processing Page',
      details: `${source.title} → ${title} (${copySlug})`,
      previousEntry: { id: source.id, title: source.title, slug: source.slug },
      newEntry: { id: newId, title, slug: copySlug, status: 'draft' },
    });
    revalidatePath('/admin/visa-processing');
    return { success: true, page: { id: newId, title, slug: copySlug, status: 'draft' } };
  } catch (error) {
    console.error('[visa-processing] Duplicate failed', error);
    return { success: false, error: 'Unable to duplicate this page.' };
  }
}
