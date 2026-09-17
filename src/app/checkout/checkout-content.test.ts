import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const form = readFileSync(new URL('./CheckoutForm.tsx', import.meta.url), 'utf8');
const result = readFileSync(new URL('./result/[orderNumber]/page.tsx', import.meta.url), 'utf8');

test('checkout requires delivery and payment contact details', () => {
  assert.match(form, /type="email"/);
  assert.match(form, /type="tel"/);
  assert.match(form, /name="address"/);
  assert.match(form, /Pay securely with Flutterwave/);
  assert.match(form, /Order Summary/);
  assert.doesNotMatch(form, /cash_on_delivery|bank_transfer|whatsapp_discuss/);
});

test('result page covers verified and incomplete payment states', () => {
  assert.match(result, /Payment confirmed/);
  assert.match(result, /Payment pending/);
  assert.match(result, /Payment not completed/);
  assert.match(result, /Try payment again/);
  assert.match(result, /WhatsApp support/);
});
