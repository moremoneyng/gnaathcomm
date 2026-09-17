import assert from 'node:assert/strict';
import test from 'node:test';
import { finalizePayment, type FinalizePaymentDependencies } from './finalizePayment';

function dependencies(overrides: Partial<FinalizePaymentDependencies> = {}) {
  const updates: unknown[] = [];
  const deps: FinalizePaymentDependencies = {
    findOrder: async () => ({
      id: 'order-id', orderNumber: 'GNG-1', totalAmount: 5000,
      paymentStatus: 'PENDING', flutterwaveTransactionId: null,
    }),
    verifyTransaction: async () => ({
      transactionId: '1234', txRef: 'GNG-FLW-1', amount: 5000,
      currency: 'NGN', paymentMethod: 'card', paidAt: new Date('2026-09-16T12:00:00Z'),
    }),
    markPaid: async (orderId, payment) => { updates.push({ orderId, payment }); },
    ...overrides,
  };
  return { deps, updates };
}

test('verifies and atomically marks a matching order paid', async () => {
  const { deps, updates } = dependencies();
  const result = await finalizePayment({ transactionId: '1234', txRef: 'GNG-FLW-1' }, deps);
  assert.deepEqual(result, { status: 'paid', orderNumber: 'GNG-1' });
  assert.equal(updates.length, 1);
  assert.equal((updates[0] as { payment: { transactionId: string } }).payment.transactionId, '1234');
});

test('returns an already-paid order without updating it twice', async () => {
  const { deps, updates } = dependencies({
    findOrder: async () => ({
      id: 'order-id', orderNumber: 'GNG-1', totalAmount: 5000,
      paymentStatus: 'PAID', flutterwaveTransactionId: '1234',
    }),
  });
  const result = await finalizePayment({ transactionId: '1234', txRef: 'GNG-FLW-1' }, deps);
  assert.equal(result.status, 'paid');
  assert.equal(updates.length, 0);
});

test('rejects a transaction conflict on an already-paid order', async () => {
  const { deps } = dependencies({
    findOrder: async () => ({
      id: 'order-id', orderNumber: 'GNG-1', totalAmount: 5000,
      paymentStatus: 'PAID', flutterwaveTransactionId: 'different',
    }),
  });
  const result = await finalizePayment({ transactionId: '1234', txRef: 'GNG-FLW-1' }, deps);
  assert.equal(result.status, 'invalid');
});

test('rejects unknown orders', async () => {
  const { deps } = dependencies({ findOrder: async () => null });
  const result = await finalizePayment({ transactionId: '1234', txRef: 'missing' }, deps);
  assert.deepEqual(result, { status: 'invalid', orderNumber: null });
});

test('keeps an order unpaid when provider verification fails', async () => {
  const { deps, updates } = dependencies({ verifyTransaction: async () => { throw new Error('mismatch'); } });
  const result = await finalizePayment({ transactionId: '1234', txRef: 'GNG-FLW-1' }, deps);
  assert.deepEqual(result, { status: 'invalid', orderNumber: 'GNG-1' });
  assert.equal(updates.length, 0);
});
