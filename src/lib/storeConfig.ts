import { DEFAULT_STORE_CONFIG } from '@/data/storeCatalog';
import type { StoreConfig } from '@/types/ecommerce';

/**
 * The store_configs row that existed before admin saving was added came from an old seed
 * (stale tagline, banner, logo and brand list). Rows last written before this moment are
 * ignored so the live site doesn't silently revert; the first admin save takes over.
 */
export const ADMIN_MANAGED_SINCE = new Date('2026-10-01T00:00:00Z');

const LEGACY_LOGO_URLS = new Set(['/gnaathcommlogo.png']);

const TEXT_LIMITS: Partial<Record<keyof StoreConfig, number>> = {
  storeName: 120,
  motto: 120,
  rcNumber: 40,
  tagline: 160,
  whatsappDisplayNumber: 30,
  facebookName: 120,
  bannerAnnouncement: 200,
  headOfficeAddress: 300,
  headOfficeLandmark: 200,
  branchOfficeAddress: 300,
  branchOfficeLandmark: 200,
  businessHours: 120,
};

type StoredConfigRow = Partial<StoreConfig> & { updatedAt?: Date | string | null };

export function effectiveStoreConfig(row: StoredConfigRow | null | undefined): StoreConfig {
  if (!row?.updatedAt || new Date(row.updatedAt) < ADMIN_MANAGED_SINCE) return { ...DEFAULT_STORE_CONFIG };

  const merged = { ...DEFAULT_STORE_CONFIG };
  for (const key of Object.keys(DEFAULT_STORE_CONFIG) as (keyof StoreConfig)[]) {
    const value = row[key];
    if (key === 'brands') {
      if (Array.isArray(value) && value.length > 0) merged.brands = value as string[];
    } else if (typeof value === 'string' && value.trim()) {
      (merged as unknown as Record<string, unknown>)[key] = value;
    }
  }
  if (LEGACY_LOGO_URLS.has(merged.logoUrl)) merged.logoUrl = DEFAULT_STORE_CONFIG.logoUrl;
  return merged;
}

export type ParsedStoreConfig = { ok: true; config: StoreConfig } | { ok: false; error: string };

/** Validates an admin settings save on top of the current settings. Currency stays fixed (checkout is NGN). */
export function parseStoreConfigInput(body: Record<string, unknown>, current: StoreConfig): ParsedStoreConfig {
  const next: StoreConfig = { ...current };

  for (const [key, max] of Object.entries(TEXT_LIMITS) as [keyof StoreConfig, number][]) {
    if (body[key] === undefined) continue;
    const value = typeof body[key] === 'string' ? (body[key] as string).trim() : '';
    if (!value) return { ok: false, error: `${key} cannot be empty.` };
    (next as unknown as Record<string, unknown>)[key] = value.slice(0, max);
  }

  if (body.whatsappNumber !== undefined) {
    const phone = String(body.whatsappNumber).replace(/[\s()-]/g, '');
    if (!/^\+?\d{7,15}$/.test(phone)) return { ok: false, error: 'Enter a valid WhatsApp number, e.g. +2347034791996.' };
    next.whatsappNumber = phone;
  }

  if (body.email !== undefined) {
    const email = String(body.email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Enter a valid contact email.' };
    next.email = email.slice(0, 120);
  }

  if (body.facebookUrl !== undefined) {
    const url = String(body.facebookUrl).trim();
    try {
      if (new URL(url).protocol !== 'https:') throw new Error();
      next.facebookUrl = url;
    } catch {
      return { ok: false, error: 'Facebook link must start with https://' };
    }
  }

  if (body.logoUrl !== undefined) {
    const url = String(body.logoUrl).trim();
    const isLocal = /^\/[\w./-]+$/.test(url);
    let isHttps = false;
    try {
      isHttps = new URL(url).protocol === 'https:';
    } catch {}
    if (!isLocal && !isHttps) return { ok: false, error: 'Logo must be an uploaded image or a /path in the site.' };
    next.logoUrl = url;
  }

  if (body.brands !== undefined) {
    if (!Array.isArray(body.brands)) return { ok: false, error: 'Brands must be a list.' };
    const brands = Array.from(
      new Set(body.brands.filter((b): b is string => typeof b === 'string').map((b) => b.trim().slice(0, 40)).filter(Boolean))
    ).slice(0, 40);
    if (brands.length === 0) return { ok: false, error: 'Keep at least one brand.' };
    next.brands = brands;
  }

  return { ok: true, config: next };
}
