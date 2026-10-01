'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import type { AdminCategory, Product } from '@/types/ecommerce';
import { LOW_STOCK_THRESHOLD, productAvailability, type Availability } from '@/lib/productInput';
import {
  AlertTriangle,
  CheckSquare,
  Clock,
  Edit3,
  Images,
  PackageCheck,
  PackageX,
  Plus,
  Search,
  Square,
  Star,
  Trash2,
  TrendingDown,
  X,
} from 'lucide-react';

type StockFilter = 'all' | 'in' | 'preorder' | 'out' | 'low' | 'featured' | 'attention';
type SortKey = 'newest' | 'name' | 'price-high' | 'price-low';

interface ProductManagerProps {
  products: Product[];
  categories: AdminCategory[];
  currencySymbol: string;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onChanged: () => Promise<void> | void;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

function isLowStock(product: Product) {
  return typeof product.stockQuantity === 'number' && product.stockQuantity > 0 && product.stockQuantity <= LOW_STOCK_THRESHOLD;
}

/** A product "needs attention" when shoppers would see a thin listing. */
function attentionReasons(product: Product) {
  const reasons: string[] = [];
  if (!product.description?.trim()) reasons.push('No description');
  const imageCount = new Set([product.image, ...(product.images || [])].filter(Boolean)).size;
  if (imageCount < 2) reasons.push('Only one photo');
  if (!product.brand?.trim()) reasons.push('No brand');
  return reasons;
}

export function ProductManager({ products, categories, currencySymbol, onCreate, onEdit, onChanged, notify }: ProductManagerProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [isBulkBusy, setIsBulkBusy] = useState(false);

  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name || slug;

  const counts = useMemo(
    () => ({
      all: products.length,
      in: products.filter((p) => productAvailability(p) === 'available').length,
      preorder: products.filter((p) => productAvailability(p) === 'preorder').length,
      out: products.filter((p) => !p.inStock).length,
      low: products.filter(isLowStock).length,
      featured: products.filter((p) => p.isFeatured).length,
      attention: products.filter((p) => attentionReasons(p).length > 0).length,
    }),
    [products]
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products
      .map((product, index) => ({ product, index }))
      .filter(({ product: p }) => {
        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
        if (stockFilter === 'in' && productAvailability(p) !== 'available') return false;
        if (stockFilter === 'preorder' && productAvailability(p) !== 'preorder') return false;
        if (stockFilter === 'out' && p.inStock) return false;
        if (stockFilter === 'low' && !isLowStock(p)) return false;
        if (stockFilter === 'featured' && !p.isFeatured) return false;
        if (stockFilter === 'attention' && attentionReasons(p).length === 0) return false;
        if (!q) return true;
        return p.name.toLowerCase().includes(q) || (p.brand?.toLowerCase().includes(q) ?? false);
      });
    list.sort((a, b) => {
      if (sortKey === 'name') return a.product.name.localeCompare(b.product.name);
      if (sortKey === 'price-high') return b.product.price - a.product.price;
      if (sortKey === 'price-low') return a.product.price - b.product.price;
      return a.index - b.index;
    });
    return list.map(({ product }) => product);
  }, [products, search, categoryFilter, stockFilter, sortKey]);

  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.has(p.id));

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visible.forEach((p) => next.delete(p.id));
        return next;
      }
      return new Set([...prev, ...visible.map((p) => p.id)]);
    });

  const quickUpdate = async (
    product: Product,
    patch: Partial<Pick<Product, 'inStock' | 'isFeatured' | 'stockQuantity'>> & { availability?: Availability },
    message: string
  ) => {
    setBusyIds((prev) => new Set(prev).add(product.id));
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, ...patch }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Update failed');
      await onChanged();
      notify(message, 'success');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Update failed', 'error');
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const bulkUpdate = async (
    patch: { availability?: Availability; isFeatured?: boolean; category?: string },
    label: string
  ) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setIsBulkBusy(true);
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, ...patch }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Bulk update failed');
      await onChanged();
      setSelected(new Set());
      notify(`${data.updated} product${data.updated === 1 ? '' : 's'} ${label}`, 'success');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Bulk update failed', 'error');
    } finally {
      setIsBulkBusy(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}" permanently?\n\nTip: to fix a wrong photo, use Edit instead — you can remove single images there. Past orders keep their records either way.`)) {
      return;
    }
    setBusyIds((prev) => new Set(prev).add(product.id));
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(product.id)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Delete failed');
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
      await onChanged();
      notify('Product deleted', 'success');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Delete failed', 'error');
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  const filters: { key: StockFilter; label: string; icon: React.ElementType; tone: string }[] = [
    { key: 'all', label: 'All', icon: Images, tone: 'text-slate-700' },
    { key: 'in', label: 'Available', icon: PackageCheck, tone: 'text-emerald-700' },
    { key: 'preorder', label: 'Pre-order', icon: Clock, tone: 'text-amber-700' },
    { key: 'out', label: 'Out of stock', icon: PackageX, tone: 'text-rose-700' },
    { key: 'low', label: `Low stock (≤${LOW_STOCK_THRESHOLD})`, icon: TrendingDown, tone: 'text-orange-600' },
    { key: 'featured', label: 'Featured', icon: Star, tone: 'text-amber-600' },
    { key: 'attention', label: 'Needs attention', icon: AlertTriangle, tone: 'text-orange-600' },
  ];

  const STATUS_STYLES: Record<Availability, string> = {
    available: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    preorder: 'bg-amber-50 text-amber-900 ring-amber-300',
    out_of_stock: 'bg-rose-50 text-rose-700 ring-rose-200',
  };
  const STATUS_MESSAGES: Record<Availability, string> = {
    available: 'is now available',
    preorder: 'is now on pre-order',
    out_of_stock: 'is now out of stock',
  };

  /** One-tap status menu, plus a unit counter for products whose stock is counted. */
  const renderStockSwitch = (product: Product) => {
    const status = productAvailability(product);
    const counted = status !== 'preorder' && typeof product.stockQuantity === 'number';
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <select
          value={status}
          disabled={busyIds.has(product.id)}
          onChange={(e) => {
            const next = e.target.value as Availability;
            if (next === 'available' && counted && product.stockQuantity === 0) {
              notify('This product counts units and has 0 left. Add units with + to make it available.', 'info');
              return;
            }
            quickUpdate(product, { availability: next }, `${product.name} ${STATUS_MESSAGES[next]}`);
          }}
          aria-label={`Availability of ${product.name}`}
          className={`h-8 rounded-full px-3 text-[11px] font-bold ring-1 focus:outline-none disabled:opacity-50 ${STATUS_STYLES[status]}`}
        >
          <option value="available">● Available</option>
          <option value="preorder">◷ Pre-order</option>
          <option value="out_of_stock">✕ Out of stock</option>
        </select>
        {counted && renderStockStepper(product, product.stockQuantity as number)}
      </div>
    );
  };

  const renderStockStepper = (product: Product, quantity: number) => (
    <div
      className={`inline-flex items-center gap-1 rounded-full p-1 text-[11px] font-bold ring-1 ${
        quantity === 0
          ? 'bg-rose-50 text-rose-700 ring-rose-200'
          : quantity <= LOW_STOCK_THRESHOLD
            ? 'bg-orange-50 text-orange-700 ring-orange-200'
            : 'bg-slate-50 text-slate-700 ring-slate-200'
      }`}
    >
      <button
        type="button"
        disabled={busyIds.has(product.id) || quantity === 0}
        onClick={() => quickUpdate(product, { stockQuantity: quantity - 1 }, `${product.name}: ${quantity - 1} left`)}
        aria-label={`Remove one unit of ${product.name}`}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-sm disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-12 text-center" aria-live="polite">
        {quantity} unit{quantity === 1 ? '' : 's'}
      </span>
      <button
        type="button"
        disabled={busyIds.has(product.id)}
        onClick={() => quickUpdate(product, { stockQuantity: quantity + 1 }, `${product.name}: ${quantity + 1} in stock`)}
        aria-label={`Add one unit of ${product.name}`}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm shadow-sm disabled:opacity-40"
      >
        +
      </button>
    </div>
  );

  const renderFeatureButton = (product: Product) => (
    <button
      type="button"
      aria-pressed={Boolean(product.isFeatured)}
      aria-label={product.isFeatured ? `Remove ${product.name} from homepage` : `Feature ${product.name} on homepage`}
      title={product.isFeatured ? 'Featured on homepage' : 'Feature on homepage'}
      disabled={busyIds.has(product.id)}
      onClick={() =>
        quickUpdate(product, { isFeatured: !product.isFeatured }, product.isFeatured ? 'Removed from homepage' : 'Featured on homepage')
      }
      className={`rounded-lg p-2 transition disabled:opacity-50 ${
        product.isFeatured ? 'bg-amber-50 text-amber-500' : 'text-slate-400 hover:bg-slate-100 hover:text-amber-500'
      }`}
    >
      <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-amber-400' : ''}`} />
    </button>
  );

  const renderThumb = (product: Product, size: string) => {
    const imageCount = new Set([product.image, ...(product.images || [])].filter(Boolean)).size;
    return (
      <div className={`relative ${size} shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200`}>
        <Image src={product.image} alt="" fill sizes="64px" className="object-contain p-1" />
        {imageCount > 1 && (
          <span className="absolute bottom-0.5 right-0.5 rounded bg-ink-900/80 px-1 text-[9px] font-bold text-white">{imageCount}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Inventory health chips */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {filters.map(({ key, label, icon: Icon, tone }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStockFilter(key)}
            aria-pressed={stockFilter === key}
            className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold ring-1 transition ${
              stockFilter === key ? 'bg-ink-900 text-white ring-ink-900' : `bg-white ${tone} ring-slate-200 hover:ring-slate-300`
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${stockFilter === key ? 'bg-white/15' : 'bg-slate-100 text-slate-600'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by title or brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
            className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
            className="h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name} ({category.itemCount})
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="Sort products"
            className="h-11 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="price-high">Price: high to low</option>
            <option value="price-low">Price: low to high</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white shadow-md transition hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center gap-2 rounded-2xl bg-ink-900 p-3 text-white shadow-xl">
          <span className="px-1 text-xs font-bold">{selected.size} selected</span>
          <button disabled={isBulkBusy} onClick={() => bulkUpdate({ availability: 'available' }, 'marked available')} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 disabled:opacity-50">
            Available
          </button>
          <button disabled={isBulkBusy} onClick={() => bulkUpdate({ availability: 'preorder' }, 'set to pre-order')} className="rounded-xl bg-amber-400/20 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-400/30 disabled:opacity-50">
            Pre-order
          </button>
          <button disabled={isBulkBusy} onClick={() => bulkUpdate({ availability: 'out_of_stock' }, 'marked out of stock')} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 disabled:opacity-50">
            Out of stock
          </button>
          <button disabled={isBulkBusy} onClick={() => bulkUpdate({ isFeatured: true }, 'featured')} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 disabled:opacity-50">
            Feature
          </button>
          <button disabled={isBulkBusy} onClick={() => bulkUpdate({ isFeatured: false }, 'un-featured')} className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 disabled:opacity-50">
            Un-feature
          </button>
          <select
            disabled={isBulkBusy}
            value=""
            onChange={(e) => {
              const slug = e.target.value;
              if (slug && confirm(`Move ${selected.size} product(s) to "${categoryName(slug)}"?`)) {
                bulkUpdate({ category: slug }, `moved to ${categoryName(slug)}`);
              }
            }}
            aria-label="Move selected products to category"
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white focus:outline-none [&>option]:text-slate-900"
          >
            <option value="">Move to…</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <button onClick={() => setSelected(new Set())} aria-label="Clear selection" className="ml-auto rounded-xl p-2 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No products match these filters.{' '}
          <button type="button" onClick={onCreate} className="font-bold text-emerald-700">
            Add a product
          </button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            <button type="button" onClick={toggleSelectAll} className="inline-flex items-center gap-2 px-1 text-xs font-bold text-slate-600">
              {allVisibleSelected ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4" />}
              Select all {visible.length}
            </button>
            {visible.map((p) => {
              const reasons = attentionReasons(p);
              return (
                <div key={p.id} className={`rounded-2xl border bg-white p-3.5 shadow-xs ${selected.has(p.id) ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-3">
                    <button type="button" onClick={() => toggleSelect(p.id)} aria-label={`Select ${p.name}`} className="mt-1 text-slate-400">
                      {selected.has(p.id) ? <CheckSquare className="h-5 w-5 text-emerald-600" /> : <Square className="h-5 w-5" />}
                    </button>
                    {renderThumb(p, "h-16 w-16")}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-extrabold text-slate-950">{p.name}</p>
                      <p className="truncate text-xs text-slate-500">
                        {p.brand || 'No brand'} · {categoryName(p.category)}
                      </p>
                      <p className="mt-1 text-sm font-black text-emerald-700">
                        {currencySymbol}
                        {p.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {reasons.length > 0 && <p className="mt-2 text-[11px] font-semibold text-orange-600">⚠ {reasons.join(' · ')}</p>}
                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                    {renderStockSwitch(p)}
                    {renderFeatureButton(p)}
                    <button
                      type="button"
                      onClick={() => onEdit(p)}
                      className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-700"
                    >
                      <Edit3 className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      disabled={busyIds.has(p.id)}
                      aria-label={`Delete ${p.name}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs lg:block">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="w-10 p-4">
                    <button type="button" onClick={toggleSelectAll} aria-label="Select all visible products">
                      {allVisibleSelected ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4" />}
                    </button>
                  </th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((p) => {
                  const reasons = attentionReasons(p);
                  return (
                    <tr key={p.id} className={`transition-colors ${selected.has(p.id) ? 'bg-emerald-50/50' : 'hover:bg-slate-50/80'}`}>
                      <td className="p-4">
                        <button type="button" onClick={() => toggleSelect(p.id)} aria-label={`Select ${p.name}`} className="text-slate-400">
                          {selected.has(p.id) ? <CheckSquare className="h-4 w-4 text-emerald-600" /> : <Square className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {renderThumb(p, "h-12 w-12")}
                          <div className="min-w-0">
                            <button type="button" onClick={() => onEdit(p)} className="block max-w-xs truncate text-left text-sm font-extrabold text-slate-950 hover:text-emerald-700">
                              {p.name}
                            </button>
                            <div className="text-[11px] text-slate-500">
                              {p.brand || 'No brand'}
                              {p.badge && <span className="ml-1.5 rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700">{p.badge}</span>}
                            </div>
                            {reasons.length > 0 && <div className="text-[10px] font-semibold text-orange-600">⚠ {reasons.join(' · ')}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{categoryName(p.category)}</span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-black text-emerald-700">
                          {currencySymbol}
                          {p.price.toLocaleString()}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[11px] text-slate-400 line-through">
                            {currencySymbol}
                            {p.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        {renderStockSwitch(p)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {renderFeatureButton(p)}
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 font-bold text-slate-700 transition hover:bg-slate-200"
                          >
                            <Edit3 className="h-4 w-4" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p)}
                            disabled={busyIds.has(p.id)}
                            aria-label={`Delete ${p.name}`}
                            className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
