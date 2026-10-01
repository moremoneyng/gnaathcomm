'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useCategories } from '@/hooks/useCategories';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Footer } from '@/components/Footer';
import { Search, SlidersHorizontal, X, RefreshCw, Check, Tag, PackageCheck, Clock } from 'lucide-react';

const availabilityRank = (p: { inStock: boolean; isPreorder?: boolean }) => (!p.inStock ? 2 : p.isPreorder ? 1 : 0);

type ShopSort = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating';

/** Applies ?category= and ?search= whenever the URL changes, including in-app navigation. */
function ShopUrlSync() {
  const searchParams = useSearchParams();
  const { setSelectedCategory, setSearchQuery } = useStore();

  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) setSelectedCategory(category);
    if (search !== null) setSearchQuery(search);
  }, [searchParams, setSelectedCategory, setSearchQuery]);

  return null;
}

export default function ShopPage() {
  const { products, isLoadingProducts, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useStore();
  const { categories } = useCategories();

  const [selectedBrand, setSelectedBrand] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [preorderOnly, setPreorderOnly] = useState(false);
  const [sortBy, setSortBy] = useState<ShopSort>('featured');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const availableBrands = useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      if (p.brand) counts.set(p.brand, (counts.get(p.brand) || 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result = products
      .map((product, index) => ({ product, index }))
      .filter(({ product: p }) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;
        if (inStockOnly && (!p.inStock || p.isPreorder)) return false;
        if (preorderOnly && !(p.inStock && p.isPreorder)) return false;
        if (onSaleOnly && !(p.originalPrice && p.originalPrice > p.price)) return false;
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand?.toLowerCase().includes(q) ?? false) ||
          (p.categoryName?.toLowerCase().includes(q) ?? false) ||
          (p.features || []).some((f) => f.toLowerCase().includes(q))
        );
      });

    result.sort((a, b) => {
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
    });

    return result.map(({ product }) => product);
  }, [products, selectedCategory, searchQuery, selectedBrand, inStockOnly, onSaleOnly, preorderOnly, sortBy]);

  const activeFilterCount =
    Number(selectedBrand !== 'all') +
    Number(inStockOnly) +
    Number(onSaleOnly) +
    Number(preorderOnly) +
    Number(sortBy !== 'featured');
  const hasActiveFilters = activeFilterCount > 0 || selectedCategory !== 'all' || searchQuery.trim() !== '';
  const activeCategory = categories.find((c) => c.slug === selectedCategory);

  const resetAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedBrand('all');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setPreorderOnly(false);
    setSortBy('featured');
  };

  const filterControls = (
    <>
      <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600 sm:flex-row sm:items-center">
        <span className="sm:sr-only">Brand</span>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="h-10 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="all">All brands</option>
          {availableBrands.map(([brand, count]) => (
            <option key={brand} value={brand}>
              {brand} ({count})
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        aria-pressed={inStockOnly}
        onClick={() => setInStockOnly((v) => !v)}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold ring-1 transition ${
          inStockOnly ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300'
        }`}
      >
        <PackageCheck className="h-4 w-4" /> Available now
      </button>

      {products.some((p) => p.inStock && p.isPreorder) && (
        <button
          type="button"
          aria-pressed={preorderOnly}
          onClick={() => setPreorderOnly((v) => !v)}
          className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold ring-1 transition ${
            preorderOnly ? 'bg-amber-400 text-ink-900 ring-amber-400' : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300'
          }`}
        >
          <Clock className="h-4 w-4" /> Pre-order
        </button>
      )}

      <button
        type="button"
        aria-pressed={onSaleOnly}
        onClick={() => setOnSaleOnly((v) => !v)}
        className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-bold ring-1 transition ${
          onSaleOnly ? 'bg-rose-600 text-white ring-rose-600' : 'bg-white text-slate-700 ring-slate-200 hover:ring-slate-300'
        }`}
      >
        <Tag className="h-4 w-4" /> On sale
      </button>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-slate-600 sm:flex-row sm:items-center">
        <span className="sm:sr-only">Sort</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as ShopSort)}
          className="h-10 rounded-full bg-ink-900 px-4 text-xs font-bold text-white focus:outline-none"
        >
          <option value="featured">Sort: Featured</option>
          <option value="newest">Newest arrivals</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>
      </label>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas text-slate-800">
      <Suspense fallback={null}>
        <ShopUrlSync />
      </Suspense>
      <CartDrawer />
      <ProductModal />

      {/* Header */}
      <header className="relative overflow-hidden bg-ink-950 text-white">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-12 lg:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-brand-green">Online store</p>
          <h1 className="mt-1 font-heading text-3xl font-black tracking-tight sm:text-5xl">
            {activeCategory ? activeCategory.name : 'Shop everything'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {activeCategory?.description ||
              'Original phones, electronics, appliances, solar systems, gadgets and more — with secure checkout and store dispatch.'}
          </p>

          <div className="mt-6 flex max-w-3xl items-center rounded-full bg-white p-1.5 text-slate-900 shadow-xl focus-within:ring-4 focus-within:ring-emerald-400/30">
            <Search className="ml-3 h-5 w-5 shrink-0 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phones, speakers, inverters, brands…"
              aria-label="Search products"
              className="w-full min-w-0 bg-transparent px-3 py-3 text-sm placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear product search"
                className="mr-1 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sticky category + filter toolbar */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl sm:top-20">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="no-scrollbar -my-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              aria-pressed={selectedCategory === 'all'}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition ${
                selectedCategory === 'all' ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All <span className="opacity-60">{products.length}</span>
            </button>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isActive ? 'all' : cat.slug)}
                  aria-pressed={isActive}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition ${
                    isActive ? 'bg-ink-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CategoryIcon name={cat.iconName} className={`h-3.5 w-3.5 ${isActive ? 'text-brand-green' : 'text-emerald-600'}`} />
                  {cat.name}
                  {isActive ? <Check className="h-3.5 w-3.5" /> : <span className="opacity-50">{cat.itemCount}</span>}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="relative inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-bold text-slate-800 ring-1 ring-slate-200 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            Showing <strong className="text-ink-900">{filteredProducts.length}</strong> of {products.length} products
          </p>
          <div className="hidden flex-wrap items-center gap-2 lg:flex">
            {filterControls}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
        </div>

        {isLoadingProducts && products.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} eager={index < 4} />
            ))}
          </div>
        ) : (
          <div className="mx-auto my-8 max-w-lg space-y-5 rounded-3xl bg-white p-10 text-center ring-1 ring-slate-200 sm:p-14">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-ink-900">No matching products</h3>
              <p className="text-sm leading-relaxed text-slate-500">
                Try a different search or clear your filters to see the full catalogue.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600"
            >
              <RefreshCw className="h-4 w-4" /> Reset all filters
            </button>
          </div>
        )}
      </main>

      {/* Mobile filter sheet */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-ink-950/50 backdrop-blur-sm lg:hidden" onClick={() => setIsFilterSheetOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
            className="w-full space-y-4 rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-200" />
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-ink-900">Filter &amp; sort</h2>
              <button type="button" onClick={() => setIsFilterSheetOpen(false)} aria-label="Close filters" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 [&>button]:justify-center [&_select]:w-full">{filterControls}</div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button type="button" onClick={resetAllFilters} className="h-12 rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                Reset
              </button>
              <button type="button" onClick={() => setIsFilterSheetOpen(false)} className="h-12 rounded-full bg-ink-900 text-sm font-extrabold text-white">
                Show {filteredProducts.length} products
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
