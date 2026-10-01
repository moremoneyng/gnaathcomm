'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/ecommerce';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/utils/whatsapp';
import { Star, Heart, ShoppingBag, Eye, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  /** Load the image eagerly, for cards that are visible on first paint. */
  eager?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, eager = false }) => {
  const router = useRouter();
  const { storeConfig, addToCart, isInWishlist, toggleWishlist, openProductModal } = useStore();

  const isLiked = isInWishlist(product.id);
  const hasOptions = Boolean(product.options && product.options.length > 0);
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercentage = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;
  const hoverImage = product.images?.find((img) => img && img !== product.image);
  const isPreorder = product.inStock && Boolean(product.isPreorder);

  const handleOrderNow = () => {
    if (hasOptions) {
      openProductModal(product);
      return;
    }
    addToCart(product, 1);
    router.push('/checkout');
  };

  const handleAddToCart = () => {
    if (hasOptions) {
      openProductModal(product);
      return;
    }
    addToCart(product, 1);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(10,26,51,0.35)] hover:ring-slate-300 sm:rounded-3xl">
      {/* Image stage */}
      <div className="relative aspect-square overflow-hidden bg-canvas">
        <button
          type="button"
          onClick={() => openProductModal(product)}
          aria-label={`View details for ${product.name}`}
          className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading={eager ? 'eager' : 'lazy'}
            className={`object-contain p-4 transition duration-500 sm:p-6 ${
              hoverImage ? 'sm:group-hover:opacity-0' : 'group-hover:scale-105'
            } ${product.inStock ? '' : 'opacity-60 grayscale-35'}`}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt=""
              fill
              sizes="(max-width: 1024px) 33vw, 25vw"
              className="hidden object-contain p-6 opacity-0 transition duration-500 sm:block sm:group-hover:scale-105 sm:group-hover:opacity-100"
            />
          )}
        </button>

        {/* Badges */}
        <div className="pointer-events-none absolute left-2 top-2 flex max-w-[70%] flex-col items-start gap-1 sm:left-3 sm:top-3">
          {!product.inStock && (
            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white sm:text-[10px]">
              Out of stock
            </span>
          )}
          {isPreorder && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-ink-900 sm:text-[10px]">
              Pre-order
            </span>
          )}
          {hasDiscount && discountPercentage > 0 && (
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[9px] font-extrabold text-white sm:text-[10px]">
              -{discountPercentage}%
            </span>
          )}
          {product.badge && (
            <span className="truncate rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 shadow-sm ring-1 ring-emerald-100 sm:text-[10px]">
              {product.badge}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-pressed={isLiked}
          aria-label={isLiked ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-sm ring-1 backdrop-blur transition sm:right-3 sm:top-3 ${
            isLiked
              ? 'bg-rose-50 text-rose-600 ring-rose-200'
              : 'bg-white/90 text-slate-500 ring-slate-200 hover:text-rose-600'
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-600' : ''}`} />
        </button>

        <span className="pointer-events-none absolute inset-x-0 bottom-3 hidden justify-center opacity-0 transition duration-300 group-hover:opacity-100 sm:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/90 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur">
            <Eye className="h-3.5 w-3.5" /> Quick view
          </span>
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          {product.brand || 'G Naath Original'}
        </p>
        <h3 className="mt-1 min-h-10 text-[13px] font-bold leading-5 text-slate-900 sm:text-sm">
          <button type="button" onClick={() => openProductModal(product)} title={product.name} className="line-clamp-2 text-left hover:text-emerald-700">
            {product.name}
          </button>
        </h3>

        {product.reviewsCount > 0 && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-700">{product.rating.toFixed(1)}</span>
            <span>({product.reviewsCount})</span>
          </div>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] font-black tracking-tight text-ink-900 sm:text-lg">
            {formatCurrency(product.price, storeConfig.currencySymbol)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-slate-400 line-through sm:text-xs">
              {formatCurrency(product.originalPrice!, storeConfig.currencySymbol)}
            </span>
          )}
        </div>
        {hasDiscount && (
          <p className="text-[10px] font-bold text-emerald-700 sm:text-[11px]">
            You save {formatCurrency(product.originalPrice! - product.price, storeConfig.currencySymbol)}
          </p>
        )}

        {isPreorder && (
          <p className="mt-1 line-clamp-1 text-[10px] font-bold text-amber-700 sm:text-[11px]">
            {product.preorderNote || 'Order now, ships when available'}
          </p>
        )}
        {product.inStock && !isPreorder && typeof product.stockQuantity === 'number' && product.stockQuantity <= 5 && (
          <p className="mt-1 text-[10px] font-bold text-orange-600 sm:text-[11px]">Only {product.stockQuantity} left</p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-3">
          {product.inStock ? (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label={hasOptions ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
                title={hasOptions ? 'Choose options' : 'Add to cart'}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-ink-900 ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200 active:scale-95"
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleOrderNow}
                title="Order now with secure Flutterwave checkout"
                className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 px-3 text-xs font-extrabold text-white transition hover:bg-emerald-600 active:scale-[0.98]"
              >
                <Zap className={`h-3.5 w-3.5 shrink-0 text-brand-green group-hover:text-white ${isPreorder ? 'hidden sm:block' : ''}`} />
                <span className="truncate">{hasOptions ? 'Choose' : isPreorder ? 'Pre-order' : 'Buy now'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openProductModal(product)}
              className="flex h-10 w-full items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 ring-1 ring-slate-200"
            >
              Out of stock
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/90 sm:rounded-3xl" aria-hidden="true">
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-3 sm:p-4">
        <div className="skeleton h-2.5 w-1/3 rounded" />
        <div className="skeleton h-3.5 w-5/6 rounded" />
        <div className="skeleton h-3.5 w-2/3 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
        <div className="skeleton mt-3 h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

export default ProductCard;
