import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const heroSource = readFileSync(new URL('./HeroSection.tsx', import.meta.url), 'utf8');

test('homepage hero presents G Naath as an all-in-one modern marketplace', () => {
  assert.match(heroSource, /Everything Modern/);
  assert.match(heroSource, /All in One Place/);
  assert.match(heroSource, /Shop All Products/);
  assert.match(heroSource, /Explore Categories/);
  assert.match(heroSource, /Cars/);
  assert.match(heroSource, /Bikes/);
});
