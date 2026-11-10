import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { getMediaRoot, hashBuffer, safeMediaPath, validMediaPath } from '@/lib/mediaStorage';

export type LocalMediaRecord = {
  id: number;
  relativePath: string;
  storage: 'local' | 'public' | 'blob' | 'remote';
};
export type PixelDimensions = { width: number; height: number };
export type RenderedSizeRequest = { relativePath: string; renderedWidth: number; renderedHeight: number };

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
function localFile(row: LocalMediaRecord): string | null {
  if ((row.storage !== 'local' && row.storage !== 'public') || !validMediaPath(row.relativePath)) return null;
  const root = row.storage === 'public' ? path.join(process.cwd(), 'public', 'images_BHT') : getMediaRoot();
  return safeMediaPath(root, row.relativePath);
}

/** Read dimensions from file metadata, not CSS or a compressed Next/Image response. */
export async function intrinsicMediaDimensions(row: LocalMediaRecord): Promise<PixelDimensions | null> {
  const file = localFile(row);
  if (!file || !/\.(?:jpe?g|png|webp|avif|gif|svg)$/i.test(row.relativePath)) return null;
  try {
    const meta = await sharp(file, { limitInputPixels: 100_000_000 }).metadata();
    if (!meta.width || !meta.height) return null;
    const transposed = [5, 6, 7, 8].includes(meta.orientation || 1);
    return {width: transposed ? meta.height : meta.width, height: transposed ? meta.width : meta.height};
  } catch { return null; }
}

export async function resizeMediaToMeasuredBounds(
  row: LocalMediaRecord,
  measurement: RenderedSizeRequest,
  updateDatabase: (newSize: number, newHash: string) => Promise<void>,
): Promise<{status: 'resized' | 'skipped'; reason?: string; bytesSaved: number; before?: PixelDimensions; after?: PixelDimensions}> {
  const target = localFile(row);
  if (!target || !SUPPORTED.has(path.extname(row.relativePath).toLowerCase())) return {status:'skipped', reason:'Not a supported local still image', bytesSaved:0};
  const cssWidth = measurement.renderedWidth;
  const cssHeight = measurement.renderedHeight;
  if (![cssWidth, cssHeight].every(value => Number.isFinite(value) && value >= 1 && value <= 8192))
    return {status:'skipped', reason:'Invalid measured dimensions', bytesSaved:0};
  // Guard against two admins resizing the same file concurrently.
  const lockPath = `${target}.rendered-sizing.lock`;
  const lock = await fs.open(lockPath, 'wx');
  let tmp = '';
  try {
    const original = await fs.readFile(target);
    const meta = await sharp(original, { failOn:'error', limitInputPixels:100_000_000 }).metadata();
    if (!meta.width || !meta.height || meta.pages && meta.pages > 1)
      return {status:'skipped', reason:'Invalid or animated image', bytesSaved:0};
    const rotated = [5, 6, 7, 8].includes(meta.orientation || 1);
    const before = {width: rotated ? meta.height : meta.width, height: rotated ? meta.width : meta.height};

    // Cover-safe, retina-safe dimensions. The larger width/height requirement
    // wins, so a cropped hero never loses pixels needed outside the visible box.
    // No enlargement: if the source is already <= 2x the CSS box, leave it alone.
    const scale = Math.max(cssWidth * 2 / before.width, cssHeight * 2 / before.height);
    if (scale >= 0.98) return {status:'skipped', reason:'Already suitable for high-density displays', bytesSaved:0, before, after:before};
    const width = Math.max(1, Math.min(before.width - 1, Math.floor(before.width * scale)));
    const height = Math.max(1, Math.min(before.height - 1, Math.floor(before.height * scale)));
    const extension = path.extname(row.relativePath).toLowerCase();
    const pipeline = sharp(original, { failOn:'error', limitInputPixels:100_000_000 })
      .rotate().resize({ width, height, fit:'inside', withoutEnlargement:true });
    let candidate: Buffer;
    if (extension === '.jpg' || extension === '.jpeg') candidate = await pipeline.jpeg({quality:86,mozjpeg:true,chromaSubsampling:'4:4:4'}).toBuffer();
    else if (extension === '.png') candidate = await pipeline.png({compressionLevel:9, effort:8}).toBuffer();
    else if (extension === '.webp') candidate = await pipeline.webp({quality:85,effort:5}).toBuffer();
    else candidate = await pipeline.avif({quality:72,effort:5}).toBuffer();
    if (candidate.length >= original.length) return {status:'skipped', reason:'Resized file would be larger than the original', bytesSaved:0, before, after:before};

    const outputMeta = await sharp(candidate).metadata();
    const after = {width:outputMeta.width || width, height:outputMeta.height || height};
    if (after.width >= before.width || after.height >= before.height) return {status:'skipped', reason:'Image dimensions were not reduced', bytesSaved:0, before, after:before};

    // Preserve the first original in a private, non-public directory so a
    // production operator can recover the pre-resize bytes if ever needed.
    const backupRoot = path.resolve(process.cwd(), process.env.MEDIA_RENDERED_BACKUP_ROOT || '.media-rendered-backups');
    const backup = path.join(backupRoot, row.storage, row.relativePath);
    await fs.mkdir(path.dirname(backup), { recursive:true });
    await fs.copyFile(target, backup, 1 /* COPYFILE_EXCL */).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'EEXIST') throw error;
    });

    tmp = `${target}.rendering-${crypto.randomUUID()}`;
    await fs.writeFile(tmp, candidate, {flag:'wx'});
    const sourceStat = await fs.stat(target);
    await fs.chmod(tmp, sourceStat.mode);
    await fs.rename(tmp, target);
    tmp = '';
    try {
      await updateDatabase(candidate.length, hashBuffer(candidate));
    } catch(error) {
      // Keep DB and image bytes consistent if the update fails.
      const rollback = `${target}.rollback-${crypto.randomUUID()}`;
      await fs.writeFile(rollback, original, {flag:'wx'});
      await fs.chmod(rollback, sourceStat.mode);
      await fs.rename(rollback, target);
      throw error;
    }
    return {status:'resized', bytesSaved:original.length-candidate.length, before, after};
  } finally {
    if (tmp) await fs.unlink(tmp).catch(() => {});
    await lock.close();
    await fs.unlink(lockPath).catch(() => {});
  }
}
