import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { signUploadParams, UPLOAD_FOLDER } from '@/lib/cloudinary';

/**
 * Signs a one-off browser upload straight to Cloudinary. Files never pass through our server,
 * so Vercel's ~4.5 MB request limit no longer rejects large photos or product videos.
 */
export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ success: false, error: 'Image uploads are not configured.' }, { status: 500 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = signUploadParams({ timestamp, folder: UPLOAD_FOLDER });
  return NextResponse.json(
    { success: true, cloudName, apiKey, timestamp, folder: UPLOAD_FOLDER, signature },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
