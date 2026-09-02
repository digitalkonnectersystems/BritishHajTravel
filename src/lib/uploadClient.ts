/**
 * Client function to upload a file to local storage via /api/admin/upload route.
 */
export async function uploadFile(file: File, subfolder: string = 'uploads'): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subfolder', subfolder);

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      console.error('Upload response not valid JSON:', text);
      alert('Upload failed: Server returned an invalid response. Please refresh the browser page and try again.');
      return null;
    }

    if (data.success && data.url) {
      return sanitizeMediaUrl(data.url);
    } else {
      console.error('Upload error:', data.error);
      alert(`Upload failed: ${data.error || 'Unknown error'}`);
      return null;
    }
  } catch (err: any) {
    console.error('Upload exception:', err);
    alert(`Upload failed: ${err.message || 'Network error'}`);
    return null;
  }
}

// Backward compatibility alias
export const uploadFileToFtp = uploadFile;

/**
 * Ensures any uploaded media URL is clean, rewrites legacy /media or /uploads paths,
 * and standardizes everything to /images_KTC.
 */
export function sanitizeMediaUrl(url: string): string {
  if (!url) return '';
  const mediaBase = (process.env.NEXT_PUBLIC_MEDIA_URL || '/images_KTC').replace(/\/$/, '');

  // Strip full remote host URLs
  if (url.startsWith('https://media.kingtravelcan.com')) {
    return url.replace(/^https?:\/\/media\.kingtravelcan\.com\/?/, `${mediaBase}/`);
  }
  if (url.startsWith('https://kingtravelcan.com/media/')) {
    return url.replace(/^https?:\/\/kingtravelcan\.com\/media\//, `${mediaBase}/`);
  }
  if (url.startsWith('https://www.kingtravelcan.com/media/')) {
    return url.replace(/^https?:\/\/www\.kingtravelcan\.com\/media\//, `${mediaBase}/`);
  }

  // Rewrite legacy relative paths to /images_KTC/
  if (url.startsWith('/media/')) {
    return url.replace(/^\/media\//, `${mediaBase}/`);
  }
  if (url.startsWith('/uploads/')) {
    return url.replace(/^\/uploads\//, `${mediaBase}/uploads/`);
  }
  if (url.startsWith('uploads/')) {
    return `${mediaBase}/${url}`;
  }
  if (url.startsWith('images_KTC/')) {
    return `/${url}`;
  }

  return url;
}

/**
 * Auto-generates clean, SEO-optimized Alt Text for any uploaded image file or path across all CRUDs.
 */
export function generateAutoAltText(fileOrName: File | string, contextTitle?: string): string {
  if (contextTitle && contextTitle.trim()) {
    const cleanContext = contextTitle.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
    return `Official ${cleanContext} - King Travel Canada`;
  }

  const filename = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
  if (!filename) return 'King Travel Canada Image';

  // Strip path and extension
  const basename = filename.split('/').pop()?.split('\\').pop() || filename;
  const nameWithoutExt = basename.replace(/\.[^/.]+$/, '');

  // Convert filename slug/snake_case to clean Title Case
  const cleanName = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();

  return `${cleanName} - King Travel Canada`;
}
