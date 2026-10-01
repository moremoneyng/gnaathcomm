'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types/ecommerce';
import {
  X,
  Star,
  ShoppingBag,
  LockKeyhole,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  MessageCircle,
} from 'lucide-react';
import { cleanPhoneNumber, formatCurrency } from '@/utils/whatsapp';

interface ProductModalDialogProps {
  product: Product;
  onClose: () => void;
}

function ProductModalDialog({ product, onClose }: ProductModalDialogProps) {
  const router = useRouter();
  const { storeConfig, addToCart } = useStore();
  const galleryRef = useRef<HTMLDivElement>(null);

  // `images` normally already contains the cover; never show the same photo twice.
  const allImages = Array.from(new Set([product.image, ...(product.images || [])].filter(Boolean)));
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.options?.forEach((opt) => {
      if (opt.values.length > 0) defaults[opt.name] = opt.values[0];
    });
    return defaults;
  });

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const isPreorder = product.inStock && Boolean(product.isPreorder);
  const maxQuantity =
    !isPreorder && typeof product.stockQuantity === 'number' ? Math.max(1, Math.min(20, product.stockQuantity)) : 20;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const showImage = (index: number) => {
    setActiveImage(index);
    const gallery = galleryRef.current;
    if (gallery) gallery.scrollTo({ left: gallery.clientWidth * index, behavior: 'smooth' });
  };

  const handleGalleryScroll = () => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const index = Math.round(gallery.scrollLeft / gallery.clientWidth);
    if (index !== activeImage) setActiveImage(index);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOptions);
    onClose();
  };

  const handleOrderNow = () => {
    addToCart(product, quantity, selectedOptions);
    onClose();
    router.push('/checkout');
  };

  const enquiryUrl = `https://wa.me/${cleanPhoneNumber(storeConfig.whatsappNumber)}?text=${encodeURIComponent(
    `Hello G Naath, is "${product.name}" available?`
  )}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-white text-slate-900 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur hover:text-slate-900"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery */}
            <div className="bg-canvas md:sticky md:top-0 md:self-start">
              <div
                ref={galleryRef}
                onScroll={handleGalleryScroll}
                className="no-scrollbar flex aspect-square snap-x snap-mandatory overflow-x-auto md:aspect-[4/4.2]"
              >
                {allImages.map((img, idx) => (
                  <div key={img} className="relative h-full w-full shrink-0 snap-center">
                    <Image
                      src={img}
                      alt={idx === 0 ? product.name : `${product.name} – photo ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      preload={idx === 0}
                      className={`object-contain p-8 sm:p-12 ${product.inStock ? '' : 'opacity-70 grayscale-30'}`}
                    />
                  </div>
                ))}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto px-4 pb-4 no-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => showImage(idx)}
                      aria-label={`Show photo ${idx + 1}`}
                      aria-current={activeImage === idx}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white ring-2 transition ${
                        activeImage === idx ? 'ring-emerald-500' : 'ring-transparent hover:ring-slate-300'
                      }`}
                    >
                      <Image src={img} alt="" fill sizes="64px" className="object-contain p-1.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 pr-10">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {product.brand || 'G Naath Original'}
                </span>
                {product.badge && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-100">
                    {product.badge}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    isPreorder ? 'bg-amber-400 text-ink-900' : product.inStock ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                  }`}
                >
                  {isPreorder ? (
                    'Pre-order'
                  ) : product.inStock ? (
                    <>
                      <Check className="h-3 w-3" />
                      {typeof product.stockQuantity === 'number' && product.stockQuantity <= 5
                        ? `Only ${product.stockQuantity} left`
                        : 'In stock'}
                    </>
                  ) : (
                    'Out of stock'
                  )}
                </span>
              </div>

              <h2 id="product-modal-title" className="mt-3 font-heading text-2xl font-black leading-tight tracking-tight text-ink-900 sm:text-3xl">
                {product.name}
              </h2>

              {product.reviewsCount > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800">{product.rating.toFixed(1)}</span>
                  <span>· {product.reviewsCount} verified reviews</span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-3xl font-black tracking-tight text-ink-900">
                  {formatCurrency(product.price, storeConfig.currencySymbol)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-slate-400 line-through">
                      {formatCurrency(product.originalPrice!, storeConfig.currencySymbol)}
                    </span>
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">
                      Save {formatCurrency(product.originalPrice! - product.price, storeConfig.currencySymbol)}
                    </span>
                  </>
                )}
              </div>

              {isPreorder && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
                  <p className="font-bold">Available for pre-order</p>
                  <p className="mt-0.5 text-amber-800">
                    {product.preorderNote ? product.preorderNote.replace(/[.!]?$/, '.') : 'Order and pay now; we ship as soon as it arrives.'}{' '}
                    We&apos;ll keep you updated on delivery.
                  </p>
                </div>
              )}

              {product.description && (
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">{product.description}</p>
              )}

              {product.features && product.features.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              {product.video && (
                <div className="mt-5 overflow-hidden rounded-2xl bg-ink-950">
                  <video src={product.video} controls playsInline preload="metadata" className="aspect-video w-full object-contain" />
                </div>
              )}

              {product.inStock && product.options && product.options.length > 0 && (
                <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                  {product.options.map((opt) => (
                    <fieldset key={opt.name}>
                      <legend className="mb-2 text-xs font-bold text-slate-700">
                        {opt.name}: <span className="font-semibold text-slate-500">{selectedOptions[opt.name]}</span>
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((val) => {
                          const isSelected = selectedOptions[opt.name] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => setSelectedOptions((prev) => ({ ...prev, [opt.name]: val }))}
                              className={`rounded-xl px-3.5 py-2 text-xs font-semibold ring-1 transition ${
                                isSelected
                                  ? 'bg-ink-900 text-white ring-ink-900'
                                  : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-400'
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              )}

              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold text-slate-600">
                <div className="flex flex-col items-center gap-1 rounded-xl bg-canvas p-2.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Original warranty
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl bg-canvas p-2.5">
                  <Truck className="h-4 w-4 text-cyan-600" />
                  Store dispatch
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl bg-canvas p-2.5">
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                  Easy return
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="border-t border-slate-100 bg-white/95 p-4 backdrop-blur sm:px-8">
          {product.inStock ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full bg-slate-100 p-1 ring-1 ring-slate-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-white"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-bold" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={quantity >= maxQuantity}
                  aria-label="Increase quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-white disabled:opacity-30"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label="Add to cart"
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-bold text-ink-900 ring-1 ring-slate-200 transition hover:bg-emerald-50 sm:flex-1"
              >
                <ShoppingBag className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline">Add to cart</span>
              </button>
              <button
                type="button"
                onClick={handleOrderNow}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-ink-900 px-4 text-sm font-extrabold text-white shadow-md transition hover:bg-emerald-600"
              >
                <LockKeyhole className="h-4 w-4" />
                {isPreorder ? 'Pre-order now' : 'Order now'}
              </button>
            </div>
          ) : (
            <a
              href={enquiryUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 text-sm font-extrabold text-white transition hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4" />
              Ask when it&apos;s back in stock
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProductModal() {
  const { activeProductModal, closeProductModal } = useStore();
  if (!activeProductModal) return null;
  return <ProductModalDialog key={activeProductModal.id} product={activeProductModal} onClose={closeProductModal} />;
}

export default ProductModal;
