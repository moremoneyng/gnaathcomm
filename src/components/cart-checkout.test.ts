import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./CartDrawer.tsx', import.meta.url), 'utf8');

test('cart routes all payments through secure Flutterwave checkout', () => {
  assert.match(source, /href="\/checkout"/);
  assert.match(source, /Secure Flutterwave Checkout/);
  assert.doesNotMatch(source, /Send Order to WhatsApp/);
  assert.doesNotMatch(source, /cash_on_delivery|bank_transfer|whatsapp_discuss/);
});
