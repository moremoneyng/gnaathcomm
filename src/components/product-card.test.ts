import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const productCardSource = readFileSync(new URL('./ProductCard.tsx', import.meta.url), 'utf8');
const productModalSource = readFileSync(new URL('./ProductModal.tsx', import.meta.url), 'utf8');

test('ProductCard links ordering to checkout and not WhatsApp', () => {
  assert.doesNotMatch(productCardSource, /generateSingleProductWhatsAppUrl/);
  assert.doesNotMatch(productCardSource, /handleDirectWhatsAppOrder/);
  assert.match(productCardSource, /\/checkout/);
});

test('ProductModal links ordering to checkout and not WhatsApp', () => {
  assert.doesNotMatch(productModalSource, /generateSingleProductWhatsAppUrl/);
  assert.doesNotMatch(productModalSource, /Order via WhatsApp/);
  assert.match(productModalSource, /\/checkout/);
});

