'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { CATEGORIES } from '@/data/mockProducts';
import { LayoutGrid, Smartphone, Plug, Headphones, Video, Sun } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutGrid,
  Smartphone,
  Plug,
  Headphones,
  Video,
  Sun,
};

export function CategoryBar() {
  const { selectedCategory, setSelectedCategory } = useStore();

  return (
    <div className="py-6 sm:py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-950 tracking-tight">Explore Products</h2>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium">
            Smartphones, chargers, audio gadgets &amp; solar materials
          </p>
        </div>
      </div>

      {/* Organized 3-Column Square Box Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {CATEGORIES.map((category) => {
          const IconComponent = ICON_MAP[category.iconName] || LayoutGrid;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl border transition-all text-left group aspect-square relative ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-900 shadow-lg ring-2 ring-emerald-500/30 scale-[1.02]'
                  : 'bg-[#f5f5f7] text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-200'
              }`}
            >
              {/* Top Row: Icon + Count Badge */}
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white text-emerald-600 shadow-sm border border-slate-200/60'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-md font-mono ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {category.itemCount}
                </span>
              </div>

              {/* Bottom Row: Category Name */}
              <div className="mt-2">
                <span
                  className={`block text-[11px] sm:text-xs font-bold leading-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {category.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryBar;
