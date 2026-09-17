import type { Metadata } from 'next';
import { CheckoutForm } from './CheckoutForm';

export const metadata: Metadata = {
  title: 'Secure Checkout | G Naath Global Communications',
  description: 'Complete your G Naath order securely with Flutterwave.',
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
