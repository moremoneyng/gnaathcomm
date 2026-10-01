import assert from 'node:assert/strict';
import test from 'node:test';

import { findOrphans, ORPHAN_MIN_AGE_MS, publicIdFromCloudinaryUrl, referencedPublicIds } from './mediaCleanup';

test('public ids are read from Cloudinary urls, with or without transformations', () => {
  assert.equal(
    publicIdFromCloudinaryUrl('https://res.cloudinary.com/x/image/upload/v1790642523/gnaath_communications/uhv0.jpg'),
    'gnaath_communications/uhv0'
  );
  assert.equal(
    publicIdFromCloudinaryUrl('https://res.cloudinary.com/x/image/upload/w_400,c_fill/v12/gnaath_communications/a.webp'),
    'gnaath_communications/a'
  );
  assert.equal(publicIdFromCloudinaryUrl('https://res.cloudinary.com/x/video/upload/v1/gnaath_communications/clip.mp4'), 'gnaath_communications/clip');
  assert.equal(publicIdFromCloudinaryUrl('https://images.unsplash.com/photo-1.jpg'), null);
  assert.equal(publicIdFromCloudinaryUrl('/gnaathlogo-header.png'), null);
});

test('only unreferenced files older than a day are offered for cleanup', () => {
  const now = Date.parse('2026-10-10T12:00:00Z');
  const old = new Date(now - ORPHAN_MIN_AGE_MS - 1000).toISOString();
  const fresh = new Date(now - 60_000).toISOString();
  const asset = (public_id: string, created_at: string) => ({
    public_id,
    created_at,
    resource_type: 'image',
    secure_url: `https://res.cloudinary.com/x/image/upload/v1/${public_id}.jpg`,
    bytes: 1,
  });

  const referenced = referencedPublicIds([
    'https://res.cloudinary.com/x/image/upload/v9/gnaath_communications/in-use.jpg',
    null,
    'https://images.unsplash.com/photo.jpg',
  ]);

  const orphans = findOrphans(
    [
      asset('gnaath_communications/in-use', old),
      asset('gnaath_communications/removed', old),
      asset('gnaath_communications/just-uploaded', fresh),
    ],
    referenced,
    now
  );
  assert.deepEqual(orphans.map((o) => o.public_id), ['gnaath_communications/removed']);
});
