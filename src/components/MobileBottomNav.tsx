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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-slate-200/90 backdrop-blur-2xl px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around shadow-[0_-10px_25px_rgba(0,0,0,0.08)]">
      <Link
        href="/shop"
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all rounded-xl p-1 active:scale-95 ${
          pathname === '/shop' ? 'text-emerald-600 font-extrabold' : 'text-slate-600 hover:text-slate-950'
        }`}
      >
        <Store className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Shop</span>
      </Link>

      <Link
        href="/repairs"
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all rounded-xl p-1 active:scale-95 ${
          pathname === '/repairs' ? 'text-emerald-600 font-extrabold' : 'text-slate-600 hover:text-emerald-600'
        }`}
      >
        <Wrench className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Repairs</span>
      </Link>

      <Link
        href="/solar"
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all rounded-xl p-1 active:scale-95 ${
          pathname === '/solar' ? 'text-amber-600 font-extrabold' : 'text-slate-600 hover:text-amber-600'
        }`}
      >
        <Sun className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Solar</span>
      </Link>

      <Link
        href="/contact"
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 transition-all rounded-xl p-1 active:scale-95 ${
          isContactPage ? 'text-emerald-600 font-extrabold' : 'text-slate-600 hover:text-emerald-600'
        }`}
      >
        <PhoneCall className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Contact</span>
      </Link>

      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-1 text-slate-600 hover:text-emerald-600 transition-all rounded-xl p-1 active:scale-95"
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
