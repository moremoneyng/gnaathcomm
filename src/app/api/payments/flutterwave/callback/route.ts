import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { finalizeStoredPayment } from '@/lib/flutterwave/finalizePayment';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const transactionId = url.searchParams.get('transaction_id');
  const txRef = url.searchParams.get('tx_ref');
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || url.origin).replace(/\/$/, '');

  if (!txRef) return NextResponse.redirect(`${appUrl}/checkout?payment=invalid`);

  if (status !== 'successful' || !transactionId) {
    const order = await prisma.order.findUnique({
      where: { paymentReference: txRef },
      select: { orderNumber: true },
    });
    if (!order) return NextResponse.redirect(`${appUrl}/checkout?payment=invalid`);
    const state = status === 'cancelled' ? 'cancelled' : 'pending';
    return NextResponse.redirect(`${appUrl}/checkout/result/${order.orderNumber}?state=${state}`);
  }

  const result = await finalizeStoredPayment({ transactionId, txRef });
  if (!result.orderNumber) return NextResponse.redirect(`${appUrl}/checkout?payment=invalid`);
  return NextResponse.redirect(`${appUrl}/checkout/result/${result.orderNumber}?state=${result.status}`);
}
