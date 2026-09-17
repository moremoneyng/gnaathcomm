'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/utils/whatsapp';

export function CheckoutForm() {
  const { cart, cartSubtotal, customerDetails, setCustomerDetails, storeConfig } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCustomerDetails((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payments/flutterwave/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { ...customerDetails, paymentPreference: undefined },
          cart: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedOptions: item.selectedOptions,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || typeof data.checkoutUrl !== 'string') {
        throw new Error(data.error || 'Unable to start secure payment.');
      }
      window.location.assign(data.checkoutUrl);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start secure payment.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#f7f6f1] px-4 py-20">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">Your cart is empty</h1>
          <p className="mt-3 text-sm text-slate-600">Add products before starting checkout.</p>
          <Link href="/shop" className="mt-7 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white">Return to shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f1] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/shop" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-700">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <form onSubmit={submit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Secure checkout</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Delivery details</h1>
              <p className="mt-2 text-sm text-slate-600">Enter the contact and delivery information for this order.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">Full name
                <input required name="name" value={customerDetails.name} onChange={update} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-emerald-600" />
              </label>
              <label className="text-sm font-bold text-slate-700">Email address
                <input required type="email" name="email" value={customerDetails.email || ''} onChange={update} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-emerald-600" />
              </label>
              <label className="text-sm font-bold text-slate-700">Phone number
                <input required type="tel" name="phone" value={customerDetails.phone} onChange={update} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-emerald-600" />
              </label>
              <label className="text-sm font-bold text-slate-700">City
                <input required name="city" value={customerDetails.city} onChange={update} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-emerald-600" />
              </label>
              <label className="text-sm font-bold text-slate-700 sm:col-span-2">Delivery address
                <input required name="address" value={customerDetails.address} onChange={update} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-emerald-600" />
              </label>
              <label className="text-sm font-bold text-slate-700 sm:col-span-2">Fulfilment branch
                <select name="preferredBranch" value={customerDetails.preferredBranch} onChange={update} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium outline-none focus:border-emerald-600">
                  <option value="lagos_head_office">Lagos Head Office</option>
                  <option value="abia_branch_office">ABSU Uturu Branch</option>
                </select>
              </label>
              <label className="text-sm font-bold text-slate-700 sm:col-span-2">Delivery notes (optional)
                <textarea name="deliveryNotes" rows={3} value={customerDetails.deliveryNotes || ''} onChange={update} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium outline-none focus:border-emerald-600" />
              </label>
            </div>
            {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button disabled={isSubmitting} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-70">
              {isSubmitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
              {isSubmitting ? 'Opening secure checkout…' : 'Pay securely with Flutterwave'}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">Card, bank transfer and USSD supported. Payment is processed securely by Flutterwave.</p>
          </form>

          <aside className="h-fit rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl sm:p-8">
            <h2 className="text-xl font-black">Order Summary</h2>
            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                    <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-1.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.product.name}</p>
                    <p className="mt-1 text-xs text-slate-400">Quantity {item.quantity}</p>
                  </div>
                  <p className="text-sm font-black">{formatCurrency(item.product.price * item.quantity, storeConfig.currencySymbol)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-lg font-black">
              <span>Total</span><span className="text-emerald-300">{formatCurrency(cartSubtotal, storeConfig.currencySymbol)}</span>
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <p className="text-xs leading-5 text-slate-300">Your total is rechecked against our live product database before payment.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
