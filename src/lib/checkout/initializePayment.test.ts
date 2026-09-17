import assert from 'node:assert/strict';
import test from 'node:test';
import {
  initializePayment,
  type InitializePaymentDependencies,
  type PendingOrderInput,
} from './initializePayment';
import type { FlutterwavePaymentInput } from '@/lib/flutterwave/types';

const customer = {
  name: 'Ada Buyer', email: 'ada@example.com', phone: '08000000000',
  address: '12 Market Road', city: 'Lagos', preferredBranch: 'lagos_head_office' as const,
  deliveryNotes: '',
};

function dependencies(overrides: Partial<InitializePaymentDependencies> = {}) {
  const calls: {
    created: PendingOrderInput[];
    failed: Array<[string, string]>;
    payment: FlutterwavePaymentInput[];
  } = { created: [], failed: [], payment: [] };
  const deps: InitializePaymentDependencies = {
    loadProducts: async () => [{ id: 'p1', name: 'Phone', price: 50000, inStock: true }],
    createOrder: async (input) => {
      calls.created.push(input);
      return { id: 'order-id', orderNumber: 'GNG-ORDER-1' };
    },
    markInitializationFailed: async (...args) => { calls.failed.push(args); },
    createPayment: async (input) => {
      calls.payment.push(input);
      return { link: 'https://checkout.flutterwave.com/pay/example' };
    },
    createReference: () => 'GNG-FLW-TEST',
    appUrl: 'https://shop.example.com',
    ...overrides,
  };
  return { deps, calls };
}

test('creates a pending order using the database total', async () => {
  const { deps, calls } = dependencies();
  const result = await initializePayment({
    customer, cart: [{ productId: 'p1', quantity: 2 }], userId: null,
  }, deps);

  assert.equal(calls.created[0].totalAmount, 100000);
  assert.equal(calls.created[0].paymentPreference, 'flutterwave');
  assert.equal(calls.created[0].paymentReference, 'GNG-FLW-TEST');
  assert.equal(calls.payment[0].redirectUrl, 'https://shop.example.com/api/payments/flutterwave/callback');
  assert.deepEqual(result, {
    checkoutUrl: 'https://checkout.flutterwave.com/pay/example',
    orderNumber: 'GNG-ORDER-1',
    paymentReference: 'GNG-FLW-TEST',
  });
});

test('requires a valid email address', async () => {
  const { deps } = dependencies();
  await assert.rejects(
    initializePayment({ customer: { ...customer, email: '' }, cart: [{ productId: 'p1', quantity: 1 }] }, deps),
    /valid email address/,
  );
});

test('marks the order failed when provider initialization fails', async () => {
  const { deps, calls } = dependencies({ createPayment: async () => { throw new Error('provider down'); } });
  await assert.rejects(
    initializePayment({ customer, cart: [{ productId: 'p1', quantity: 1 }] }, deps),
    /Unable to start payment/,
  );
  assert.deepEqual(calls.failed, [['order-id', 'Payment initialization failed']]);
});
