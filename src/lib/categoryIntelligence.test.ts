import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resolveCategoryIcon,
  slugifyCategoryName,
  suggestCategoryForProduct,
  suggestCategoryIcon,
} from './categoryIntelligence';

const categories = [
  { slug: 'smartphones', name: 'Mobile Phones', description: 'Original Apple, Samsung & Android smartphones' },
  { slug: 'accessories', name: 'Phone Accessories', description: 'Chargers, USB Cables, Power Banks & Cases' },
  { slug: 'audio', name: 'Audio & Speakers', description: 'JBL, Bose & Marshall speakers' },
  { slug: 'solar', name: 'Solar Energy', description: 'Panels, inverters and lithium batteries' },
  { slug: 'cars', name: 'Cars', description: '' },
  { slug: 'home-appliances', name: 'Home Appliances', description: '' },
];

test('category icons are picked from the category name', () => {
  assert.equal(suggestCategoryIcon('Mobile Phones'), 'Smartphone');
  assert.equal(suggestCategoryIcon('Solar Energy'), 'Sun');
  assert.equal(suggestCategoryIcon('Audio & Speakers'), 'Headphones');
  assert.equal(suggestCategoryIcon('Cars'), 'CarFront');
  assert.equal(suggestCategoryIcon('Bikes'), 'Bike');
  assert.equal(suggestCategoryIcon('Home Appliances'), 'Refrigerator');
  assert.equal(suggestCategoryIcon('Fashion & Lifestyle'), 'Shirt');
  assert.equal(suggestCategoryIcon('Gym/Health'), 'Dumbbell');
  assert.equal(suggestCategoryIcon('Tools'), 'Wrench');
  assert.equal(suggestCategoryIcon('Kids'), 'ToyBrick');
  assert.equal(suggestCategoryIcon('Lightening & Illumination'), 'Lightbulb');
  assert.equal(suggestCategoryIcon('Home Gadgets/Appliances'), 'Refrigerator');
  assert.equal(suggestCategoryIcon('Miscellaneous'), 'LayoutGrid');
});

test('an explicit admin icon always wins over the guess', () => {
  assert.equal(resolveCategoryIcon('Gift', 'Mobile Phones'), 'Gift');
  assert.equal(resolveCategoryIcon('LayoutGrid', 'Mobile Phones'), 'Smartphone');
  assert.equal(resolveCategoryIcon(null, 'Solar Energy'), 'Sun');
});

test('"car" does not match words that merely start with it', () => {
  assert.equal(suggestCategoryIcon('Cartridges and cards'), 'LayoutGrid');
});

test('products are matched to the most fitting existing category', () => {
  assert.equal(suggestCategoryForProduct({ name: 'iPhone 15 Pro Max 256GB' }, categories), 'smartphones');
  assert.equal(suggestCategoryForProduct({ name: 'JBL Flip 6 Bluetooth Speaker' }, categories), 'audio');
  assert.equal(suggestCategoryForProduct({ name: '5kVA Hybrid Inverter' }, categories), 'solar');
  assert.equal(suggestCategoryForProduct({ name: 'Romoss 30000mAh Power Bank' }, categories), 'accessories');
  assert.equal(suggestCategoryForProduct({ name: 'Toyota Camry 2018' }, categories), 'cars');
});

test('no suggestion is made when nothing fits', () => {
  assert.equal(suggestCategoryForProduct({ name: 'Mystery Box' }, categories), null);
  assert.equal(suggestCategoryForProduct({ name: '' }, categories), null);
});

test('category slugs are url-safe', () => {
  assert.equal(slugifyCategoryName('Audio & Speakers'), 'audio-and-speakers');
  assert.equal(slugifyCategoryName('  Smart Watches! '), 'smart-watches');
});
