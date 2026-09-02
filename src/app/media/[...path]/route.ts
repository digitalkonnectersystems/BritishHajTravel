import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const filePath = resolvedParams.path.join('/');

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
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 1. Check in public/images_KTC/
    const candidatePath1 = path.join(process.cwd(), 'public', 'images_KTC', filePath);
    if (fsSync.existsSync(candidatePath1)) {
      const fileBuffer = await fs.readFile(candidatePath1);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Check in public/media/
    const candidatePath2 = path.join(process.cwd(), 'public', 'media', filePath);
    if (fsSync.existsSync(candidatePath2)) {
      const fileBuffer = await fs.readFile(candidatePath2);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 3. Check in public/
    const candidatePath3 = path.join(process.cwd(), 'public', filePath);
    if (fsSync.existsSync(candidatePath3)) {
      const fileBuffer = await fs.readFile(candidatePath3);
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
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
