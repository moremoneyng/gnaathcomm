'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Store, Wrench, Sun, PhoneCall, ShoppingBag } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { cartCount, setIsCartOpen } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (sectionId: string) => {
    if (pathname !== '/') {
      router.push(`/#${sectionId}`);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isContactPage = pathname === '/contact';

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-xl px-3 py-2 flex items-center justify-around shadow-xl">
      <button
        onClick={() => handleNavClick('catalog')}
        className={`flex flex-col items-center gap-1 transition-colors p-1 ${
          !isContactPage ? 'text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-950'
        }`}
      >
        <Store className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Store</span>
      </button>

      <button
        onClick={() => handleNavClick('repairs')}
        className="flex flex-col items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors p-1"
      >
        <Wrench className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Repairs</span>
      </button>

      <button
        onClick={() => handleNavClick('solar')}
        className="flex flex-col items-center gap-1 text-slate-600 hover:text-amber-600 transition-colors p-1"
      >
        <Sun className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Solar</span>
      </button>

      <Link
        href="/contact"
        className={`flex flex-col items-center gap-1 transition-colors p-1 ${
          isContactPage ? 'text-emerald-600 font-bold' : 'text-slate-600 hover:text-emerald-600'
        }`}
      >
        <PhoneCall className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Contact</span>
      </Link>

      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors p-1"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold">Cart</span>
      </button>
    </div>
  );
};

export default MobileBottomNav;
