import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSalesReport, lagosDayKey, type ReportOrder } from './salesReport';

const now = new Date('2026-10-01T15:00:00Z');
const order = (overrides: Partial<ReportOrder>): ReportOrder => ({
  id: Math.random().toString(36),
  orderNumber: 'GNG-1',
  customerName: 'Ada',
  totalAmount: 1000,
  paymentStatus: 'PENDING',
  orderStatus: 'PENDING',
  preferredBranch: 'lagos_head_office',
  createdAt: now,
  items: [{ productId: 'p1', productName: 'Phone', price: 1000, quantity: 1 }],
  ...overrides,
});

test('revenue counts paid orders only; unpaid checkouts are "awaiting payment"', () => {
  const report = buildSalesReport(
    [
      order({ paymentStatus: 'PAID', totalAmount: 5000, paidAt: now }),
      order({ paymentStatus: 'PENDING', totalAmount: 100_000_000 }),
      order({ paymentStatus: 'FAILED', totalAmount: 900 }),
      order({ paymentStatus: 'PENDING', orderStatus: 'CANCELLED', totalAmount: 700 }),
    ],
    now
  );
  assert.equal(report.paidRevenue, 5000);
  assert.equal(report.paidOrders, 1);
  assert.equal(report.awaitingPaymentRevenue, 100_000_000);
  assert.equal(report.awaitingPaymentOrders, 1);
  assert.equal(report.totalOrders, 4);
  assert.equal(report.averageOrderValue, 5000);
});

test('daily revenue covers every day in the window, bucketed in Lagos time', () => {
  // 23:30 UTC on 30 Sep is 00:30 on 1 Oct in Lagos.
  const lateNight = new Date('2026-09-30T23:30:00Z');
  assert.equal(lagosDayKey(lateNight), '2026-10-01');

  const report = buildSalesReport([order({ paymentStatus: 'PAID', totalAmount: 2500, paidAt: lateNight })], now, 7);
  assert.equal(report.dailyRevenue.length, 7);
  assert.equal(report.dailyRevenue.at(-1)?.date, '2026-10-01');
  assert.equal(report.dailyRevenue.at(-1)?.revenue, 2500);
  assert.equal(report.windowRevenue, 2500);
});

test('top products and branch figures use paid orders', () => {
  const report = buildSalesReport(
    [
      order({ paymentStatus: 'PAID', paidAt: now, items: [{ productId: 'a', productName: 'Speaker', price: 300, quantity: 3 }], totalAmount: 900 }),
      order({ paymentStatus: 'PAID', paidAt: now, preferredBranch: 'abia_branch_office', items: [{ productId: 'b', productName: 'Phone', price: 2000, quantity: 1 }], totalAmount: 2000 }),
      order({ items: [{ productId: 'c', productName: 'Unpaid TV', price: 99999, quantity: 1 }] }),
    ],
    now
  );
  assert.deepEqual(report.topProducts.map((p) => p.name), ['Phone', 'Speaker']);
  assert.equal(report.branches.lagos.paidRevenue, 900);
  assert.equal(report.branches.lagos.totalOrders, 2);
  assert.equal(report.branches.abia.paidRevenue, 2000);
});
