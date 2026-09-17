import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createFlutterwavePayment,
  verifyFlutterwaveTransaction,
  FlutterwaveVerificationError,
} from './client';

const originalSecret = process.env.FLUTTERWAVE_SECRET_KEY;
process.env.FLUTTERWAVE_SECRET_KEY = 'test-secret';

test.after(() => {
  if (originalSecret === undefined) delete process.env.FLUTTERWAVE_SECRET_KEY;
  else process.env.FLUTTERWAVE_SECRET_KEY = originalSecret;
});

test('creates hosted checkout with supported Nigerian payment methods', async () => {
  let request: { url?: string; init?: RequestInit } = {};
  const fakeFetch: typeof fetch = async (url, init) => {
    request = { url: String(url), init };
    return Response.json({ status: 'success', data: { link: 'https://checkout.flutterwave.com/pay/example' } });
  };

  const result = await createFlutterwavePayment({
    txRef: 'GNG-FLW-1', amount: 5000, currency: 'NGN',
    redirectUrl: 'https://example.com/callback',
    customer: { email: 'buyer@example.com', name: 'Buyer', phone: '08000000000' },
    orderNumber: 'GNG-1',
  }, fakeFetch);

  assert.equal(result.link, 'https://checkout.flutterwave.com/pay/example');
  assert.equal(request.url, 'https://api.flutterwave.com/v3/payments');
  assert.equal(new Headers(request.init?.headers).get('authorization'), 'Bearer test-secret');
  const body = JSON.parse(String(request.init?.body));
  assert.equal(body.payment_options, 'card,banktransfer,ussd');
  assert.equal(JSON.stringify(body).includes('test-secret'), false);
});

const verificationPayload = (overrides: Record<string, unknown> = {}) => ({
  status: 'success',
  data: {
    id: 1234,
    tx_ref: 'GNG-FLW-1',
    amount: 5000,
    currency: 'NGN',
    status: 'successful',
    payment_type: 'card',
    created_at: '2026-09-16T12:00:00.000Z',
    ...overrides,
  },
});

test('accepts a verified matching transaction', async () => {
  const result = await verifyFlutterwaveTransaction('1234', {
    txRef: 'GNG-FLW-1', amount: 5000, currency: 'NGN',
  }, async () => Response.json(verificationPayload()));

  assert.equal(result.transactionId, '1234');
  assert.equal(result.paymentMethod, 'card');
});

for (const [name, overrides] of [
  ['status', { status: 'failed' }],
  ['currency', { currency: 'USD' }],
  ['reference', { tx_ref: 'WRONG' }],
  ['amount', { amount: 4999 }],
] as const) {
  test(`rejects mismatched ${name}`, async () => {
    await assert.rejects(
      verifyFlutterwaveTransaction('1234', {
        txRef: 'GNG-FLW-1', amount: 5000, currency: 'NGN',
      }, async () => Response.json(verificationPayload(overrides))),
      FlutterwaveVerificationError,
    );
  });
}
