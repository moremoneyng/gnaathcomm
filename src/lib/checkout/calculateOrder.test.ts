import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateOrder, CheckoutValidationError } from './calculateOrder';

const products = [
  { id: 'p1', name: 'Phone', price: 50000, inStock: true },
  { id: 'p2', name: 'Speaker', price: 12500.5, inStock: true },
  { id: 'p3', name: 'Sold out', price: 1000, inStock: false },
];

test('calculates totals from database products', () => {
  const result = calculateOrder(
    [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1, selectedOptions: { color: 'Black' } },
    ],
    products,
  );

  assert.equal(result.totalAmount, 112500.5);
  assert.deepEqual(result.items[0], {
    productId: 'p1', productName: 'Phone', price: 50000, quantity: 2, selectedOptions: {},
  });
});

for (const [name, cart, message] of [
  ['empty carts', [], 'Your cart is empty.'],
  ['invalid quantities', [{ productId: 'p1', quantity: 21 }], 'Choose a quantity between 1 and 20.'],
  ['duplicate products', [{ productId: 'p1', quantity: 1 }, { productId: 'p1', quantity: 1 }], 'Your cart contains duplicate products.'],
  ['missing products', [{ productId: 'missing', quantity: 1 }], 'A product in your cart is no longer available.'],
  ['out-of-stock products', [{ productId: 'p3', quantity: 1 }], 'Sold out is currently out of stock.'],
] as const) {
  test(`rejects ${name}`, () => {
    assert.throws(() => calculateOrder([...cart], products), (error: unknown) =>
      error instanceof CheckoutValidationError && error.message === message,
    );
  });
}

test('respects tracked stock quantities', () => {
  const tracked = [
    { id: 't1', name: 'Power Bank', price: 20000, inStock: true, stockQuantity: 2 },
    { id: 't2', name: 'Earbuds', price: 9000, inStock: true, stockQuantity: 0 },
  ];
  assert.equal(calculateOrder([{ productId: 't1', quantity: 2 }], tracked).totalAmount, 40000);
  assert.throws(() => calculateOrder([{ productId: 't1', quantity: 3 }], tracked), /Only 2 of Power Bank left/);
  assert.throws(() => calculateOrder([{ productId: 't2', quantity: 1 }], tracked), /out of stock/);
});

test('pre-orders are orderable regardless of stock and are labelled on the order', () => {
  const result = calculateOrder(
    [{ productId: 'pre', quantity: 5, selectedOptions: { 'Pre-order': 'spoofed', Color: 'Blue' } }],
    [{ id: 'pre', name: 'Galaxy S27', price: 1000, inStock: true, stockQuantity: 0, isPreorder: true, preorderNote: 'Ships in 3 weeks' }],
  );
  assert.equal(result.items[0].productName, 'Galaxy S27 (Pre-order)');
  assert.deepEqual(result.items[0].selectedOptions, { Color: 'Blue', 'Pre-order': 'Ships in 3 weeks' });

  assert.throws(
    () => calculateOrder([{ productId: 'pre', quantity: 1 }], [{ id: 'pre', name: 'Closed', price: 1, inStock: false, isPreorder: true }]),
    /out of stock/,
  );
});
