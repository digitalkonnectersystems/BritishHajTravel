import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  // Reject traversal and encoded separators before any filesystem resolution.
  if (!resolvedParams.path?.length || resolvedParams.path.some(segment =>
    segment === '.' || segment === '..' || segment.includes('\\') || segment.includes('/') || segment.includes('\0')
  )) return new NextResponse('Invalid media path', { status: 400 });
  const filePath = resolvedParams.path.join('/');
  // Do not serve active HTML, JS, or arbitrary server-side files.
  if (!/\.(?:jpg|jpeg|png|gif|webp|svg|pdf|ico|avif|mp4|webm|mov)$/i.test(filePath))
    return new NextResponse('Unsupported media type', { status: 415 });

  try {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      ico: 'image/x-icon',
      avif: 'image/avif',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 1. Persistent shared media root (can survive Hostinger rebuilds).
    const storageRoot = process.env.MEDIA_STORAGE_ROOT
      ? path.resolve(process.env.MEDIA_STORAGE_ROOT)
      : path.join(process.cwd(), 'public', 'images_BHT');
    const candidatePath1 = path.join(storageRoot, filePath);
    if (fsSync.existsSync(candidatePath1)) {
      const fileBuffer = await fs.readFile(candidatePath1);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'; sandbox",
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Legacy media stored in release public/images_BHT.
    const releaseFile = path.join(process.cwd(), 'public', 'images_BHT', filePath);
    if (releaseFile !== candidatePath1 && fsSync.existsSync(releaseFile)) {
      const fileBuffer = await fs.readFile(releaseFile);
      return new NextResponse(new Uint8Array(fileBuffer), { headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' } });
    }

    // 4. Check in public/media/
    const candidatePath2 = path.join(process.cwd(), 'public', 'media', filePath);
    if (fsSync.existsSync(candidatePath2)) {
      const fileBuffer = await fs.readFile(candidatePath2);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'; sandbox",
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 4. Check in public/
    const candidatePath3 = path.join(process.cwd(), 'public', filePath);
    if (fsSync.existsSync(candidatePath3)) {
      const fileBuffer = await fs.readFile(candidatePath3);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "default-src 'none'; sandbox",
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new NextResponse('File Not Found', { status: 404 });
  } catch (err: any) {
    console.error('Media proxy error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
