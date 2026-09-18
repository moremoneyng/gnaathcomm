'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { CATEGORIES as DEFAULT_CATEGORIES } from '@/data/storeCatalog';
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
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    fetch('/api/categories', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories([
            {
              ...DEFAULT_CATEGORIES[0],
              itemCount: data.categories.reduce((sum: number, category: { itemCount: number }) => sum + category.itemCount, 0),
            },
            ...data.categories,
          ]);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="py-6 sm:py-8">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-950 tracking-tight">Explore Products</h2>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1 font-medium">
            Technology, appliances, mobility, solar energy, accessories and more
          </p>
        </div>
      </div>

      {/* Five columns on phones, expanding to eight on large screens. */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 lg:grid-cols-8 lg:gap-3">
        {categories.map((category) => {
          const IconComponent = ICON_MAP[category.iconName] || LayoutGrid;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`relative flex h-24 flex-col justify-between overflow-hidden rounded-lg border p-1.5 transition-all text-left group sm:h-32 sm:rounded-xl sm:p-2 lg:h-36 ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-900 shadow-lg ring-2 ring-emerald-500/30 scale-[1.02]'
                  : 'bg-slate-100 text-slate-800 border-slate-200/90 hover:border-emerald-300 hover:shadow-md'
              }`}
            >
              {category.image && (
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 20vw, 160px"
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isSelected ? 'opacity-55' : 'opacity-45'}`}
                />
              )}
              <div className={`absolute inset-0 ${isSelected ? 'bg-slate-950/45' : 'bg-slate-950/15'}`} />

              {/* Top Row: Icon + Count Badge */}
              <div className="relative z-10 flex w-full items-center justify-between">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md transition-colors sm:h-7 sm:w-7 sm:rounded-lg ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white text-emerald-600 shadow-sm border border-slate-200/60'
                  }`}
                >
                  <IconComponent className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
                <span
                  className={`rounded-md px-1 py-0.5 text-[8px] font-black font-mono sm:text-[9px] ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {category.itemCount}
                </span>
              </div>

              {/* Bottom Row: Category Name */}
              <div className="relative z-10 mt-2">
                <span
                  className={`block text-[8px] font-bold leading-[1.05] sm:text-[10px] ${
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
