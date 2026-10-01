'use client';

import React, { useState } from 'react';
import { MultiImageUploader } from '@/components/MultiImageUploader';
import type { StoreConfig } from '@/types/ecommerce';
import { Plus, RefreshCw, Settings, X } from 'lucide-react';

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none';

type TextKey = Exclude<keyof StoreConfig, 'brands' | 'logoUrl' | 'currencySymbol' | 'currencyCode'>;

const SECTIONS: { title: string; fields: { key: TextKey; label: string; type?: string; wide?: boolean }[] }[] = [
  {
    title: 'Business',
    fields: [
      { key: 'storeName', label: 'Store name' },
      { key: 'rcNumber', label: 'RC registration number' },
      { key: 'motto', label: 'Motto' },
      { key: 'tagline', label: 'Tagline' },
      { key: 'bannerAnnouncement', label: 'Banner announcement', wide: true },
      { key: 'businessHours', label: 'Business hours' },
    ],
  },
  {
    title: 'Contact',
    fields: [
      { key: 'whatsappNumber', label: 'WhatsApp number (with country code)', type: 'tel' },
      { key: 'whatsappDisplayNumber', label: 'Phone number as shown to customers', type: 'tel' },
      { key: 'email', label: 'Contact email', type: 'email' },
      { key: 'facebookName', label: 'Facebook page name' },
      { key: 'facebookUrl', label: 'Facebook page link', type: 'url', wide: true },
    ],
  },
  {
    title: 'Branches',
    fields: [
      { key: 'headOfficeAddress', label: 'Lagos head office address', wide: true },
      { key: 'headOfficeLandmark', label: 'Lagos landmark', wide: true },
      { key: 'branchOfficeAddress', label: 'Abia branch address', wide: true },
      { key: 'branchOfficeLandmark', label: 'Abia landmark', wide: true },
    ],
  },
];

interface StoreSettingsFormProps {
  config: StoreConfig;
  onSave: (config: Partial<StoreConfig>) => Promise<boolean>;
}

export function StoreSettingsForm({ config, onSave }: StoreSettingsFormProps) {
  const [form, setForm] = useState<StoreConfig>(config);
  const [newBrand, setNewBrand] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = JSON.stringify(form) !== JSON.stringify(config);

  const addBrand = () => {
    const brand = newBrand.trim();
    if (brand && !form.brands.some((b) => b.toLowerCase() === brand.toLowerCase())) {
      setForm({ ...form, brands: [...form.brands, brand] });
    }
    setNewBrand('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Currency is fixed server-side (checkout is NGN), so sending it is harmless.
    await onSave(form);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-950">
          <Settings className="h-5 w-5 text-emerald-600" /> Store settings
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Saved to the database and shown to every customer on every device.
        </p>
      </div>

      {SECTIONS.map((section) => (
        <fieldset key={section.title} className="space-y-3">
          <legend className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{section.title}</legend>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {section.fields.map(({ key, label, type, wide }) => (
              <div key={key} className={wide ? 'sm:col-span-2' : ''}>
                <label htmlFor={`cfg-${key}`} className="mb-1 block text-xs font-bold text-slate-700">{label}</label>
                <input
                  id={`cfg-${key}`}
                  type={type || 'text'}
                  required
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={`${inputClass} ${type === 'tel' ? 'font-mono' : ''}`}
                />
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="space-y-3">
        <legend className="mb-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Brands (suggested when adding products)</legend>
        <div className="flex flex-wrap gap-2">
          {form.brands.map((brand) => (
            <span key={brand} className="inline-flex items-center gap-1 rounded-full bg-slate-100 py-1 pl-3 pr-1 text-xs font-bold text-slate-700">
              {brand}
              <button
                type="button"
                onClick={() => setForm({ ...form, brands: form.brands.filter((b) => b !== brand) })}
                disabled={form.brands.length <= 1}
                aria-label={`Remove ${brand}`}
                className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-rose-600 disabled:opacity-30"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addBrand();
              }
            }}
            placeholder="Add a brand, e.g. Oraimo"
            aria-label="New brand"
            className={inputClass}
          />
          <button type="button" onClick={addBrand} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 px-4 text-xs font-bold text-slate-700 hover:bg-slate-200">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </fieldset>

      <MultiImageUploader
        currentImages={form.logoUrl ? [form.logoUrl] : []}
        onUploadSuccess={(urls) => setForm({ ...form, logoUrl: urls[0] || config.logoUrl })}
        label="Logo"
        maxImages={1}
        hint="Shown in the header and footer. Removing it restores the current logo."
      />

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        {isDirty && (
          <button type="button" onClick={() => setForm(config)} className="rounded-xl px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100">
            Discard changes
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving || !isDirty}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-extrabold text-white shadow-md transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {isSaving && <RefreshCw className="h-4 w-4 animate-spin" />}
          {isDirty ? 'Save store settings' : 'All changes saved'}
        </button>
      </div>
    </form>
  );
}
