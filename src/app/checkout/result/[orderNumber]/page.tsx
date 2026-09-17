import Link from 'next/link';
import { CheckCircle2, Clock3, MessageCircle, XCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ClearPaidCart } from './ClearPaidCart';

export const dynamic = 'force-dynamic';

export default async function CheckoutResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ state?: string }>;
}) {
  const [{ orderNumber }, query] = await Promise.all([params, searchParams]);
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { orderNumber: true, totalAmount: true, paymentStatus: true },
  });
  if (!order) notFound();

  const paid = order.paymentStatus === 'PAID';
  const cancelled = query.state === 'cancelled';
  const title = paid ? 'Payment confirmed' : cancelled ? 'Payment not completed' : 'Payment pending';
  const Icon = paid ? CheckCircle2 : cancelled ? XCircle : Clock3;
  const color = paid ? 'text-emerald-600' : cancelled ? 'text-rose-600' : 'text-amber-600';

  return (
    <main className="min-h-[75vh] bg-[#f7f6f1] px-4 py-20">
      <ClearPaidCart paid={paid} />
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-12">
        <Icon className={`mx-auto h-16 w-16 ${color}`} />
        <h1 className="mt-6 text-3xl font-black text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {paid
            ? 'Your payment has been verified and your order is now being processed.'
            : cancelled
              ? 'No payment was confirmed. Your cart is still available when you are ready.'
              : 'We have not confirmed this payment yet. Bank transfers can take a short time to settle.'}
        </p>
        <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-slate-50 p-5 text-left text-sm">
          <div className="flex justify-between gap-4"><span className="text-slate-500">Order</span><strong>{order.orderNumber}</strong></div>
          <div className="mt-3 flex justify-between gap-4"><span className="text-slate-500">Amount</span><strong>₦{order.totalAmount.toLocaleString()}</strong></div>
          <div className="mt-3 flex justify-between gap-4"><span className="text-slate-500">Status</span><strong>{order.paymentStatus}</strong></div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {!paid && <Link href="/checkout" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Try payment again</Link>}
          <Link href="/shop" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-bold text-slate-800">Continue shopping</Link>
          <a href={`https://wa.me/2347034791996?text=${encodeURIComponent(`Hello G Naath, I need help with order ${order.orderNumber}.`)}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-800">
            <MessageCircle className="h-4 w-4" /> WhatsApp support
          </a>
        </div>
      </div>
    </main>
  );
}
