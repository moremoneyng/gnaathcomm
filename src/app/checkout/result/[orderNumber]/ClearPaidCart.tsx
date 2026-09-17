'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';

export function ClearPaidCart({ paid }: { paid: boolean }) {
  const { clearCart } = useStore();
  const cleared = useRef(false);
  useEffect(() => {
    if (paid && !cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [paid, clearCart]);
  return null;
}
