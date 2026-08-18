'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  MessageSquare,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency, generateSingleProductWhatsAppUrl } from '@/utils/whatsapp';

export function ProductModal() {
  const { activeProductModal, closeProductModal, storeConfig, addToCart } = useStore();

  const product = activeProductModal;

  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setQuantity(1);
      setCustomNote('');

      const defaultOpts: Record<string, string> = {};
      if (product.options) {
        product.options.forEach((opt) => {
          if (opt.values.length > 0) {
            defaultOpts[opt.name] = opt.values[0];
          }
        });
      }
      setSelectedOptions(defaultOpts);
    }
  }, [product]);

  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])];

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOptions);
    closeProductModal();
  };

  const handleDirectWhatsAppOrder = () => {
    const url = generateSingleProductWhatsAppUrl(
      product,
      storeConfig,
      quantity,
      selectedOptions,
      customNote
    );
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md p-4 sm:p-6 md:p-10 flex items-center justify-center">
      <div
        className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
          
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 space-y-4">
            <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-[#f5f5f7] border border-slate-200 p-6 flex items-center justify-center overflow-hidden">
              <Image
                src={selectedImage || product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden bg-[#f5f5f7] border transition-all shrink-0 ${
                      selectedImage === img
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Image src={img} alt="Thumbnail" fill className="object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] text-slate-600">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">Original Warranty</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-cyan-600" />
                <span className="font-semibold">Store Dispatch</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">Easy Return</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {product.brand || 'Original Product'}
                </span>
                {product.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {product.badge}
                  </span>
                )}
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{product.name}</h2>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="ml-1 font-bold text-slate-800 text-sm">{product.rating}</span>
                </div>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{product.reviewsCount} verified reviews</span>
              </div>

              {/* Pricing */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(product.price, storeConfig.currencySymbol)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(product.originalPrice, storeConfig.currencySymbol)}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{product.description}</p>

              {/* Variant Selector */}
              {product.options && product.options.length > 0 && (
                <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
                  {product.options.map((opt) => (
                    <div key={opt.name}>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Select {opt.name}:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val) => {
                          const isSelected = selectedOptions[opt.name] === val;
                          return (
                            <button
                              key={val}
                              onClick={() => handleOptionSelect(opt.name, val)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                                isSelected
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center gap-3 bg-slate-100 border border-slate-300 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-slate-600 hover:text-slate-900"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-slate-600 hover:text-slate-900"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Custom Order Note */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Special note or color preference (Optional)..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3 px-4 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleDirectWhatsAppOrder}
                className="py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductModal;
