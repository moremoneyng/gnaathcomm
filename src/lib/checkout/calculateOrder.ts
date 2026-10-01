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
  /** Units on hand when tracked; null/undefined means not tracked. */
  stockQuantity?: number | null;
  isPreorder?: boolean;
  preorderNote?: string | null;
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
    if (!product.inStock || (!product.isPreorder && product.stockQuantity === 0)) {
      throw new CheckoutValidationError(`${product.name} is currently out of stock.`);
    }
    if (!product.isPreorder && typeof product.stockQuantity === 'number' && entry.quantity > product.stockQuantity) {
      throw new CheckoutValidationError(
        `Only ${product.stockQuantity} of ${product.name} left in stock. Please reduce the quantity.`,
      );
    }

    const priceKobo = Math.round(product.price * 100);
    totalKobo += priceKobo * entry.quantity;

    // Pre-orders are marked on the order itself (name and options) so receipts, emails and
    // the admin dashboard all show it, using the server's data rather than the browser's.
    const selectedOptions = { ...(entry.selectedOptions || {}) };
    delete selectedOptions['Pre-order'];
    if (product.isPreorder) selectedOptions['Pre-order'] = product.preorderNote?.trim() || 'Ships when available';

    return {
      productId: product.id,
      productName: product.isPreorder ? `${product.name} (Pre-order)` : product.name,
      price: priceKobo / 100,
      quantity: entry.quantity,
      selectedOptions,
    };
  });

  return { items, totalAmount: totalKobo / 100 };
}
