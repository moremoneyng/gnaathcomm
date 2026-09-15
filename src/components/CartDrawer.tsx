'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useStore } from '@/context/StoreContext';
import { generateCartWhatsAppUrl, formatCurrency } from '@/utils/whatsapp';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    storeConfig,
    customerDetails,
    setCustomerDetails,
    showToast,
    submitOrder,
  } = useStore();

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerDetails({
      ...customerDetails,
      [name]: value,
    });
  };

  const handleCheckoutSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your cart is empty!');
      return;
    }

    if (!customerDetails.name || !customerDetails.phone) {
      showToast('Please provide your name and phone number.');
      return;
    }

    setIsSubmitting(true);

    // Save order in Supabase PostgreSQL
    try {
      await submitOrder();
    } catch (err) {
      console.error('Failed to save order in DB:', err);
    }

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const url = generateCartWhatsAppUrl(cart, customerDetails, storeConfig, cartSubtotal);

    showToast('Order saved to database! Opening WhatsApp...');

    setTimeout(() => {
      window.open(url, '_blank');
      setIsSubmitting(false);
      setIsCartOpen(false);
      setStep('cart');
    }, 500);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-md transition-opacity">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 z-50">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 text-slate-900 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Your Shopping Cart</h2>
                <p className="text-xs text-slate-500">Direct WhatsApp Order • G Naath Global</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Step Indicators */}
          <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
            <button
              onClick={() => setStep('cart')}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                step === 'cart'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>1. Review Items ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
            </button>

            <button
              onClick={() => {
                if (cart.length > 0) setStep('checkout');
              }}
              className={`flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${
                step === 'checkout'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>2. Delivery Details</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Add smartphones, JBL speakers, chargers or accessories from our catalog!
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-full font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : step === 'cart' ? (
              /* Step 1: Cart Items */
              <div className="space-y-3">
                {cart.map((item) => {
                  const optionsString = Object.entries(item.selectedOptions)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' | ');

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 relative group"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                        {optionsString && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{optionsString}</p>
                        )}
                        <p className="text-xs font-black text-emerald-700 mt-1">
                          {formatCurrency(item.product.price, storeConfig.currencySymbol)}
                        </p>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <button onClick={clearCart} className="hover:text-rose-600 text-[11px] underline">
                    Clear all items
                  </button>
                  <span>100% Genuine Guaranteed</span>
                </div>
              </div>
            ) : (
              /* Step 2: Customer Delivery Form */
              <form id="checkout-form" onSubmit={handleCheckoutSendWhatsApp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Chief Blessed"
                    value={customerDetails.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (WhatsApp preferred) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. 08123456789"
                    value={customerDetails.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fulfillment Store Branch *
                  </label>
                  <select
                    name="preferredBranch"
                    value={customerDetails.preferredBranch || 'lagos_head_office'}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="lagos_head_office">Lagos Head Office (Ago Palace Roundabout, Isolo)</option>
                    <option value="abia_branch_office">Abia State Branch (ABSU Uturu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Address / Pickup Note
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. 15 Ago Palace Way, Lagos OR ABSU Hostels"
                    value={customerDetails.address}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Preference
                  </label>
                  <select
                    name="paymentPreference"
                    value={customerDetails.paymentPreference}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="cash_on_delivery">💵 Cash on Delivery / Store Pickup</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                    <option value="whatsapp_discuss">💬 Discuss Payment on WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="deliveryNotes"
                    rows={2}
                    placeholder="e.g. Please test speaker before dispatch"
                    value={customerDetails.deliveryNotes || ''}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">Total Order Amount</span>
                <span className="text-lg font-black text-slate-900">
                  {formatCurrency(cartSubtotal, storeConfig.currencySymbol)}
                </span>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 rounded-full font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Proceed to Delivery Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full py-3.5 rounded-full font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Send Order to WhatsApp</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
