import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { deleteAssets, listFolderAssets } from '@/lib/cloudinary';
import { findOrphans, referencedPublicIds } from '@/lib/mediaCleanup';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_DELETE_PER_REQUEST = 200;

function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized admin access' }, { status: 401 });
}

/** Every media URL the store still uses: product photos and videos, category covers, the logo. */
async function loadReferences() {
  const [products, categories, config] = await Promise.all([
    prisma.product.findMany({ select: { image: true, images: true, video: true } }),
    prisma.category.findMany({ select: { image: true } }),
    prisma.storeConfig.findMany({ select: { logoUrl: true } }),
  ]);
  return referencedPublicIds([
    ...products.flatMap((p) => [p.image, ...p.images, p.video]),
    ...categories.map((c) => c.image),
    ...config.map((c) => c.logoUrl),
  ]);
}

async function loadOrphans() {
  const [images, videos, referenced] = await Promise.all([
    listFolderAssets('image'),
    listFolderAssets('video'),
    loadReferences(),
  ]);
  return {
    totalFiles: images.length + videos.length,
    orphans: findOrphans([...images, ...videos], referenced),
  };
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const { totalFiles, orphans } = await loadOrphans();
    return NextResponse.json({
      success: true,
      totalFiles,
      orphans: orphans
        .sort((a, b) => b.bytes - a.bytes)
        .map((asset) => ({
          publicId: asset.public_id,
          resourceType: asset.resource_type,
          url: asset.secure_url,
          bytes: asset.bytes,
          createdAt: asset.created_at,
          format: asset.format,
        })),
    });
  } catch (error: unknown) {
    console.error('Media scan error:', error);
    return NextResponse.json({ success: false, error: 'Could not scan Cloudinary right now.' }, { status: 502 });
  }
}

/**
 * Deletes selected unused files. The orphan check is re-run on the server at delete time, so a
 * file that went back into use (or was never unused) is skipped even if the browser asks for it.
 */
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return unauthorized();

    const body = await request.json().catch(() => ({}));
    const requested = new Set<string>(
      Array.isArray(body.publicIds) ? body.publicIds.filter((id: unknown): id is string => typeof id === 'string') : []
    );
    if (requested.size === 0) {
      return NextResponse.json({ success: false, error: 'Select at least one file.' }, { status: 400 });
    }
    if (requested.size > MAX_DELETE_PER_REQUEST) {
      return NextResponse.json({ success: false, error: `Delete at most ${MAX_DELETE_PER_REQUEST} files at a time.` }, { status: 400 });
    }

    const { orphans } = await loadOrphans();
    const safe = orphans.filter((asset) => requested.has(asset.public_id));
    const images = safe.filter((a) => a.resource_type === 'image').map((a) => a.public_id);
    const videos = safe.filter((a) => a.resource_type === 'video').map((a) => a.public_id);

    const deleted = [
      ...(images.length ? await deleteAssets(images, 'image') : []),
      ...(videos.length ? await deleteAssets(videos, 'video') : []),
    ];

    return NextResponse.json({
      success: true,
      deleted: deleted.length,
      skipped: requested.size - deleted.length,
    });
  } catch (error: unknown) {
    console.error('Media cleanup error:', error);
    return NextResponse.json({ success: false, error: 'Could not delete the selected files.' }, { status: 502 });
  }
}
