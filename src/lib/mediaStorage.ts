import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

export const MAX_OPTIMIZED_BYTES = 100 * 1024 - 1;
export const MEDIA_FOLDERS = new Set(['badges','banners','blogs','branding','brochures','destinations','flights','hotels','logos','packages','sections','social','umrah','uploads']);
const EXTENSIONS = new Set(['.jpg','.jpeg','.png','.webp','.gif','.ico','.avif','.pdf','.mp4','.mov','.webm','.svg']);
export function getMediaRoot() {
  const env = process.env.MEDIA_STORAGE_ROOT?.trim();
  return env ? path.resolve(process.cwd(), env) : path.join(process.cwd(), 'public', 'images_BHT');
}
export function getMediaDirectories() {
  const root = getMediaRoot();
  const releaseRoot = path.resolve(process.cwd(), 'public', 'images_BHT');
  return root === releaseRoot ? [{root, storage: 'local'}] : [{root, storage:'local'}, {root:releaseRoot, storage:'public'}];
}
export function validMediaPath(relativePath: string) {
  const segments = relativePath.split('/');
  return segments.length >= 2 && segments.length <= 5 && segments.every(p => p !== '.' && p !== '..' && /^[a-zA-Z0-9_.-]+$/.test(p)) && EXTENSIONS.has(path.extname(relativePath).toLowerCase());
}
export function safeMediaPath(root: string, relative: string) {
  if (!validMediaPath(relative)) throw new Error('Invalid media path');
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(root + path.sep)) throw new Error('Invalid storage path');
  return resolved;
}
export function hashBuffer(buffer: Buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
export function imageType(ext: string) { return ['.jpg','.jpeg','.png','.webp','.avif'].includes(ext.toLowerCase()); }

/** Convert eligible still images to a constrained WebP. Never silently save an oversized image. */
export async function optimizeImage(buffer: Buffer, originalExt: string) {
  if (!imageType(originalExt)) {
    if (['.gif','.ico'].includes(originalExt) && buffer.length > MAX_OPTIMIZED_BYTES) {
      throw new Error('Animated GIF/ICO over 100 KB cannot be safely optimized. Convert it to WebP first.');
    }
    return { buffer, extension: originalExt, optimized: false };
  }
  // Validate encoded image even when already below the limit.
  const source = sharp(buffer, { failOn: 'error', limitInputPixels: 100_000_000 });
  const metadata = await source.metadata();
  if (!metadata.width || !metadata.height) throw new Error('Invalid image');
  if (buffer.length <= MAX_OPTIMIZED_BYTES) return {buffer, extension:originalExt, optimized:false};
  let width = Math.min(metadata.width, 1920);
  let height = Math.min(metadata.height, 1920);
  let smallest = buffer;
  for (let attempt = 0; attempt < 24; attempt++) {
    const quality = [80, 70, 60, 50, 40, 32][attempt % 6];
    const candidate = await sharp(buffer, { limitInputPixels: 100_000_000 })
      .rotate().resize({width, height, fit: 'inside', withoutEnlargement: true})
      .webp({quality, effort: 4}).toBuffer();
    if (candidate.length < smallest.length) smallest = candidate;
    if (candidate.length <= MAX_OPTIMIZED_BYTES) return {buffer:candidate, extension:'.webp', optimized:true};
    if (attempt % 6 === 5) { width = Math.max(64, Math.floor(width * .75)); height = Math.max(64, Math.floor(height * .75)); }
  }
  throw new Error('Image could not be compressed below 100 KB without excessive quality loss');
}
export async function walkMediaFiles(root: string, limit = 20000) {
  const output: {relative:string; size:number}[] = [];
  async function visit(relative: string) {
    if (output.length >= limit) throw new Error('Media scan limit exceeded (20,000)');
    const full = path.join(root, relative);
    const entries = await fs.readdir(full, {withFileTypes:true}).catch((e: NodeJS.ErrnoException) => {
      if (e.code === 'ENOENT') return [];
      throw e;
    });
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isDirectory() && next.split('/').length < 5) await visit(next);
      if (entry.isFile() && validMediaPath(next)) {
        const stat = await fs.stat(path.join(root,next));
        output.push({relative:next, size:stat.size});
      }
    }
  }
  await visit('');
  return output;
}
