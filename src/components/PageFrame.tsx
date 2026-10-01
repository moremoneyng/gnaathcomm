'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/** Leaves room for the shop's mobile bottom bar, except on admin pages where that bar is hidden. */
export function PageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className={pathname?.startsWith('/admin') ? '' : 'pb-20 md:pb-0'}>{children}</div>;
}
