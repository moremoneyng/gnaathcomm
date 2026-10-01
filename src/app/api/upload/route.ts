import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAdminSession } from '@/lib/auth';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB limit to support short videos
const ALLOWED_MEDIA = /^data:(image|video)\/[a-z0-9.+-]+;base64,/i;

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type') || '';

    let fileData: string = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: 'No file provided in form data' }, { status: 400 });
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { success: false, error: 'File is too large. Please choose a file under 50 MB.' },
          { status: 413 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'application/octet-stream';
      fileData = `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else {
      const body = await request.json();
      fileData = typeof (body.file || body.image) === 'string' ? body.file || body.image : '';
    }

    if (!fileData) {
      return NextResponse.json({ success: false, error: 'Missing file data' }, { status: 400 });
    }

    if (!ALLOWED_MEDIA.test(fileData)) {
      return NextResponse.json({ success: false, error: 'Only image and video files can be uploaded.' }, { status: 415 });
    }

    const resourceType = fileData.match(/^data:(video)\//i) ? 'video' : 'image';
    const uploadResult = await uploadToCloudinary(fileData, 'gnaath_communications', resourceType);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error: unknown) {
    console.error('API /api/upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
