import type { ExpectedPayment, FlutterwavePaymentInput, VerifiedPayment } from './types';

const API_BASE = 'https://api.flutterwave.com/v3';

export class FlutterwaveConfigurationError extends Error {}
export class FlutterwaveRequestError extends Error {}
export class FlutterwaveVerificationError extends Error {}

interface FlutterwaveApiPayload {
  status?: string;
  data?: {
    link?: string;
    id?: string | number;
    tx_ref?: string;
    amount?: number;
    currency?: string;
    status?: string;
    payment_type?: string;
    created_at?: string;
  };
}

function secretKey() {
  const value = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!value) throw new FlutterwaveConfigurationError('Flutterwave is not configured.');
  return value;
}

async function flutterwaveRequest(
  path: string,
  init: RequestInit,
  fetchImpl: typeof fetch,
) {
  let response: Response;
  try {
    response = await fetchImpl(`${API_BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  } catch {
    throw new FlutterwaveRequestError('Unable to reach the payment provider.');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new FlutterwaveRequestError('The payment provider returned an invalid response.');
  }

  if (!response.ok) {
    throw new FlutterwaveRequestError('The payment provider rejected the request.');
  }
  return payload as FlutterwaveApiPayload;
}

export async function createFlutterwavePayment(
  input: FlutterwavePaymentInput,
  fetchImpl: typeof fetch = fetch,
): Promise<{ link: string }> {
  const payload = await flutterwaveRequest('/payments', {
    method: 'POST',
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amount,
      currency: input.currency,
      redirect_url: input.redirectUrl,
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: input.customer.email,
        phonenumber: input.customer.phone,
        name: input.customer.name,
      },
      customizations: {
        title: 'G Naath Global Communications',
        description: `Payment for order ${input.orderNumber}`,
      },
      meta: { order_number: input.orderNumber },
    }),
  }, fetchImpl);

  const link = payload?.data?.link;
  if (payload?.status !== 'success' || typeof link !== 'string' || !link.startsWith('https://')) {
    throw new FlutterwaveRequestError('Unable to start secure checkout.');
  }
  return { link };
}

export async function verifyFlutterwaveTransaction(
  transactionId: string,
  expected: ExpectedPayment,
  fetchImpl: typeof fetch = fetch,
): Promise<VerifiedPayment> {
  if (!/^\d+$/.test(transactionId)) {
    throw new FlutterwaveVerificationError('Invalid transaction identifier.');
  }

  const payload = await flutterwaveRequest(
    `/transactions/${encodeURIComponent(transactionId)}/verify`,
    { method: 'GET' },
    fetchImpl,
  );
  const data = payload?.data;

  if (
    payload?.status !== 'success' ||
    data?.status !== 'successful' ||
    data?.currency !== expected.currency ||
    data?.tx_ref !== expected.txRef ||
    typeof data?.amount !== 'number' ||
    data.amount < expected.amount
  ) {
    throw new FlutterwaveVerificationError('Payment verification did not match the order.');
  }

  return {
    transactionId: String(data.id),
    txRef: data.tx_ref,
    amount: data.amount,
    currency: data.currency,
    paymentMethod: typeof data.payment_type === 'string' ? data.payment_type : 'flutterwave',
    paidAt: data.created_at ? new Date(data.created_at) : new Date(),
  };
}
