'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  ShoppingBag,
  Heart,
  Search,
  PhoneCall,
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  PackageCheck,
} from 'lucide-react';
import { cleanPhoneNumber } from '@/utils/whatsapp';

export const Navbar: React.FC = () => {
  const {
    storeConfig,
    cartCount,
    wishlistCount,
    setIsCartOpen,
    searchQuery,
    setSearchQuery,
    user,
    logoutUser,
    showToast,
  } = useStore();

  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const cleanPhone = cleanPhoneNumber(storeConfig.whatsappNumber);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    await logoutUser();
    showToast('Signed out successfully', 'info');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-6">
          
          {/* Logo */}
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <Link
              href="/shop"
              className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                pathname === '/shop'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              Shop All
            </Link>

            <Link
              href="/shop?category=smartphones"
              className={`hover:text-emerald-600 font-bold transition-colors py-1.5 ${
                pathname === '/shop' ? 'text-slate-900' : ''
              }`}
            >
              Smartphones
            </Link>

            <Link
              href="/repairs"
              className={`hover:text-emerald-600 font-bold transition-colors py-1.5 ${
                pathname === '/repairs' ? 'text-emerald-600 font-black' : ''
              }`}
            >
              Phone Repairs
            </Link>

            <Link
              href="/solar"
              className={`hover:text-emerald-600 font-bold transition-colors py-1.5 ${
                pathname === '/solar' ? 'text-emerald-600 font-black' : ''
              }`}
            >
              Solar Energy
            </Link>

            <Link
              href="/contact"
              className={`hover:text-emerald-600 font-bold transition-colors py-1.5 ${
                pathname === '/contact' ? 'text-emerald-600 font-black' : ''
              }`}
            >
              Contact Us
            </Link>
          </nav>

          {/* Right Action Icons */}
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

            {/* Cart */}
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

            {/* User Auth: Profile Dropdown OR Sign In Button */}
            {user ? (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full pl-2 pr-3 py-1.5 text-xs font-bold transition-all group"
                  id="user-menu-button"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 animate-in slide-in-from-top-2 duration-150 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      My Dashboard
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <PackageCheck className="w-4 h-4 text-emerald-600" />
                      My Orders
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden lg:flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white rounded-full px-4 py-2 text-xs font-bold transition-all"
              >
                <User className="w-3.5 h-3.5" />
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full hover:bg-slate-100 text-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-down Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-4 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          
          {/* Mobile Auth Header */}
          {user ? (
            <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-900 text-white font-extrabold text-xs text-center transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs text-center transition-all"
              >
                Register
              </Link>
            </div>
          )}

          <div className="flex flex-col space-y-2 text-sm font-bold text-slate-800">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-3 rounded-2xl transition-all flex items-center justify-between ${
                pathname === '/shop' ? 'bg-emerald-600 text-white font-extrabold shadow-sm' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span>Shop All Products</span>
              <span className="text-xs opacity-75">→</span>
            </Link>

            <Link
              href="/shop?category=smartphones"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-3 rounded-2xl transition-all flex items-center justify-between ${
                pathname === '/shop' ? 'bg-slate-100 text-slate-900' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span>Smartphones</span>
              <span className="text-xs opacity-75">→</span>
            </Link>

            <Link
              href="/repairs"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-3 rounded-2xl transition-all flex items-center justify-between ${
                pathname === '/repairs' ? 'bg-emerald-600 text-white font-extrabold shadow-sm' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span>Phone Repair Services</span>
              <span className="text-xs opacity-75">→</span>
            </Link>

            <Link
              href="/solar"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-3 rounded-2xl transition-all flex items-center justify-between ${
                pathname === '/solar' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span>Solar Energy Systems</span>
              <span className="text-xs opacity-75">→</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-3 rounded-2xl transition-all flex items-center justify-between ${
                pathname === '/contact' ? 'bg-emerald-600 text-white font-extrabold shadow-sm' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <span>Contact &amp; Store Locations</span>
              <span className="text-xs opacity-75">→</span>
            </Link>

            {user && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-left font-bold text-sm border border-rose-100 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>

          {/* Quick Action Button inside Mobile Drawer */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Contact Store on WhatsApp ({storeConfig.whatsappDisplayNumber})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
