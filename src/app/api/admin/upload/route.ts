import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';
import { getCurrentSession } from '@/lib/auth';

// Strict allow-list of recognized media subfolders matching public/images_BHT
const ALLOWED_SUBFOLDERS = new Set([
  'badges',
  'banners',
  'blogs',
  'branding',
  'brochures',
  'destinations',
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

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB image/document limit
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;

function isValidSubfolder(value: string) {
  return ALLOWED_SUBFOLDERS.has(value) || /^gallery\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    // A server-side upload endpoint must never accept anonymous uploads.
    const session = await getCurrentSession();
    if (!session || !['super_admin', 'admin', 'content_editor', 'seo_manager'].includes(session.role)) {
      return NextResponse.json({ success: false, error: 'Administrator login required' }, { status: 401 });
    }

    const provider = (process.env.MEDIA_STORAGE_PROVIDER || 'blob').toLowerCase();
    if (!['blob', 'remote', 'local'].includes(provider)) {
      return NextResponse.json({ success: false, error: 'Unknown MEDIA_STORAGE_PROVIDER' }, { status: 500 });
    }
    if (provider === 'remote' && !process.env.BHT_SESSION_SECRET) {
      return NextResponse.json({ success: false, error: 'Configure BHT_SESSION_SECRET before enabling remote uploads' }, { status: 503 });
    }
    if (provider === 'local' && process.env.VERCEL) {
      return NextResponse.json({ success: false, error: 'Local media storage cannot be used on Vercel functions' }, { status: 503 });
    }

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
    if (!isValidSubfolder(subfolder)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid subfolder "${subfolder}". Allowed folders: ${Array.from(ALLOWED_SUBFOLDERS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Sanitize extension and base filename
    const originalExt = path.extname(file.name) || '.png';
    const imageDocumentExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf', '.ico', '.avif'];
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    const cleanExt = originalExt.toLowerCase();
    const isVideo = videoExtensions.includes(cleanExt);
    const allowedExtensions = [...imageDocumentExtensions, ...videoExtensions];

    if (!allowedExtensions.includes(cleanExt)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${cleanExt}. Allowed: images, PDF, SVG, MP4, WebM, or MOV.` },
        { status: 400 }
      );
    }

    const maxFileSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { success: false, error: `File size exceeds maximum allowed limit of ${isVideo ? '100MB' : '10MB'}.` },
        { status: 400 }
      );
    }

    const cleanBaseName = path
      .basename(file.name, originalExt)
      .toLowerCase()
      .replace(/[^\w-]/g, '');
    const uniqueFilename = `${cleanBaseName || 'media'}-${Date.now()}${cleanExt}`;

    // An optional remote media server stores media outside Vercel Blob. The remote
    // server requires a private bearer token and must return a public HTTPS URL.
    // Do NOT fall back to Blob when remote uploads fail: doing so would silently
    // increase Vercel Blob usage again.
    if (provider === 'remote') {
      const endpoint = process.env.MEDIA_UPLOAD_ENDPOINT;
      const token = process.env.MEDIA_UPLOAD_TOKEN;
      if (!endpoint?.startsWith('https://') || !token) {
        return NextResponse.json({ success: false, error: 'Set MEDIA_UPLOAD_ENDPOINT (HTTPS) and MEDIA_UPLOAD_TOKEN' }, { status: 503 });
      }
      try {
        const externalForm = new FormData();
        externalForm.append('file', file, uniqueFilename);
        externalForm.append('subfolder', subfolder);
        const result = await fetch(endpoint, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: externalForm,
          cache: 'no-store',
          signal: AbortSignal.timeout(45000),
        });
        const response = await result.json();
        if (!result.ok || !response?.success || typeof response.url !== 'string' || !response.url.startsWith('https://')) {
          throw new Error('The remote media server did not accept this file');
        }
        return NextResponse.json({ success: true, url: response.url, relativePath: response.relativePath || null });
      } catch (error) {
        console.error('Remote media upload failed:', error);
        return NextResponse.json({ success: false, error: 'Remote media upload failed. Check server settings and availability.' }, { status: 502 });
      }
    }

    // Existing Blob provider remains available until the remote host is ready.
    if (provider === 'blob' && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobPath = `images_BHT/${subfolder}/${uniqueFilename}`;
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
        console.error('Vercel Blob upload failed:', blobErr);
        return NextResponse.json({ success: false, error: 'Vercel Blob upload failed. Check Blob storage and limits.' }, { status: 502 });
      }
    }
    if (provider === 'blob' && process.env.VERCEL) {
      return NextResponse.json({ success: false, error: 'Blob provider requires BLOB_READ_WRITE_TOKEN on Vercel' }, { status: 503 });
    }

    // Local development-only fallback (never reliable on Vercel serverless).
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const targetDir = path.join(process.cwd(), 'public', 'images_BHT', subfolder);
      await fs.mkdir(targetDir, { recursive: true });

      const targetFilePath = path.join(targetDir, uniqueFilename);
      await fs.writeFile(targetFilePath, buffer);

      const publicUrl = `/images_BHT/${subfolder}/${uniqueFilename}`;
      const relativePath = `images_BHT/${subfolder}/${uniqueFilename}`;

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
              'This deployment has read-only filesystem storage. Configure Blob or a remote media server.',
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
