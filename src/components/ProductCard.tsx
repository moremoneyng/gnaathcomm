'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/ecommerce';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, generateSingleProductWhatsAppUrl } from '@/utils/whatsapp';
import { Star, Heart, ShoppingBag, Eye, MessageSquare } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { storeConfig, addToCart, isInWishlist, toggleWishlist, openProductModal } = useStore();

  const isLiked = isInWishlist(product.id);

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleDirectWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateSingleProductWhatsAppUrl(product, storeConfig);
    window.open(url, '_blank');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => openProductModal(product)}
      className="bg-white border border-slate-200 hover:border-emerald-500/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl group cursor-pointer relative overflow-hidden"
    >
      <div>
        {/* Top Badges & Wishlist Button */}
        <div className="flex items-center justify-between gap-1 mb-2 relative z-10">
          {product.badge ? (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 tracking-wider truncate">
              {product.badge}
            </span>
          ) : discountPercentage > 0 ? (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              -{discountPercentage}%
            </span>
          ) : (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 truncate">
              {product.brand || 'ORIGINAL'}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 sm:p-2 rounded-full border transition-all shrink-0 ${
              isLiked
                ? 'bg-rose-100 border-rose-300 text-rose-600'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-rose-600'
            }`}
            title="Wishlist"
          >
            <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />
          </button>
        </div>

        {/* Product Image Stage */}
        <div className="relative w-full h-36 sm:h-52 rounded-xl sm:rounded-2xl bg-[#f5f5f7] border border-slate-200/80 p-2 sm:p-4 mb-3 overflow-hidden flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-2 sm:p-3 group-hover:scale-105 transition-transform duration-500"
          />

          {/* Quick View Hover Overlay (Desktop) */}
          <div className="hidden sm:flex absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
            <button
              onClick={() => openProductModal(product)}
              className="px-4 py-2 rounded-full bg-white text-slate-900 font-bold text-xs shadow-lg flex items-center gap-1.5 transform hover:scale-105 transition-transform"
            >
              <Eye className="w-3.5 h-3.5 text-slate-900" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Product Meta */}
        <div className="space-y-0.5 mb-3">
          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
            {product.brand}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1 text-[11px] pt-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-500" />
              <span className="ml-1 font-bold text-slate-800 text-[11px] sm:text-xs">{product.rating}</span>
            </div>
            <span className="text-slate-400 text-[10px]">({product.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Pricing & Actions */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xs sm:text-base font-extrabold text-slate-900">
            {formatCurrency(product.price, storeConfig.currencySymbol)}
          </span>
          {product.originalPrice && (
            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
              {formatCurrency(product.originalPrice, storeConfig.currencySymbol)}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleAddToCart}
            className="py-1.5 sm:py-2.5 px-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-bold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1"
          >
            <ShoppingBag className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Add</span>
          </button>

          <button
            onClick={handleDirectWhatsAppOrder}
            className="py-1.5 sm:py-2.5 px-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] sm:text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span className="truncate">Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
