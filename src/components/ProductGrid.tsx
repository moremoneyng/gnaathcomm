'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useCategories } from '@/hooks/useCategories';
import ProductCard, { ProductCardSkeleton } from './ProductCard';
import { ArrowRight, SearchX, Sparkles } from 'lucide-react';

const availabilityRank = (p: { inStock: boolean; isPreorder?: boolean }) => (!p.inStock ? 2 : p.isPreorder ? 1 : 0);

interface ProductGridProps {
  /** Maximum number of products to show; a "view all" link appears when more exist. */
  limit?: number;
}

export function ProductGrid({ limit }: ProductGridProps) {
  const {
    products,
    isLoadingProducts,
    searchQuery,
    selectedCategory,
    sortBy,
    setSortBy,
    setSearchQuery,
    setSelectedCategory,
  } = useStore();
  const { categories } = useCategories();

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter((product) => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
      if (!query) return true;
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.brand?.toLowerCase().includes(query) ?? false)
      );
    });

    // In-stock items first, then the chosen order. The API already returns newest first.
    return filtered
      .map((product, index) => ({ product, index }))
      .sort((a, b) => {
        const rank = availabilityRank(a.product) - availabilityRank(b.product);
      if (rank !== 0) return rank;
        if (sortBy === 'price-low') return a.product.price - b.product.price;
        if (sortBy === 'price-high') return b.product.price - a.product.price;
        if (sortBy === 'rating') return b.product.rating - a.product.rating;
        if (sortBy === 'featured') {
          const featured = Number(Boolean(b.product.isFeatured)) - Number(Boolean(a.product.isFeatured));
          if (featured !== 0) return featured;
        }
        return a.index - b.index;
      })
      .map(({ product }) => product);
  }, [products, selectedCategory, searchQuery, sortBy]);

  const activeCategory = categories.find((c) => c.slug === selectedCategory);
  const visibleProducts = limit ? filteredProducts.slice(0, limit) : filteredProducts;
  const hiddenCount = filteredProducts.length - visibleProducts.length;
  const shopHref = selectedCategory !== 'all' ? `/shop?category=${encodeURIComponent(selectedCategory)}` : '/shop';

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-heading text-lg font-black tracking-tight text-ink-900 sm:text-xl">
            {searchQuery ? 'Search results' : activeCategory ? activeCategory.name : 'Fresh in store'}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {isLoadingProducts
              ? 'Loading products…'
              : searchQuery
                ? `${filteredProducts.length} match${filteredProducts.length === 1 ? '' : 'es'} for “${searchQuery}”`
                : `${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'} available`}
          </p>
        </div>

        <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="hidden sm:inline">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            aria-label="Sort products"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </label>
      </div>

      {isLoadingProducts && products.length === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: limit ? Math.min(limit, 8) : 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : visibleProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} eager={index < 4} />
            ))}
          </div>
          {hiddenCount > 0 && (
            <div className="flex justify-center pt-2">
              <Link
                href={shopHref}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-ink-900 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700"
              >
                See {hiddenCount} more {activeCategory ? `in ${activeCategory.name}` : 'products'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="mx-auto my-6 max-w-md rounded-3xl border border-slate-200 bg-canvas px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
            <SearchX className="h-7 w-7 text-emerald-600" />
          </div>
          <h4 className="text-lg font-bold text-ink-900">
            {products.length === 0 ? 'New stock is on the way' : 'No matching products'}
          </h4>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            {products.length === 0
              ? 'Our catalogue is being updated. Chat with us on WhatsApp for current availability.'
              : searchQuery
                ? `Nothing matches “${searchQuery}”. Try a brand like JBL, Anker or Apple.`
                : 'Nothing in this category yet. Try another one.'}
          </p>
          {products.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600"
            >
              <Sparkles className="h-4 w-4" />
              Show all products
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductGrid;
