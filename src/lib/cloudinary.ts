import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a base64 or buffer image string to Cloudinary into the gnaath_communications folder
 */
export async function uploadToCloudinary(
  fileString: string,
  folder = 'gnaath_communications',
  resourceType: 'auto' | 'image' | 'video' | 'raw' = 'auto'
): Promise<{ secure_url: string; public_id: string }> {
  try {
    const result = await cloudinary.uploader.upload(fileString, {
      folder,
      resource_type: resourceType,
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: unknown) {
    console.error('Cloudinary upload error:', error);
    const message = error instanceof Error ? error.message : 'Unknown Cloudinary error';
    throw new Error(`Cloudinary upload failed: ${message}`);
  }
}

/**
 * Deletes an image from Cloudinary given its public_id
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}
