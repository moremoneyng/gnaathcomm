'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MultiImageUploader } from '@/components/MultiImageUploader';
import { VideoUploader } from '@/components/VideoUploader';
import { suggestCategoryForProduct } from '@/lib/categoryIntelligence';
import { LOW_STOCK_THRESHOLD, MAX_PRODUCT_IMAGES, productAvailability, type Availability } from '@/lib/productInput';
import type { AdminCategory, Product } from '@/types/ecommerce';
import { CheckCircle2, Clock, PackageX, Plus, RefreshCw, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';

const BADGE_PRESETS = ['New Arrival', 'Hot Deal', 'Best Seller', 'Limited Stock', 'Brand New', 'UK Used'];
const PREORDER_PRESETS = ['Ships in 1 week', 'Ships in 2–3 weeks', 'Arrives next month', 'Ships on release day'];

const AVAILABILITY_OPTIONS: {
  value: Availability;
  title: string;
  text: string;
  icon: React.ElementType;
  active: string;
}[] = [
  { value: 'available', title: 'Available', text: 'In stock, ships right away', icon: CheckCircle2, active: 'bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500' },
  { value: 'preorder', title: 'Pre-order', text: 'Customers pay now, you ship later', icon: Clock, active: 'bg-amber-50 text-amber-900 ring-2 ring-amber-400' },
  { value: 'out_of_stock', title: 'Out of stock', text: 'Visible, but can’t be ordered', icon: PackageX, active: 'bg-rose-50 text-rose-800 ring-2 ring-rose-400' },
];

interface OptionRow {
  name: string;
  values: string;
}

interface ProductFormModalProps {
  product: Product | null;
  categories: AdminCategory[];
  brandSuggestions: string[];
  currencySymbol: string;
  onClose: () => void;
  onSaved: (mode: 'created' | 'updated') => void;
  onRequestNewCategory: () => void;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10';
const labelClass = 'mb-1.5 block text-xs font-bold text-slate-700';

export function ProductFormModal({
  product,
  categories,
  brandSuggestions,
  currencySymbol,
  onClose,
  onSaved,
  onRequestNewCategory,
  notify,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);

  const initial = useMemo(
    () => ({
      name: product?.name || '',
      category: product?.category || '',
      brand: product?.brand || '',
      price: product ? String(product.price) : '',
      originalPrice: product?.originalPrice ? String(product.originalPrice) : '',
      images: product ? Array.from(new Set([product.image, ...(product.images || [])].filter(Boolean))) : [],
      video: product?.video || '',
      description: product?.description || '',
      features: (product?.features || []).join('\n'),
      badge: product?.badge || '',
      options: (product?.options || []).map((o) => ({ name: o.name, values: o.values.join(', ') })) as OptionRow[],
      availability: (product ? productAvailability(product) : 'available') as Availability,
      preorderNote: product?.preorderNote || '',
      trackStock: typeof product?.stockQuantity === 'number',
      stockQuantity: typeof product?.stockQuantity === 'number' ? String(product.stockQuantity) : '',
      isFeatured: product?.isFeatured ?? false,
    }),
    [product]
  );

  const [form, setForm] = useState(initial);
  const [categoryTouched, setCategoryTouched] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  // Smart category: auto-pick from the name until the admin chooses one themselves.
  const suggestedCategory = useMemo(
    () => (form.name.trim().length >= 3 ? suggestCategoryForProduct({ name: form.name, brand: form.brand }, categories) : null),
    [form.name, form.brand, categories]
  );

  const chosenCategory = (!categoryTouched && suggestedCategory) || form.category;
  const categoryValue = categories.some((c) => c.slug === chosenCategory) ? chosenCategory : '';

  const requestClose = () => {
    if (isDirty && !isSaving && !confirm('Discard your unsaved changes?')) return;
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const price = Number(form.price);
  const originalPrice = Number(form.originalPrice);
  const discount =
    form.originalPrice && price > 0 && originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const suggestedName = categories.find((c) => c.slug === suggestedCategory)?.name;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      notify('Add at least one product image.', 'error');
      return;
    }
    if (!categoryValue) {
      notify('Choose a category for this product.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...(product && { id: product.id }),
        name: form.name,
        category: categoryValue,
        brand: form.brand,
        price: form.price,
        originalPrice: form.originalPrice || null,
        image: form.images[0],
        images: form.images,
        video: form.video,
        description: form.description,
        features: form.features,
        badge: form.badge,
        options: form.options
          .map((o) => ({ name: o.name.trim(), values: o.values.split(',').map((v) => v.trim()).filter(Boolean) }))
          .filter((o) => o.name && o.values.length > 0),
        availability: form.availability,
        preorderNote: form.availability === 'preorder' ? form.preorderNote : '',
        stockQuantity: form.trackStock ? form.stockQuantity || '0' : null,
        isFeatured: form.isFeatured,
      };

      const res = await fetch('/api/products', {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save product');

      notify(product ? 'Product updated' : 'Product uploaded successfully!', 'success');
      onSaved(product ? 'updated' : 'created');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Error saving product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        className="flex max-h-[96vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white text-slate-900 shadow-2xl sm:max-h-[92vh] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="min-w-0">
            <h3 id="product-form-title" className="flex items-center gap-2 text-base font-extrabold text-slate-950">
              <ShoppingBag className="h-5 w-5 shrink-0 text-emerald-600" />
              <span className="truncate">{isEditing ? `Edit: ${product!.name}` : 'Add a new product'}</span>
            </h3>
            {isEditing && product?.updatedAt && (
              <p className="mt-0.5 text-[11px] text-slate-500">Last updated {new Date(product.updatedAt).toLocaleString()}</p>
            )}
          </div>
          <button type="button" onClick={requestClose} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-950">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
          <MultiImageUploader
            currentImages={form.images}
            onUploadSuccess={(urls) => set('images', urls)}
            label="Product photos *"
            maxImages={MAX_PRODUCT_IMAGES}
            hint={
              isEditing
                ? 'Remove a wrong photo with the red bin, reorder with the arrows, or star one to make it the cover. Nothing else on the product changes, and edits apply when you press “Save changes”.'
                : undefined
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="pf-name" className={labelClass}>Product title *</label>
              <input
                id="pf-name"
                required
                maxLength={200}
                placeholder="e.g. iPhone 15 Pro Max 256GB"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="pf-category" className={labelClass}>Category *</label>
              <select
                id="pf-category"
                required
                value={categoryValue}
                onChange={(e) => {
                  setCategoryTouched(true);
                  set('category', e.target.value);
                }}
                className={`${inputClass} font-semibold`}
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name} ({category.itemCount})
                  </option>
                ))}
              </select>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {!categoryTouched && suggestedCategory && categoryValue === suggestedCategory && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" /> Auto-selected from the title
                  </span>
                )}
                {categoryTouched && suggestedCategory && suggestedCategory !== categoryValue && (
                  <button
                    type="button"
                    onClick={() => set('category', suggestedCategory)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Suggested: {suggestedName}
                  </button>
                )}
                <button type="button" onClick={onRequestNewCategory} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-emerald-700">
                  <Plus className="h-3.5 w-3.5" /> New category
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="pf-brand" className={labelClass}>Brand</label>
              <input
                id="pf-brand"
                list="pf-brand-options"
                maxLength={80}
                placeholder="e.g. Apple, Samsung, JBL"
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                className={inputClass}
              />
              <datalist id="pf-brand-options">
                {brandSuggestions.map((brand) => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="pf-price" className={labelClass}>Selling price ({currencySymbol}) *</label>
              <input
                id="pf-price"
                type="number"
                inputMode="decimal"
                min="1"
                step="any"
                required
                placeholder="1350000"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className={`${inputClass} font-mono font-bold`}
              />
            </div>

            <div>
              <label htmlFor="pf-original" className={labelClass}>Original price ({currencySymbol})</label>
              <input
                id="pf-original"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                placeholder="Optional, for discounts"
                value={form.originalPrice}
                onChange={(e) => set('originalPrice', e.target.value)}
                className={`${inputClass} font-mono`}
              />
              {discount > 0 ? (
                <p className="mt-1.5 text-[11px] font-bold text-rose-600">Shoppers will see {discount}% off</p>
              ) : form.originalPrice && price > 0 && originalPrice <= price ? (
                <p className="mt-1.5 text-[11px] text-slate-500">Must be higher than the selling price to show a discount.</p>
              ) : null}
            </div>
          </div>

          <div>
            <label htmlFor="pf-badge" className={labelClass}>Badge</label>
            <input
              id="pf-badge"
              maxLength={40}
              placeholder="Optional label shown on the card"
              value={form.badge}
              onChange={(e) => set('badge', e.target.value)}
              className={inputClass}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {BADGE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => set('badge', form.badge === preset ? '' : preset)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition ${
                    form.badge === preset ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="pf-description" className={labelClass}>Description</label>
            <textarea
              id="pf-description"
              rows={4}
              maxLength={5000}
              placeholder="What makes this product great? Condition, warranty, what's in the box…"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="pf-features" className={labelClass}>Key features <span className="font-medium text-slate-400">(one per line)</span></label>
            <textarea
              id="pf-features"
              rows={3}
              placeholder={'6.7" Super Retina display\n256GB storage\n1 year warranty'}
              value={form.features}
              onChange={(e) => set('features', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Variants <span className="font-medium text-slate-400">(e.g. Color, Storage)</span></span>
              {form.options.length < 5 && (
                <button
                  type="button"
                  onClick={() => set('options', [...form.options, { name: '', values: '' }])}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Add variant
                </button>
              )}
            </div>
            {form.options.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3.5 py-3 text-xs text-slate-500">
                No variants. Shoppers buy this product as is.
              </p>
            ) : (
              <div className="space-y-2">
                {form.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <input
                      aria-label="Variant name"
                      placeholder="Color"
                      value={option.name}
                      onChange={(e) =>
                        set('options', form.options.map((o, i) => (i === index ? { ...o, name: e.target.value } : o)))
                      }
                      className={`${inputClass} w-1/3`}
                    />
                    <input
                      aria-label="Variant values, comma separated"
                      placeholder="Black, Blue, Gold"
                      value={option.values}
                      onChange={(e) =>
                        set('options', form.options.map((o, i) => (i === index ? { ...o, values: e.target.value } : o)))
                      }
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => set('options', form.options.filter((_, i) => i !== index))}
                      aria-label="Remove variant"
                      className="mt-1 rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <VideoUploader currentVideoUrl={form.video} onUploadSuccess={(url) => set('video', url || '')} />

          <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-bold text-slate-900">Availability *</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {AVAILABILITY_OPTIONS.map(({ value, title, text, icon: Icon, active }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('availability', value)}
                  aria-pressed={form.availability === value}
                  className={`flex items-start gap-2.5 rounded-xl p-3 text-left ring-1 transition ${
                    form.availability === value ? active : 'bg-white ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-bold">{title}</span>
                    <span className="block text-[11px] opacity-80">{text}</span>
                  </span>
                </button>
              ))}
            </div>

            {form.availability === 'preorder' && (
              <div>
                <label htmlFor="pf-preorder-note" className={labelClass}>Delivery message for customers</label>
                <input
                  id="pf-preorder-note"
                  maxLength={80}
                  placeholder="e.g. Ships in 2–3 weeks"
                  value={form.preorderNote}
                  onChange={(e) => set('preorderNote', e.target.value)}
                  className={inputClass}
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PREORDER_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => set('preorderNote', preset)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 transition ${
                        form.preorderNote === preset ? 'bg-amber-400 text-ink-900 ring-amber-400' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.availability === 'out_of_stock' && (
              <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
                Customers still see the product, marked “Out of stock”, but can&apos;t order it. Switch back to Available when it&apos;s restocked.
              </p>
            )}

            {form.availability === 'available' && (
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.trackStock}
                    onChange={(e) => set('trackStock', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Count units (optional)
                  <span className="font-medium text-slate-400">· goes out of stock automatically at 0</span>
                </label>
                {form.trackStock && (
                  <div className="flex flex-wrap items-center gap-3">
                    <label htmlFor="pf-qty" className="text-xs font-bold text-slate-700">Units in stock</label>
                    <div className="flex items-center rounded-xl border border-slate-300 bg-white">
                      <button
                        type="button"
                        aria-label="Decrease units"
                        onClick={() => set('stockQuantity', String(Math.max(0, (Number(form.stockQuantity) || 0) - 1)))}
                        className="h-10 w-10 text-lg font-bold text-slate-600 hover:bg-slate-50"
                      >
                        −
                      </button>
                      <input
                        id="pf-qty"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={form.stockQuantity}
                        onChange={(e) => set('stockQuantity', e.target.value)}
                        placeholder="0"
                        className="h-10 w-20 border-x border-slate-200 text-center font-mono text-sm font-bold focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Increase units"
                        onClick={() => set('stockQuantity', String((Number(form.stockQuantity) || 0) + 1))}
                        className="h-10 w-10 text-lg font-bold text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                    {Number(form.stockQuantity) === 0 ? (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">Will show as out of stock</span>
                    ) : Number(form.stockQuantity) <= LOW_STOCK_THRESHOLD ? (
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">Low stock</span>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </fieldset>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:bg-slate-50">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => set('isFeatured', e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              <span className="block text-sm font-bold text-slate-900">Feature on homepage</span>
              <span className="block text-xs text-slate-500">Shown first and in the hero spotlight.</span>
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 bg-white px-5 py-4">
          <button type="button" onClick={requestClose} className="h-12 flex-1 rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || (isEditing && !isDirty)}
            className="flex h-12 flex-2 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-extrabold text-white shadow-md transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : isEditing ? (
              isDirty ? 'Save changes' : 'No changes yet'
            ) : (
              'Upload product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
