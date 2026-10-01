import assert from 'node:assert/strict';
import test from 'node:test';

import { MAX_PRODUCT_IMAGES, parseProductInput, productAvailability } from './productInput';

const cover = 'https://res.cloudinary.com/demo/image/upload/a.jpg';
const second = 'https://res.cloudinary.com/demo/image/upload/b.jpg';

test('create requires name, category, price and an image', () => {
  assert.equal(parseProductInput({}, 'create').ok, false);
  assert.equal(parseProductInput({ name: 'Phone', category: 'smartphones', price: 0, images: [cover] }, 'create').ok, false);
  assert.equal(parseProductInput({ name: 'Phone', category: 'smartphones', price: 10, images: [] }, 'create').ok, false);

  const parsed = parseProductInput({ name: ' Phone ', category: 'smartphones', price: '1500', images: [cover] }, 'create');
  assert.ok(parsed.ok);
  assert.equal(parsed.data.name, 'Phone');
  assert.equal(parsed.data.price, 1500);
  assert.equal(parsed.data.brand, 'G Naath Global');
  assert.equal(parsed.data.inStock, true);
  assert.equal(parsed.categorySlug, 'smartphones');
});

test('the first image becomes the cover and duplicates are dropped', () => {
  const parsed = parseProductInput({ images: [second, cover, second] }, 'update');
  assert.ok(parsed.ok);
  assert.deepEqual(parsed.data.images, [second, cover]);
  assert.equal(parsed.data.image, second);
});

test('removing a wrong image on update keeps the rest of the product untouched', () => {
  const parsed = parseProductInput({ images: [cover] }, 'update');
  assert.ok(parsed.ok);
  assert.deepEqual(Object.keys(parsed.data).sort(), ['image', 'images']);
});

test('an update cannot remove every image', () => {
  assert.equal(parseProductInput({ images: [] }, 'update').ok, false);
});

test('unsafe or malformed media urls are rejected', () => {
  const parsed = parseProductInput({ images: ['javascript:alert(1)', 'data:image/png;base64,AA', cover] }, 'update');
  assert.ok(parsed.ok);
  assert.deepEqual(parsed.data.images, [cover]);

  const video = parseProductInput({ video: 'javascript:alert(1)' }, 'update');
  assert.ok(video.ok);
  assert.equal(video.data.video, null);
});

test('image count is capped', () => {
  const images = Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, i) => `https://cdn.example.com/${i}.jpg`);
  assert.equal(parseProductInput({ images }, 'update').ok, false);
});

test('quick stock toggles only change the stock flag', () => {
  const parsed = parseProductInput({ inStock: false }, 'update');
  assert.ok(parsed.ok);
  assert.deepEqual(parsed.data, { inStock: false });
});

test('features, badge and options are cleaned', () => {
  const parsed = parseProductInput(
    {
      features: '  5000mAh battery \n\n 120Hz display ',
      badge: '   ',
      options: [{ name: 'Color', values: ['Black', 'Black', ' Blue '] }, { name: '', values: ['x'] }],
      originalPrice: '',
    },
    'update'
  );
  assert.ok(parsed.ok);
  assert.deepEqual(parsed.data.features, ['5000mAh battery', '120Hz display']);
  assert.equal(parsed.data.badge, null);
  assert.deepEqual(parsed.data.options, [{ name: 'Color', values: ['Black', 'Blue'] }]);
  assert.equal(parsed.data.originalPrice, null);
});

test('a tracked stock quantity drives availability', () => {
  const restock = parseProductInput({ stockQuantity: '12', inStock: false }, 'update');
  assert.ok(restock.ok);
  assert.deepEqual(restock.data, { inStock: true, stockQuantity: 12 });

  const soldOut = parseProductInput({ stockQuantity: 0 }, 'update');
  assert.ok(soldOut.ok);
  assert.deepEqual(soldOut.data, { inStock: false, stockQuantity: 0 });

  const untracked = parseProductInput({ stockQuantity: '' }, 'update');
  assert.ok(untracked.ok);
  assert.deepEqual(untracked.data, { stockQuantity: null });

  assert.equal(parseProductInput({ stockQuantity: -1 }, 'update').ok, false);
  assert.equal(parseProductInput({ stockQuantity: 2.5 }, 'update').ok, false);
});

test('admins choose Available, Pre-order or Out of stock', () => {
  const preorder = parseProductInput({ availability: 'preorder', preorderNote: ' Ships in 2 weeks ' }, 'update');
  assert.ok(preorder.ok);
  assert.deepEqual(preorder.data, { isPreorder: true, inStock: true, preorderNote: 'Ships in 2 weeks' });

  const out = parseProductInput({ availability: 'out_of_stock' }, 'update');
  assert.ok(out.ok);
  assert.deepEqual(out.data, { isPreorder: false, inStock: false });

  const available = parseProductInput({ availability: 'available' }, 'update');
  assert.ok(available.ok);
  assert.deepEqual(available.data, { isPreorder: false, inStock: true });

  // A tracked product with 0 units can't be "available" until it is restocked.
  const empty = parseProductInput({ availability: 'available', stockQuantity: 0 }, 'update');
  assert.ok(empty.ok);
  assert.equal(empty.data.inStock, false);

  assert.equal(parseProductInput({ availability: 'maybe' }, 'update').ok, false);

  const created = parseProductInput({ name: 'X', category: 'c', price: 1, images: ['https://a.com/x.jpg'] }, 'create');
  assert.ok(created.ok);
  assert.equal(created.data.isPreorder, false);
});

test('one shopper-facing status comes from the stored flags', () => {
  assert.equal(productAvailability({ inStock: true }), 'available');
  assert.equal(productAvailability({ inStock: true, isPreorder: true }), 'preorder');
  assert.equal(productAvailability({ inStock: false, isPreorder: true }), 'out_of_stock');
});
