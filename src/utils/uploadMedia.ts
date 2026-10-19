import { compressImage } from '@/utils/compressImage';

/** Our own /api/upload sits behind Vercel's ~4.5 MB body limit; only use it as a fallback below that. */
const SERVER_UPLOAD_LIMIT = 4 * 1024 * 1024;

interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/** Reads a JSON reply without crashing on HTML/plain-text error pages (e.g. "Request Entity Too Large"). */
async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function getSignature(): Promise<UploadSignature> {
  const response = await fetch('/api/upload/signature', { method: 'POST', cache: 'no-store' });
  const data = await readJson(response);
  if (response.status === 401) throw new Error('Your admin session has expired. Please sign in again.');
  if (!response.ok || !data.success) throw new Error(String(data.error || 'Could not start the upload.'));
  return data as unknown as UploadSignature;
}

async function uploadDirect(file: File, kind: 'image' | 'video'): Promise<string> {
  const sig = await getSignature();
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('folder', sig.folder);
  form.append('signature', sig.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/${kind}/upload`, { method: 'POST', body: form });
  const data = await readJson(response);
  const url = typeof data.secure_url === 'string' ? data.secure_url : '';
  if (!response.ok || !url) {
    const message = (data.error as { message?: string } | undefined)?.message;
    throw new Error(message ? `Cloudinary: ${message}` : 'The upload did not complete. Please try again.');
  }
  return url;
}

async function uploadViaServer(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch('/api/upload', { method: 'POST', body: form });
  const data = await readJson(response);
  if (response.status === 413) throw new Error('This file is too large. Please choose a smaller one.');
  if (!response.ok || !data.success || typeof data.url !== 'string') {
    throw new Error(String(data.error || 'Upload failed. Please try again.'));
  }
  return data.url;
}

/**
 * Uploads a product photo or video and resolves with its permanent https URL. Photos are resized and
 * compressed first. Files go straight to Cloudinary; small files fall back to our server if that fails.
 */
export async function uploadMedia(file: File, kind: 'image' | 'video'): Promise<string> {
  const prepared = kind === 'image' ? await compressImage(file) : file;
  try {
    return await uploadDirect(prepared, kind);
  } catch (directError) {
    if (prepared.size > SERVER_UPLOAD_LIMIT || (directError instanceof Error && directError.message.includes('session'))) {
      throw directError;
    }
    try {
      return await uploadViaServer(prepared);
    } catch {
      throw directError;
    }
  }
}
