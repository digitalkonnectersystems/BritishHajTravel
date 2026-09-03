import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

// Strict allow-list of recognized media subfolders matching public/images_KTC
const ALLOWED_SUBFOLDERS = new Set([
  'badges',
  'banners',
  'blogs',
  'branding',
  'brochures',
  'flights',
  'hotels',
  'logos',
  'packages',
  'sections',
  'social',
  'umrah',
  'uploads',
]);

const SUBFOLDER_ALIASES: Record<string, string> = {
  backgrounds: 'banners',
  disclaimer: 'banners',
  footer: 'logos',
  login: 'branding',
  logo: 'logos',
  'packages/gallery': 'packages',
  visas: 'umrah',
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    let subfolder = (formData.get('subfolder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate subfolder against allow-list
    subfolder = subfolder.toLowerCase().trim();
    subfolder = SUBFOLDER_ALIASES[subfolder] || subfolder;
    if (!ALLOWED_SUBFOLDERS.has(subfolder)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid subfolder "${subfolder}". Allowed folders: ${Array.from(ALLOWED_SUBFOLDERS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds maximum allowed limit of 10MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize extension and base filename
    const originalExt = path.extname(file.name) || '.png';
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf', '.ico', '.avif'];
    const cleanExt = originalExt.toLowerCase();

    if (!allowedExtensions.includes(cleanExt)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${cleanExt}. Allowed: images, PDF, SVG.` },
        { status: 400 }
      );
    }

    const cleanBaseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^\w-]/g, '');
    const uniqueFilename = `${cleanBaseName || 'media'}-${Date.now()}${cleanExt}`;

    // 1. Check if Vercel Blob is configured (for live serverless environments)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobPath = `images_KTC/${subfolder}/${uniqueFilename}`;
        const blob = await put(blobPath, file, {
          access: 'public',
          addRandomSuffix: false,
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          relativePath: blobPath,
        });
      } catch (blobErr: any) {
        console.error('Vercel Blob upload failed, attempting fallback:', blobErr);
      }
    }

    // 2. Local Environment fallback (writes to public/images_KTC/)
    try {
      const targetDir = path.join(process.cwd(), 'public', 'images_KTC', subfolder);
      await fs.mkdir(targetDir, { recursive: true });

      const targetFilePath = path.join(targetDir, uniqueFilename);
      await fs.writeFile(targetFilePath, buffer);

      const publicUrl = `/images_KTC/${subfolder}/${uniqueFilename}`;
      const relativePath = `images_KTC/${subfolder}/${uniqueFilename}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        relativePath,
      });
    } catch (fsErr: any) {
      // If local filesystem is read-only (EROFS) and Blob wasn't configured
      if (fsErr.code === 'EROFS') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Live Vercel filesystem is read-only. Please create a free Vercel Blob Store in your Vercel Project Dashboard (Storage > Blob) or add BLOB_READ_WRITE_TOKEN to Environment Variables.',
          },
          { status: 500 }
        );
      }
      throw fsErr;
    }
  } catch (error: any) {
    console.error('Error in /api/admin/upload POST handler:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error uploading file' },
      { status: 500 }
    );
  }
}
