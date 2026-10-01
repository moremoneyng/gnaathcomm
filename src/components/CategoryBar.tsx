'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useCategories } from '@/hooks/useCategories';
import { CategoryIcon } from './CategoryIcon';
import { ArrowRight, LayoutGrid } from 'lucide-react';

export function CategoryBar() {
  const { selectedCategory, setSelectedCategory, products } = useStore();
  const { categories, isLoading } = useCategories();

  const tileBase =
    'group relative flex h-32 w-[8.5rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl p-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:h-40 sm:w-auto';

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">Shop by category</p>
          <h2 className="mt-1 font-heading text-2xl font-black tracking-tight text-ink-900 sm:text-3xl">
            Find exactly what you need
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Technology, appliances, mobility, solar energy, accessories and more.
          </p>
        </div>
        <Link
          href="/shop"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-ink-900 transition hover:text-emerald-700 sm:inline-flex"
        >
          Browse the full shop <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-6"
        role="group"
        aria-label="Product categories"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          aria-pressed={selectedCategory === 'all'}
          className={`${tileBase} ${
            selectedCategory === 'all'
              ? 'bg-ink-900 text-white shadow-lg shadow-ink-900/25'
              : 'bg-canvas text-ink-900 ring-1 ring-slate-200 hover:ring-emerald-300'
          }`}
        >
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              selectedCategory === 'all' ? 'bg-white/10 text-brand-green' : 'bg-white text-emerald-600 shadow-sm'
            }`}
          >
            <LayoutGrid className="h-4.5 w-4.5" />
          </span>
          <span>
            <span className="block text-sm font-extrabold leading-tight">Everything</span>
            <span className={`text-[11px] font-semibold ${selectedCategory === 'all' ? 'text-white/60' : 'text-slate-500'}`}>
              {products.length} products
            </span>
          </span>
        </button>

        {isLoading && categories.length === 0
          ? Array.from({ length: 5 }, (_, i) => <div key={i} className={`${tileBase} skeleton`} aria-hidden="true" />)
          : categories.map((category) => {
              const isSelected = selectedCategory === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  aria-pressed={isSelected}
                  className={`${tileBase} bg-ink-900 text-white ${
                    isSelected ? 'ring-2 ring-emerald-400 ring-offset-2' : 'hover:-translate-y-0.5 hover:shadow-lg'
                  }`}
                >
                  {category.image && (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 140px, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover opacity-60 transition duration-500 group-hover:scale-110 group-hover:opacity-70"
                    />
                  )}
                  <span className="absolute inset-0 bg-linear-to-t from-ink-950 via-ink-950/50 to-ink-950/10" />

                  <span className="relative flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm">
                      <CategoryIcon name={category.iconName} className="h-4.5 w-4.5" />
                    </span>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                      {category.itemCount}
                    </span>
                  </span>
                  <span className="relative block text-sm font-extrabold leading-tight">{category.name}</span>
                </button>
              );
            })}
      </div>
    </div>
  );
}

export default CategoryBar;
