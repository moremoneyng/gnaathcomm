import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const schema = readFileSync(new URL('./schema.prisma', import.meta.url), 'utf8');

test('orders store idempotent Flutterwave payment data', () => {
  assert.match(schema, /paymentReference\s+String\?\s+@unique/);
  assert.match(schema, /flutterwaveTransactionId\s+String\?\s+@unique/);
  assert.match(schema, /paymentMethod\s+String\?/);
  assert.match(schema, /paidAt\s+DateTime\?/);
  assert.match(schema, /paymentFailureReason\s+String\?/);
});
