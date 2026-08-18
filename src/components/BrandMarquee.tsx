'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const BrandMarquee: React.FC = () => {
  const { storeConfig, setSelectedCategory, setSearchQuery } = useStore();

  const handleBrandClick = (brandName: string) => {
    setSelectedCategory('all');
    setSearchQuery(brandName);
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 bg-[#08080c] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Authorized Brands
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Original Products with Official Factory Warranties</span>
          </div>
        </div>

        {/* Minimal Brand Pills Grid */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          {storeConfig.brands.map((brand) => (
            <button
              key={brand}
              onClick={() => handleBrandClick(brand)}
              className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 text-xs font-medium text-slate-300 hover:text-white transition-all whitespace-nowrap shrink-0"
              title={`View ${brand} products`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
