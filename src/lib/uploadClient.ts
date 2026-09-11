/**
 * Client function to upload a file to local storage via /api/admin/upload route.
 */
async function prepareImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml' || file.type === 'image/webp') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 2400;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.webp`, { type: 'image/webp', lastModified: file.lastModified });
  } catch {
    return file;
  }
}

export async function uploadFile(file: File, subfolder: string = 'uploads'): Promise<string | null> {
  try {
    const preparedFile = await prepareImageForUpload(file);
    const formData = new FormData();
    formData.append('file', preparedFile);
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
 * and standardizes everything to /images_BHT.
 */
export function sanitizeMediaUrl(url: string): string {
  if (!url) return '';
  const mediaBase = (process.env.NEXT_PUBLIC_MEDIA_URL || '/images_BHT').replace(/\/$/, '');

  // Strip full remote host URLs
  if (url.startsWith('https://media.britishhajjtravel.com')) {
    return url.replace(/^https?:\/\/media\.britishhajjtravel\.com\/?/, `${mediaBase}/`);
  }
  if (url.startsWith('https://britishhajjtravel.com/media/')) {
    return url.replace(/^https?:\/\/britishhajjtravel\.com\/media\//, `${mediaBase}/`);
  }
  if (url.startsWith('https://www.britishhajjtravel.com/media/')) {
    return url.replace(/^https?:\/\/www\.britishhajjtravel\.com\/media\//, `${mediaBase}/`);
  }

  // Rewrite legacy relative paths to /images_BHT/
  if (url.startsWith('/media/')) {
    return url.replace(/^\/media\//, `${mediaBase}/`);
  }
  if (url.startsWith('/uploads/')) {
    return url.replace(/^\/uploads\//, `${mediaBase}/uploads/`);
  }
  if (url.startsWith('uploads/')) {
    return `${mediaBase}/${url}`;
  }
  if (url.startsWith('images_BHT/')) {
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
    return `Official ${cleanContext} - British Hajj Travel UK`;
  }

  const filename = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
  if (!filename) return 'British Hajj Travel UK Image';

  // Strip path and extension
  const basename = filename.split('/').pop()?.split('\\').pop() || filename;
  const nameWithoutExt = basename.replace(/\.[^/.]+$/, '');

  // Convert filename slug/snake_case to clean Title Case
  const cleanName = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();

  return `${cleanName} - British Hajj Travel UK`;
}
