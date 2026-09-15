'use client';

import React, { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { CATEGORIES } from '@/data/storeCatalog';
import ProductCard from './ProductCard';
import { SlidersHorizontal, SearchX, Sparkles } from 'lucide-react';

export function ProductGrid() {
  const { products, searchQuery, selectedCategory, sortBy, setSortBy, setSearchQuery, setSelectedCategory } =
    useStore();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(query);
        const descMatch = product.description.toLowerCase().includes(query);
        const brandMatch = product.brand?.toLowerCase().includes(query) || false;
        return nameMatch || descMatch || brandMatch;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      return 0; // featured default
    });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const activeCategory = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Filters Header Bar (Hidden on Mobile per user request) */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f5f5f7] p-3.5 sm:p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{activeCategory ? activeCategory.name : 'All Products'}</span>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
              {filteredProducts.length} items
            </span>
          </h3>
          {searchQuery && (
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Showing results for &quot;<span className="text-emerald-700 font-semibold">{searchQuery}</span>&quot;
            </p>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors shadow-sm"
          >
            <option value="featured">Featured First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Grid Display: 2 columns (pairs) on mobile, 4 on desktop */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty Search Results State */
        <div className="text-center py-16 px-4 bg-[#f5f5f7] rounded-3xl border border-slate-200 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 mx-auto mb-4 border border-slate-200 shadow-sm">
            <SearchX className="w-8 h-8 text-emerald-600" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-1">No matching products found</h4>
          <p className="text-xs text-slate-500 mb-6">
            We couldn&apos;t find any items matching &quot;{searchQuery}&quot;. Try searching for JBL, Anker, iPhone, or Solar.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors inline-flex items-center gap-2 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Reset Search &amp; View All</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductGrid;
