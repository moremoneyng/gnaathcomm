'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CategoryIcon } from '@/components/CategoryIcon';
import { MultiImageUploader } from '@/components/MultiImageUploader';
import {
  CATEGORY_ICON_NAMES,
  DEFAULT_CATEGORY_ICON,
  defaultCategoryDescription,
  suggestCategoryIcon,
} from '@/lib/categoryIntelligence';
import type { AdminCategory } from '@/types/ecommerce';
import { Edit3, Layers, Plus, RefreshCw, Sparkles, Trash2, X } from 'lucide-react';

type Notify = (message: string, type?: 'success' | 'error' | 'info') => void;

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10';

interface CategoryEditorDialogProps {
  category: AdminCategory | null;
  onClose: () => void;
  onSaved: (category: { slug: string }) => void;
  notify: Notify;
}

/** Create or edit a category. Leaving the icon on "Auto" lets the store pick one from the name. */
export function CategoryEditorDialog({ category, onClose, onSaved, notify }: CategoryEditorDialogProps) {
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [iconName, setIconName] = useState(category?.customIcon ? category.iconName : '');
  const [image, setImage] = useState(category?.image || '');
  const [isSaving, setIsSaving] = useState(false);

  const autoIcon = suggestCategoryIcon(name, description);
  const effectiveIcon = iconName || autoIcon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: category ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(category && { id: category.id }),
          name,
          description,
          iconName: iconName || (category ? '' : autoIcon),
          image,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save category');
      notify(category ? 'Category updated' : 'Category created', 'success');
      onSaved(data.category);
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to save category', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
        className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h3 id="category-dialog-title" className="text-base font-extrabold text-slate-950">
            {category ? `Edit “${category.name}”` : 'New category'}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-950">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div>
            <label htmlFor="cat-name" className="mb-1.5 block text-xs font-bold text-slate-700">Name *</label>
            <input id="cat-name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smart Watches" className={inputClass} />
            {category && (
              <p className="mt-1.5 text-[11px] text-slate-500">
                Shop link stays <span className="font-mono">/shop?category={category.slug}</span> so shared links keep working.
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="cat-description" className="text-xs font-bold text-slate-700">Description</label>
              {name.trim() && (
                <button
                  type="button"
                  onClick={() => setDescription(defaultCategoryDescription(name))}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Write one for me
                </button>
              )}
            </div>
            <textarea
              id="cat-description"
              rows={3}
              maxLength={500}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Shown at the top of the shop when this category is selected"
              className={inputClass}
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-bold text-slate-700">Icon</legend>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
              <button
                type="button"
                onClick={() => setIconName('')}
                aria-pressed={!iconName}
                title={`Auto (${autoIcon})`}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-[9px] font-bold ring-1 transition ${
                  !iconName ? 'bg-emerald-600 text-white ring-emerald-600' : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Auto
              </button>
              {CATEGORY_ICON_NAMES.filter((icon) => icon !== DEFAULT_CATEGORY_ICON).map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setIconName(icon)}
                  aria-pressed={iconName === icon}
                  aria-label={icon}
                  title={icon}
                  className={`flex aspect-square items-center justify-center rounded-xl ring-1 transition ${
                    iconName === icon
                      ? 'bg-ink-900 text-white ring-ink-900'
                      : !iconName && autoIcon === icon
                        ? 'bg-emerald-50 text-emerald-700 ring-emerald-300'
                        : 'bg-white text-slate-600 ring-slate-200 hover:ring-slate-300'
                  }`}
                >
                  <CategoryIcon name={icon} className="h-4.5 w-4.5" />
                </button>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
              Showing as <CategoryIcon name={effectiveIcon} className="h-3.5 w-3.5 text-emerald-600" />
              {!iconName && <span>(picked automatically from the name)</span>}
            </p>
          </fieldset>

          <MultiImageUploader
            currentImages={image ? [image] : []}
            onUploadSuccess={(urls) => setImage(urls[0] || '')}
            label="Cover image (optional)"
            maxImages={1}
            hint={
              category?.fallbackImage && !image
                ? 'No cover set: the shop uses the newest product photo in this category.'
                : 'Shown on the category tile. Without one, the newest product photo is used.'
            }
          />
        </div>

        <div className="flex gap-3 border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="h-12 flex-1 rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
            Cancel
          </button>
          <button type="submit" disabled={isSaving} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-extrabold text-white disabled:opacity-60">
            {isSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
            {category ? 'Save category' : 'Create category'}
          </button>
        </div>
      </form>
    </div>
  );
}

interface CategoryManagerProps {
  categories: AdminCategory[];
  onChanged: () => Promise<void> | void;
  notify: Notify;
}

export function CategoryManager({ categories, onChanged, notify }: CategoryManagerProps) {
  const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [moveTo, setMoveTo] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const totalProducts = categories.reduce((sum, c) => sum + c.itemCount, 0);

  const startDelete = (category: AdminCategory) => {
    if (category.itemCount === 0) {
      if (confirm(`Delete the empty category "${category.name}"?`)) void confirmDelete(category, '');
      return;
    }
    setMoveTo(categories.find((c) => c.id !== category.id)?.id || '');
    setDeleting(category);
  };

  const confirmDelete = async (category: AdminCategory, target: string) => {
    setIsDeleting(true);
    try {
      const params = new URLSearchParams({ id: category.id });
      if (target) params.set('moveTo', target);
      const res = await fetch(`/api/admin/categories?${params}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete category');
      await onChanged();
      setDeleting(null);
      notify(data.moved ? `Category deleted. ${data.moved} product(s) moved.` : 'Category deleted', 'success');
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-950">
            <Layers className="h-4 w-4 text-emerald-600" /> {categories.length} categories · {totalProducts} products
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Empty categories are hidden from shoppers automatically. Busiest categories are shown first.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white shadow-md hover:bg-emerald-500"
        >
          <Plus className="h-4 w-4" /> New category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => {
          const cover = category.image || category.fallbackImage;
          return (
            <div key={category.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink-900 text-white">
                {cover && <Image src={cover} alt="" fill sizes="64px" className="object-cover opacity-60" />}
                <span className="absolute inset-0 flex items-center justify-center">
                  <CategoryIcon name={category.iconName} className="h-6 w-6" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-950">{category.name}</p>
                <p className="text-[11px] text-slate-500">
                  {category.itemCount} product{category.itemCount === 1 ? '' : 's'}
                  {category.itemCount === 0 && <span className="ml-1 font-semibold text-amber-600">· hidden in shop</span>}
                </p>
                {category.description && <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{category.description}</p>}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(category)}
                  aria-label={`Edit ${category.name}`}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => startDelete(category)}
                  aria-label={`Delete ${category.name}`}
                  className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <CategoryEditorDialog
          category={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await onChanged();
          }}
          notify={notify}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-category-title" className="w-full max-w-md space-y-4 rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <h3 id="delete-category-title" className="text-base font-extrabold text-slate-950">
              Delete “{deleting.name}”?
            </h3>
            <p className="text-sm text-slate-600">
              It has <strong>{deleting.itemCount}</strong> product{deleting.itemCount === 1 ? '' : 's'}. They will be moved
              to the category you pick below — nothing is deleted except the category itself.
            </p>
            {categories.length > 1 ? (
              <select value={moveTo} onChange={(e) => setMoveTo(e.target.value)} aria-label="Move products to" className={inputClass}>
                {categories
                  .filter((c) => c.id !== deleting.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Move to {c.name} ({c.itemCount})
                    </option>
                  ))}
              </select>
            ) : (
              <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                Create another category first so these products have somewhere to go.
              </p>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleting(null)} className="h-12 flex-1 rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || !moveTo}
                onClick={() => confirmDelete(deleting, moveTo)}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 text-sm font-extrabold text-white disabled:opacity-50"
              >
                {isDeleting && <RefreshCw className="h-4 w-4 animate-spin" />}
                Move &amp; delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
