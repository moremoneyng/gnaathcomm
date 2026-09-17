'use client';

import Image from 'next/image';
import Link from 'next/link';
import { LockKeyhole, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/utils/whatsapp';

export function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    storeConfig,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-md">
      <button aria-label="Close cart" className="absolute inset-0 h-full w-full" onClick={() => setIsCartOpen(false)} />
      <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-0 sm:pl-10">
        <div className="flex w-screen max-w-md flex-col border-l border-slate-200 bg-white text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-700"><ShoppingBag className="h-5 w-5" /></div>
              <div>
                <h2 className="text-base font-extrabold">Your Shopping Cart</h2>
                <p className="text-xs text-slate-500">Review products before secure payment</p>
              </div>
            </div>
            <button aria-label="Close cart" onClick={() => setIsCartOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-400"><ShoppingBag className="h-10 w-10" /></div>
                <h3 className="mt-4 text-base font-bold">Your cart is empty</h3>
                <p className="mt-1 text-xs text-slate-500">Explore our marketplace and add products to get started.</p>
                <button onClick={() => setIsCartOpen(false)} className="mt-6 rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white">Start shopping</button>
              </div>
            ) : (
              <>
                {cart.map((item) => {
                  const options = Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(' · ');
                  return (
                    <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <Image src={item.product.image} alt={item.product.name} fill className="object-contain p-2" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-xs font-bold">{item.product.name}</h4>
                        {options && <p className="mt-0.5 truncate text-[10px] text-slate-500">{options}</p>}
                        <p className="mt-1 text-xs font-black text-emerald-700">{formatCurrency(item.product.price, storeConfig.currencySymbol)}</p>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
                        <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 text-slate-500"><Minus className="h-3 w-3" /></button>
                        <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                        <button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-slate-500"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button aria-label={`Remove ${item.product.name}`} onClick={() => removeFromCart(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                  <button onClick={clearCart} className="underline hover:text-rose-600">Clear all items</button>
                  <span>100% genuine guaranteed</span>
                </div>
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div className="space-y-4 border-t border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-600">Order total</span><strong className="text-lg">{formatCurrency(cartSubtotal, storeConfig.currencySymbol)}</strong></div>
              <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-md hover:bg-emerald-600">
                <LockKeyhole className="h-5 w-5" /> Secure Flutterwave Checkout
              </Link>
              <p className="text-center text-[11px] text-slate-500">Pay with card, bank transfer or USSD.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
