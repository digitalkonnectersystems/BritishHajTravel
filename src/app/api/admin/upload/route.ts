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

    const provider = (process.env.MEDIA_STORAGE_PROVIDER || 'local').toLowerCase();
    if (process.env.MEDIA_STORAGE_ROOT && !path.isAbsolute(process.env.MEDIA_STORAGE_ROOT)) {
      return NextResponse.json({ success: false, error: 'MEDIA_STORAGE_ROOT must be an absolute filesystem path' }, { status: 500 });
    }
    if (!['blob', 'remote', 'local'].includes(provider)) {
      return NextResponse.json({ success: false, error: 'Unknown MEDIA_STORAGE_PROVIDER' }, { status: 500 });
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
    // SVG is active XML and may contain scripts. Keep existing trusted SVG assets,
    // but do not allow new untrusted SVG files to be uploaded to our origin.
    if (cleanExt === '.svg') {
      return NextResponse.json({ success: false, error: 'SVG uploads are disabled for security; upload PNG or WebP instead.' }, { status: 400 });
    }
    const isVideo = videoExtensions.includes(cleanExt);
    const allowedExtensions = [...imageDocumentExtensions, ...videoExtensions];

    if (!allowedExtensions.includes(cleanExt)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${cleanExt}. Allowed: images, PDF, SVG, MP4, WebM, or MOV.` },
        { status: 400 }
      );
    }

    const maxFileSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_FILE_SIZE_BYTES;
    if (file.size === 0) {
      return NextResponse.json({ success: false, error: 'Empty file cannot be uploaded' }, { status: 400 });
    }
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
    const uniqueFilename = `${cleanBaseName || 'media'}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${cleanExt}`;

    // Provider is explicit; no cross-provider fallback is permitted.
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
    if (provider === 'blob') {
      return NextResponse.json({ success: false, error: 'Blob provider selected but BLOB_READ_WRITE_TOKEN is missing. No automatic local fallback was attempted.' }, { status: 503 });
    }

    // Explicit local provider: writes never silently fall back from Blob or remote.
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const storageRoot = process.env.MEDIA_STORAGE_ROOT
        ? path.resolve(process.env.MEDIA_STORAGE_ROOT)
        : path.join(process.cwd(), 'public', 'images_BHT');
      const targetDir = path.join(storageRoot, subfolder);
      await fs.mkdir(targetDir, { recursive: true });

      const targetFilePath = path.join(targetDir, uniqueFilename);
      await fs.writeFile(targetFilePath, buffer);

      // Media route supports a persistent shared storage root across deployments.
      const publicUrl = `/media/${subfolder}/${uniqueFilename}`;
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
