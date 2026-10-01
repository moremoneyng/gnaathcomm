/**
 * Finds Cloudinary uploads that nothing in the store references any more (photos removed
 * from a product, deleted products, replaced covers). Pure helpers, unit-tested.
 */

/** Files newer than this are never offered for cleanup: they may belong to a form still being filled in. */
export const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000;

export interface CloudinaryAsset {
  public_id: string;
  resource_type: string;
  secure_url: string;
  created_at: string;
  bytes: number;
  format?: string;
  width?: number;
  height?: number;
}

/**
 * Extracts the public id from a Cloudinary delivery URL, e.g.
 * https://res.cloudinary.com/demo/image/upload/v123/gnaath_communications/abc.jpg → gnaath_communications/abc
 */
export function publicIdFromCloudinaryUrl(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== 'res.cloudinary.com') return null;
    const parts = pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    let rest = parts.slice(uploadIndex + 1);
    const versionIndex = rest.findIndex((part) => /^v\d+$/.test(part));
    if (versionIndex !== -1) rest = rest.slice(versionIndex + 1);
    if (rest.length === 0) return null;
    return decodeURIComponent(rest.join('/')).replace(/\.[a-z0-9]+$/i, '');
  } catch {
    return null;
  }
}

/** Builds the set of public ids referenced anywhere in the store's data. */
export function referencedPublicIds(urls: (string | null | undefined)[]) {
  const ids = new Set<string>();
  for (const url of urls) {
    if (!url) continue;
    const id = publicIdFromCloudinaryUrl(url);
    if (id) ids.add(id);
  }
  return ids;
}

export function findOrphans(assets: CloudinaryAsset[], referenced: Set<string>, now = Date.now()) {
  return assets.filter(
    (asset) => !referenced.has(asset.public_id) && now - new Date(asset.created_at).getTime() >= ORPHAN_MIN_AGE_MS
  );
}
