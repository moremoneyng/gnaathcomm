import React from 'react';
import { Clock, PackageX } from 'lucide-react';
import { productAvailability } from '@/lib/productInput';
import type { Product } from '@/types/ecommerce';

/** Pre-order or out-of-stock label; renders nothing for normally available products. */
export function AvailabilityBadge({ product, tone = 'light' }: { product: Product; tone?: 'light' | 'dark' }) {
  const status = productAvailability(product);
  if (status === 'available') return null;

  if (status === 'preorder') {
    return (
      <span
        className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
          tone === 'dark' ? 'bg-amber-400/15 text-amber-300' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        }`}
      >
        <Clock className="h-3 w-3 shrink-0" />
        <span className="truncate">Pre-order{product.preorderNote ? ` · ${product.preorderNote}` : ''}</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
        tone === 'dark' ? 'bg-rose-400/15 text-rose-300' : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      }`}
    >
      <PackageX className="h-3 w-3 shrink-0" /> Out of stock
    </span>
  );
}
