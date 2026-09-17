import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserSession } from '@/lib/userAuth';
import { createFlutterwavePayment } from '@/lib/flutterwave/client';
import { createPaymentReference, initializePayment, type CheckoutCustomer } from '@/lib/checkout/initializePayment';
import type { CheckoutCartInput } from '@/lib/checkout/calculateOrder';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { customer?: CheckoutCustomer; cart?: CheckoutCartInput[] };
    if (!body.customer || !Array.isArray(body.cart)) {
      return NextResponse.json({ success: false, error: 'Invalid checkout request.' }, { status: 400 });
    }
    const session = await getUserSession();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const result = await initializePayment({
      customer: body.customer,
      cart: body.cart,
      userId: session?.id || null,
    }, {
      appUrl,
      createReference: createPaymentReference,
      createPayment: createFlutterwavePayment,
      loadProducts: (ids) => prisma.product.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, price: true, inStock: true },
      }),
      createOrder: (input) => prisma.order.create({
        data: {
          orderNumber: input.orderNumber,
          ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
          customerName: input.customer.name,
          customerEmail: input.customer.email,
          customerPhone: input.customer.phone,
          customerAddress: input.customer.address,
          customerCity: input.customer.city,
          preferredBranch: input.customer.preferredBranch,
          deliveryNotes: input.customer.deliveryNotes || '',
          paymentPreference: 'flutterwave',
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
          paymentReference: input.paymentReference,
          totalAmount: input.totalAmount,
          items: { create: input.items.map((item) => ({
            ...item,
            selectedOptions: item.selectedOptions as Prisma.InputJsonValue,
          })) },
        },
        select: { id: true, orderNumber: true },
      }),
      markInitializationFailed: async (orderId, reason) => {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'FAILED', paymentFailureReason: reason },
        });
      },
    });
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to start checkout.';
    const status = /required|valid|cart|quantity|available|stock/i.test(message) ? 400 : 502;
    console.error('Flutterwave checkout initialization failed:', message);
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
