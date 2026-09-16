import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_STORE_CONFIG } from './storeCatalog';

test('the storefront only advertises brands the business sells', () => {
  assert.deepEqual(DEFAULT_STORE_CONFIG.brands, [
    'Apple',
    'Samsung',
    'JBL',
    'Anker',
    'Green Lion',
    'Bose',
    'Porodo',
    'Lepresso',
    'Romoss',
    'Marshall',
    'New Age',
  ]);
});
