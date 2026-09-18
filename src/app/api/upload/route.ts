import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB limit to support short videos

export async function POST(request: Request) {
  try {
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
      fileData = body.file || body.image;
    }

    if (!fileData) {
      return NextResponse.json({ success: false, error: 'Missing file data' }, { status: 400 });
    }

    const resourceType = fileData.match(/^data:(video)\//) ? 'video' : 'auto';
    const uploadResult = await uploadToCloudinary(fileData, 'gnaath_communications', resourceType);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error: unknown) {
    console.error('API /api/upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
