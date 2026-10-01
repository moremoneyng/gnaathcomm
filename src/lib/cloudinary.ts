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

export const UPLOAD_FOLDER = 'gnaath_communications';

/** Lists every upload of one resource type in the store's Cloudinary folder (Admin API, paginated). */
export async function listFolderAssets(resourceType: 'image' | 'video', maxAssets = 5000) {
  const assets: Array<{
    public_id: string;
    resource_type: string;
    secure_url: string;
    created_at: string;
    bytes: number;
    format?: string;
    width?: number;
    height?: number;
  }> = [];
  let nextCursor: string | undefined;
  do {
    const page = await cloudinary.api.resources({
      type: 'upload',
      resource_type: resourceType,
      prefix: `${UPLOAD_FOLDER}/`,
      max_results: 500,
      ...(nextCursor && { next_cursor: nextCursor }),
    });
    assets.push(...page.resources);
    nextCursor = page.next_cursor;
  } while (nextCursor && assets.length < maxAssets);
  return assets;
}

/** Permanently deletes uploads by public id (max 100 per Cloudinary call). Returns the ids Cloudinary confirmed. */
export async function deleteAssets(publicIds: string[], resourceType: 'image' | 'video') {
  const deleted: string[] = [];
  for (let i = 0; i < publicIds.length; i += 100) {
    const chunk = publicIds.slice(i, i + 100);
    const result = await cloudinary.api.delete_resources(chunk, { resource_type: resourceType, type: 'upload' });
    for (const [id, status] of Object.entries(result.deleted || {})) {
      if (status === 'deleted') deleted.push(id);
    }
  }
  return deleted;
}
