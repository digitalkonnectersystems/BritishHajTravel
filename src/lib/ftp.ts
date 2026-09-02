/**
 * @deprecated Media storage has migrated from remote FTP to local filesystem storage in /public/images_KTC/.
 * Use `uploadFile` in `@/lib/uploadClient` or `/api/admin/upload` route instead.
 */

export interface FtpUploadResult {
  success: boolean;
  url?: string;
  relativePath?: string;
  error?: string;
}

export async function uploadToFtp(
  _fileBuffer: Buffer,
  _originalFilename: string,
  _subfolder: string = 'uploads'
): Promise<FtpUploadResult> {
  return {
    success: false,
    error: 'FTP upload is deprecated. Use local upload route /api/admin/upload.',
  };
}
