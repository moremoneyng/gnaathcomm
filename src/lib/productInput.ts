import type { ProductOption } from '@/types/ecommerce';

export type Availability = 'available' | 'preorder' | 'out_of_stock';
export const AVAILABILITY_VALUES: Availability[] = ['available', 'preorder', 'out_of_stock'];

/** One shopper-facing status from the stored flags. Pre-order wins over stock counts. */
export function productAvailability(product: { inStock: boolean; isPreorder?: boolean | null }): Availability {
  if (!product.inStock) return 'out_of_stock';
  return product.isPreorder ? 'preorder' : 'available';
}

export const MAX_PRODUCT_IMAGES = 8;
export const MAX_STOCK_QUANTITY = 100_000;
/** Tracked products at or below this many units are flagged as low stock. */
export const LOW_STOCK_THRESHOLD = 3;

/** Validated product fields, ready to hand to Prisma (category is resolved by the route). */
export interface ProductData {
  name?: string;
  brand?: string | null;
  price?: number;
  originalPrice?: number | null;
  image?: string;
  images?: string[];
  video?: string | null;
  description?: string;
  features?: string[];
  options?: ProductOption[] | null;
  badge?: string | null;
  inStock?: boolean;
  stockQuantity?: number | null;
  isPreorder?: boolean;
  preorderNote?: string | null;
  isFeatured?: boolean;
}

export type ParsedProduct =
  | { ok: true; data: ProductData; categorySlug?: string }
  | { ok: false; error: string };

function isMediaUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function stringList(value: unknown, maxItems: number, maxLength: number) {
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.split('\n') : [];
  return items
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function parseOptions(value: unknown): ProductOption[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((option) => ({
      name: text(option?.name, 40),
      values: Array.from(new Set(stringList(option?.values, 20, 60))),
    }))
    .filter((option) => option.name && option.values.length > 0)
    .slice(0, 5);
}

/**
 * Parses an admin product payload. In `create` mode required fields must be present; in
 * `update` mode only the fields that are sent are changed, so partial quick-edits are safe.
 */
export function parseProductInput(body: Record<string, unknown>, mode: 'create' | 'update'): ParsedProduct {
  const data: ProductData = {};
  const has = (key: string) => body[key] !== undefined;

  if (mode === 'create' || has('name')) {
    const name = text(body.name, 200);
    if (!name) return { ok: false, error: 'Product name is required.' };
    data.name = name;
  }

  let categorySlug: string | undefined;
  if (mode === 'create' || has('category')) {
    categorySlug = text(body.category, 120);
    if (!categorySlug) return { ok: false, error: 'Choose a category for this product.' };
  }

  if (mode === 'create' || has('price')) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) return { ok: false, error: 'Selling price must be greater than zero.' };
    data.price = price;
  }

  if (has('originalPrice')) {
    if (body.originalPrice === null || body.originalPrice === '') {
      data.originalPrice = null;
    } else {
      const originalPrice = Number(body.originalPrice);
      if (!Number.isFinite(originalPrice) || originalPrice < 0) {
        return { ok: false, error: 'Original price must be a valid number.' };
      }
      data.originalPrice = originalPrice || null;
    }
  }

  if (has('images') || has('image') || mode === 'create') {
    const candidates = Array.isArray(body.images) ? body.images : [];
    const images = Array.from(new Set(candidates.filter(isMediaUrl).map((url) => url.trim())));
    if (images.length === 0 && isMediaUrl(body.image)) images.push(body.image.trim());
    if (images.length === 0) return { ok: false, error: 'Add at least one product image.' };
    if (images.length > MAX_PRODUCT_IMAGES) {
      return { ok: false, error: `A product can have at most ${MAX_PRODUCT_IMAGES} images.` };
    }
    data.images = images;
    data.image = images[0];
  }

  if (has('video')) {
    data.video = isMediaUrl(body.video) ? body.video.trim() : null;
  }

  if (has('brand') || mode === 'create') {
    data.brand = text(body.brand, 80) || (mode === 'create' ? 'G Naath Global' : null);
  }

  if (has('description') || mode === 'create') data.description = text(body.description, 5000);
  if (has('features') || mode === 'create') data.features = stringList(body.features, 20, 160);
  if (has('options') || mode === 'create') {
    const options = parseOptions(body.options);
    data.options = options.length > 0 ? options : null;
  }
  if (has('badge') || mode === 'create') data.badge = text(body.badge, 40) || null;
  if (has('inStock') || mode === 'create') data.inStock = body.inStock === undefined ? true : Boolean(body.inStock);
  if (has('isFeatured') || mode === 'create') data.isFeatured = Boolean(body.isFeatured);

  // Empty means "don't track stock"; a number means tracked, and availability follows it.
  if (has('stockQuantity')) {
    if (body.stockQuantity === null || body.stockQuantity === '') {
      data.stockQuantity = null;
    } else {
      const quantity = Number(body.stockQuantity);
      if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_STOCK_QUANTITY) {
        return { ok: false, error: 'Stock quantity must be a whole number of 0 or more.' };
      }
      data.stockQuantity = quantity;
      data.inStock = quantity > 0;
    }
  }

  // The admin's explicit status wins over the stock-derived default above.
  if (has('availability')) {
    const availability = body.availability as Availability;
    if (!AVAILABILITY_VALUES.includes(availability)) {
      return { ok: false, error: 'Choose Available, Pre-order or Out of stock.' };
    }
    data.isPreorder = availability === 'preorder';
    if (availability === 'preorder') data.inStock = true;
    else if (availability === 'out_of_stock') data.inStock = false;
    else data.inStock = data.stockQuantity === undefined || data.stockQuantity === null ? true : data.stockQuantity > 0;
  } else if (mode === 'create') {
    data.isPreorder = false;
  }

  if (has('preorderNote') || mode === 'create') data.preorderNote = text(body.preorderNote, 80) || null;

  return { ok: true, data, categorySlug };
}

export function productSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
  return `${base || 'product'}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
