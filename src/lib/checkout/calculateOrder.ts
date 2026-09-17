export interface CheckoutCartInput {
  productId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface CheckoutProduct {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

export interface CalculatedOrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export interface CalculatedOrder {
  items: CalculatedOrderItem[];
  totalAmount: number;
}

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckoutValidationError';
  }
}

export function calculateOrder(
  cart: CheckoutCartInput[],
  products: CheckoutProduct[],
): CalculatedOrder {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw new CheckoutValidationError('Your cart is empty.');
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const seen = new Set<string>();
  let totalKobo = 0;

  const items = cart.map((entry) => {
    if (!entry.productId || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 20) {
      throw new CheckoutValidationError('Choose a quantity between 1 and 20.');
    }
    if (seen.has(entry.productId)) {
      throw new CheckoutValidationError('Your cart contains duplicate products.');
    }
    seen.add(entry.productId);

    const product = productMap.get(entry.productId);
    if (!product) {
      throw new CheckoutValidationError('A product in your cart is no longer available.');
    }
    if (!product.inStock) {
      throw new CheckoutValidationError(`${product.name} is currently out of stock.`);
    }

    const priceKobo = Math.round(product.price * 100);
    totalKobo += priceKobo * entry.quantity;

    return {
      productId: product.id,
      productName: product.name,
      price: priceKobo / 100,
      quantity: entry.quantity,
      selectedOptions: entry.selectedOptions || {},
    };
  });

  return { items, totalAmount: totalKobo / 100 };
}
