import { randomUUID } from 'node:crypto';
import { calculateOrder, type CalculatedOrderItem, type CheckoutCartInput, type CheckoutProduct } from './calculateOrder';
import type { FlutterwavePaymentInput } from '@/lib/flutterwave/types';

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  preferredBranch: 'lagos_head_office' | 'abia_branch_office';
  deliveryNotes?: string;
}

export interface PendingOrderInput {
  orderNumber: string;
  userId?: string | null;
  customer: CheckoutCustomer;
  items: CalculatedOrderItem[];
  totalAmount: number;
  paymentPreference: 'flutterwave';
  paymentReference: string;
}

export interface InitializePaymentDependencies {
  loadProducts(ids: string[]): Promise<CheckoutProduct[]>;
  createOrder(input: PendingOrderInput): Promise<{ id: string; orderNumber: string }>;
  markInitializationFailed(orderId: string, reason: string): Promise<void>;
  createPayment(input: FlutterwavePaymentInput): Promise<{ link: string }>;
  createReference(): string;
  appUrl: string;
}

export interface InitializePaymentInput {
  customer: CheckoutCustomer;
  cart: CheckoutCartInput[];
  userId?: string | null;
}

function validateCustomer(customer: CheckoutCustomer) {
  if (!customer?.name?.trim() || !customer?.phone?.trim() || !customer?.address?.trim()) {
    throw new Error('Name, phone number, and delivery address are required.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email?.trim() || '')) {
    throw new Error('Please provide a valid email address.');
  }
}

export async function initializePayment(
  input: InitializePaymentInput,
  dependencies: InitializePaymentDependencies,
) {
  validateCustomer(input.customer);
  const products = await dependencies.loadProducts(input.cart.map((item) => item.productId));
  const calculated = calculateOrder(input.cart, products);
  const paymentReference = dependencies.createReference();
  const orderNumber = `GNG-${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`;

  const order = await dependencies.createOrder({
    orderNumber,
    userId: input.userId,
    customer: {
      ...input.customer,
      name: input.customer.name.trim(),
      email: input.customer.email.trim().toLowerCase(),
      phone: input.customer.phone.trim(),
      address: input.customer.address.trim(),
      city: input.customer.city?.trim() || 'Lagos',
    },
    items: calculated.items,
    totalAmount: calculated.totalAmount,
    paymentPreference: 'flutterwave',
    paymentReference,
  });

  try {
    const payment = await dependencies.createPayment({
      txRef: paymentReference,
      amount: calculated.totalAmount,
      currency: 'NGN',
      redirectUrl: `${dependencies.appUrl.replace(/\/$/, '')}/api/payments/flutterwave/callback`,
      orderNumber: order.orderNumber,
      customer: {
        email: input.customer.email.trim().toLowerCase(),
        name: input.customer.name.trim(),
        phone: input.customer.phone.trim(),
      },
    });
    return { checkoutUrl: payment.link, orderNumber: order.orderNumber, paymentReference };
  } catch {
    await dependencies.markInitializationFailed(order.id, 'Payment initialization failed');
    throw new Error('Unable to start payment. Please try again.');
  }
}

export function createPaymentReference() {
  return `GNG-FLW-${Date.now()}-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
}
