import { NextResponse } from 'next/server';
import { finalizeStoredPayment } from '@/lib/flutterwave/finalizePayment';
import { isValidWebhookHash } from '@/lib/flutterwave/webhook';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isValidWebhookHash(request.headers.get('verif-hash'), process.env.FLUTTERWAVE_WEBHOOK_SECRET)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const event = body.event || body.type;
  if (event !== 'charge.completed') return NextResponse.json({ success: true });

  const data = body.data as Record<string, unknown> | undefined;
  const transactionId = data?.id ? String(data.id) : '';
  const txRef = typeof data?.tx_ref === 'string' ? data.tx_ref : '';
  if (!transactionId || !txRef) return NextResponse.json({ success: true });

  await finalizeStoredPayment({ transactionId, txRef });
  return NextResponse.json({ success: true });
}
