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
