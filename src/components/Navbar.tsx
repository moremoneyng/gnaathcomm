'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Heart, Search, PhoneCall } from 'lucide-react';
import { cleanPhoneNumber } from '@/utils/whatsapp';

export const Navbar: React.FC = () => {
  const {
    storeConfig,
    cartCount,
    wishlistCount,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
  } = useStore();

  const [showSearchInput, setShowSearchInput] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const cleanPhone = cleanPhoneNumber(storeConfig.whatsappNumber);

  const scrollToSection = (id: string) => {
    if (pathname !== '/') {
      router.push(`/#${id}`);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-6">
          
          {/* Unboxed Highly Visible Logo */}
          <Link href="/" className="flex items-center group shrink-0 py-1">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16">
              <Image
                src={storeConfig.logoUrl || '/gnaathcommlogo.png'}
                alt={storeConfig.storeName}
                width={64}
                height={64}
                className="object-contain w-full h-full transform group-hover:scale-105 transition-transform"
                priority
              />
            </div>
          </Link>

          {/* Center Text-Only Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-slate-700">
            <button
              onClick={() => scrollToSection('catalog')}
              className="hover:text-slate-950 transition-colors py-1.5"
            >
              Store Catalog
            </button>

            <button
              onClick={() => scrollToSection('catalog')}
              className="hover:text-slate-950 transition-colors py-1.5"
            >
              Smartphones
            </button>

            <button
              onClick={() => scrollToSection('repairs')}
              className="hover:text-slate-950 transition-colors py-1.5"
            >
              Phone Repairs
            </button>

            <button
              onClick={() => scrollToSection('solar')}
              className="hover:text-slate-950 transition-colors py-1.5"
            >
              Solar Energy
            </button>

            <Link
              href="/contact"
              className="hover:text-emerald-600 font-bold transition-colors py-1.5"
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Action Icons & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Search Bar / Toggle */}
            <div className="relative">
              {showSearchInput ? (
                <div className="flex items-center bg-slate-100 border border-slate-300 rounded-full px-3 py-1.5 text-xs">
                  <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search JBL, iPhone, Solar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none w-32 sm:w-48 text-xs"
                  />
                  <button
                    onClick={() => {
                      setShowSearchInput(false);
                      setSearchQuery('');
                    }}
                    className="text-slate-500 hover:text-slate-900 ml-2 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-slate-950 transition-colors"
                  title="Search catalog"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => scrollToSection('catalog')}
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-rose-600 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-emerald-600 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5 text-slate-800" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Direct WhatsApp Pill */}
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
