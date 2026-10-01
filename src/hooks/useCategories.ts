'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '@/types/ecommerce';
import { useStore } from '@/context/StoreContext';
import { resolveCategoryIcon } from '@/lib/categoryIntelligence';

let cached: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

function loadCategories() {
  if (!inflight) {
    inflight = fetch('/api/categories', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => (data.success && Array.isArray(data.categories) ? (data.categories as Category[]) : []))
      .catch(() => [])
      .then((categories) => {
        cached = categories;
        inflight = null;
        return categories;
      });
  }
  return inflight;
}

/**
 * Storefront categories from the database, shared across components. Empty categories are
 * hidden and the rest are ordered by how many products they hold, so shoppers always land
 * on the busiest shelves first.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[] | null>(cached);

  useEffect(() => {
    let active = true;
    loadCategories().then((loaded) => {
      if (active) setCategories(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const { products } = useStore();

  const visible = useMemo(() => {
    const source = categories && categories.length > 0 ? categories : categoriesFromProducts(products);
    return source
      .filter((category) => category.itemCount > 0)
      .sort((a, b) => b.itemCount - a.itemCount || a.name.localeCompare(b.name));
  }, [categories, products]);

  return {
    categories: visible,
    totalProducts: visible.reduce((sum, category) => sum + category.itemCount, 0),
    isLoading: categories === null,
  };
}

/** Fallback when the categories endpoint is unreachable: rebuild shelves from loaded products. */
function categoriesFromProducts(products: Product[]): Category[] {
  const bySlug = new Map<string, Category>();
  for (const product of products) {
    const existing = bySlug.get(product.category);
    if (existing) {
      existing.itemCount += 1;
      continue;
    }
    const name = product.categoryName || product.category.replace(/-/g, ' ');
    bySlug.set(product.category, {
      id: product.category,
      slug: product.category,
      name,
      description: '',
      iconName: resolveCategoryIcon(null, name),
      image: product.image,
      itemCount: 1,
    });
  }
  return Array.from(bySlug.values());
}
