import { prisma } from '@/lib/prisma';
import { sendAdminOrderNotification, sendOrderReceiptEmail } from '@/lib/email';
import { verifyFlutterwaveTransaction } from './client';
import type { ExpectedPayment, VerifiedPayment } from './types';

export interface StoredPaymentOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  flutterwaveTransactionId: string | null;
}

export interface FinalizePaymentDependencies {
  findOrder(txRef: string): Promise<StoredPaymentOrder | null>;
  verifyTransaction(transactionId: string, expected: ExpectedPayment): Promise<VerifiedPayment>;
  markPaid(orderId: string, payment: VerifiedPayment): Promise<void>;
}

export interface PaymentResult {
  status: 'paid' | 'invalid';
  orderNumber: string | null;
}

export async function finalizePayment(
  input: { transactionId: string; txRef: string },
  dependencies: FinalizePaymentDependencies,
): Promise<PaymentResult> {
  const order = await dependencies.findOrder(input.txRef);
  if (!order) return { status: 'invalid', orderNumber: null };

  if (order.paymentStatus === 'PAID') {
    return order.flutterwaveTransactionId === input.transactionId
      ? { status: 'paid', orderNumber: order.orderNumber }
      : { status: 'invalid', orderNumber: order.orderNumber };
  }

  let payment: VerifiedPayment;
  try {
    payment = await dependencies.verifyTransaction(input.transactionId, {
      txRef: input.txRef,
      amount: order.totalAmount,
      currency: 'NGN',
    });
  } catch {
    return { status: 'invalid', orderNumber: order.orderNumber };
  }

  await dependencies.markPaid(order.id, payment);
  return { status: 'paid', orderNumber: order.orderNumber };
}

export async function finalizeStoredPayment(input: { transactionId: string; txRef: string }) {
  return finalizePayment(input, {
    findOrder: (txRef) => prisma.order.findUnique({
      where: { paymentReference: txRef },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        paymentStatus: true,
        flutterwaveTransactionId: true,
      },
    }),
    verifyTransaction: verifyFlutterwaveTransaction,
    markPaid: async (orderId, payment) => {
      const result = await prisma.order.updateMany({
        where: {
          id: orderId,
          paymentStatus: { not: 'PAID' },
          OR: [
            { flutterwaveTransactionId: null },
            { flutterwaveTransactionId: payment.transactionId },
          ],
        },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'PROCESSING',
          flutterwaveTransactionId: payment.transactionId,
          paymentMethod: payment.paymentMethod,
          paidAt: payment.paidAt,
          paymentFailureReason: null,
        },
      });

      if (result.count === 0) {
        const current = await prisma.order.findUnique({
          where: { id: orderId },
          select: { paymentStatus: true, flutterwaveTransactionId: true },
        });
        if (current?.paymentStatus === 'PAID' && current.flutterwaveTransactionId === payment.transactionId) {
          return;
        }
        throw new Error('Order payment state changed before it could be finalized.');
      }

      const paidOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (paidOrder) {
        await Promise.allSettled([
          paidOrder.customerEmail
            ? sendOrderReceiptEmail(paidOrder.customerEmail, paidOrder.customerName, paidOrder)
            : Promise.resolve(),
          sendAdminOrderNotification(paidOrder),
        ]);
      }
    },
  });
}
