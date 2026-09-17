export interface FlutterwavePaymentInput {
  txRef: string;
  amount: number;
  currency: 'NGN';
  redirectUrl: string;
  orderNumber: string;
  customer: { email: string; name: string; phone: string };
}

export interface ExpectedPayment {
  txRef: string;
  amount: number;
  currency: 'NGN';
}

export interface VerifiedPayment {
  transactionId: string;
  txRef: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paidAt: Date;
}
