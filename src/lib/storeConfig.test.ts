import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_STORE_CONFIG } from '../data/storeCatalog';
import { effectiveStoreConfig, parseStoreConfigInput } from './storeConfig';

test('a stale seeded row is ignored so the live site does not revert', () => {
  const stale = { ...DEFAULT_STORE_CONFIG, tagline: 'Old tagline', brands: ['Oraimo'], updatedAt: new Date('2026-08-31') };
  assert.deepEqual(effectiveStoreConfig(stale), DEFAULT_STORE_CONFIG);
  assert.deepEqual(effectiveStoreConfig(null), DEFAULT_STORE_CONFIG);
});

test('an admin-saved row is used, with the legacy logo path repaired', () => {
  const saved = {
    ...DEFAULT_STORE_CONFIG,
    bannerAnnouncement: 'Black Friday deals',
    logoUrl: '/gnaathcommlogo.png',
    updatedAt: new Date('2026-10-02'),
  };
  const config = effectiveStoreConfig(saved);
  assert.equal(config.bannerAnnouncement, 'Black Friday deals');
  assert.equal(config.logoUrl, DEFAULT_STORE_CONFIG.logoUrl);
});

test('settings input is validated and cleaned', () => {
  const ok = parseStoreConfigInput(
    { whatsappNumber: '+234 703 479 1996', brands: [' Apple ', 'Apple', 'JBL'], storeName: ' G Naath ' },
    DEFAULT_STORE_CONFIG
  );
  assert.ok(ok.ok);
  assert.equal(ok.config.whatsappNumber, '+2347034791996');
  assert.deepEqual(ok.config.brands, ['Apple', 'JBL']);
  assert.equal(ok.config.storeName, 'G Naath');
  assert.equal(ok.config.currencyCode, 'NGN');

  assert.equal(parseStoreConfigInput({ email: 'not-an-email' }, DEFAULT_STORE_CONFIG).ok, false);
  assert.equal(parseStoreConfigInput({ storeName: '   ' }, DEFAULT_STORE_CONFIG).ok, false);
  assert.equal(parseStoreConfigInput({ facebookUrl: 'javascript:alert(1)' }, DEFAULT_STORE_CONFIG).ok, false);
  assert.equal(parseStoreConfigInput({ logoUrl: 'javascript:alert(1)' }, DEFAULT_STORE_CONFIG).ok, false);
  assert.equal(parseStoreConfigInput({ brands: [] }, DEFAULT_STORE_CONFIG).ok, false);
});
