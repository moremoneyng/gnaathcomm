import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidWebhookHash } from './webhook';

test('accepts an exact webhook hash', () => {
  assert.equal(isValidWebhookHash('secret-value', 'secret-value'), true);
});

test('rejects missing, different, and differently sized hashes without throwing', () => {
  assert.equal(isValidWebhookHash(null, 'secret-value'), false);
  assert.equal(isValidWebhookHash('wrong-value', 'secret-value'), false);
  assert.equal(isValidWebhookHash('x', 'a-much-longer-secret'), false);
});
