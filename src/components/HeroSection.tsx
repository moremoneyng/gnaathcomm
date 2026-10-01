'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency } from '@/utils/whatsapp';
import {
  ArrowDown,
  ArrowRight,
  Bike,
  CarFront,
  House,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sun,
  Truck,
  Wrench,
} from 'lucide-react';

/** How long each product stays in the hero before cross-fading to the next. */
const ROTATE_MS = 6000;

// Each link jumps to the matching category when one exists, otherwise to a sensible fallback.
const QUICK_LINKS = [
  { icon: Smartphone, label: 'Phones', categoryIcon: 'Smartphone', href: '/shop' },
  { icon: Sun, label: 'Solar', categoryIcon: 'Sun', href: '/solar' },
  { icon: House, label: 'Home', categoryIcon: 'Refrigerator', href: '/shop' },
  { icon: CarFront, label: 'Cars', categoryIcon: 'CarFront', href: '/shop' },
  { icon: Bike, label: 'Bikes', categoryIcon: 'Bike', href: '/shop' },
  { icon: Wrench, label: 'Repairs', categoryIcon: null, href: '/repairs' },
];

export const HeroSection: React.FC = () => {
  const { storeConfig, products, openProductModal } = useStore();
  const { categories } = useCategories();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Featured, in-stock products lead the spotlight; newest in-stock items fill the rest.
  const spotlight = useMemo(() => {
    const available = products.filter((p) => p.inStock && p.image);
    const featured = available.filter((p) => p.isFeatured);
    const rest = available.filter((p) => !p.isFeatured);
    return [...featured, ...rest].slice(0, 6);
  }, [products]);

  const current = spotlight.length > 0 ? spotlight[activeIndex % spotlight.length] : null;

  useEffect(() => {
    if (spotlight.length < 2 || isPaused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => setActiveIndex((i) => (i + 1) % spotlight.length), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, spotlight.length, isPaused]);

  const quickLinks = QUICK_LINKS.map((link) => {
    const match = link.categoryIcon && categories.find((category) => category.iconName === link.categoryIcon);
    return { ...link, href: match ? `/shop?category=${encodeURIComponent(match.slug)}` : link.href };
  });

  return (
    <section className="relative isolate overflow-hidden bg-ink-950 text-white">
      {/* Rotating product backdrop. Each product is shown through a soft elliptical
          "spotlight" fade so white studio backgrounds melt into the navy instead of reading as boxes. */}
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        {spotlight.length === 0 ? (
          <Image
            src="/hero-background.jpg"
            alt=""
            fill
            preload
            sizes="100vw"
            className="hero-kenburns object-cover object-[60%_20%] opacity-70 lg:object-[80%_center]"
          />
        ) : (
          spotlight.map((product, index) => {
            const isActive = index === activeIndex % spotlight.length;
            return (
              <div
                key={product.id}
                className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="hero-spotlight absolute inset-x-0 top-0 h-[48%] sm:h-[52%] lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[58%]">
                  <div className={`absolute inset-[12%] lg:inset-[14%] ${isActive ? 'hero-kenburns' : ''}`}>
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      loading={index < 2 ? 'eager' : 'lazy'}
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Phones: product glows at the top and fades into the text below. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-15% via-ink-950/85 via-50% to-ink-950 lg:hidden" />
      {/* Desktop: deep navy behind the copy, opening up to the product on the right. */}
      <div className="absolute inset-0 -z-10 hidden bg-linear-to-r from-ink-950 from-30% via-ink-950/70 via-50% to-transparent to-75% lg:block" />
      {/* Brand glow and a soft fade into the category bar. */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_10%,rgba(34,211,238,0.22),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(52,211,153,0.2),transparent_50%)]" />
      <div className="hero-grid absolute inset-0 -z-10 opacity-60" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-ink-950 to-transparent" />

      <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-end px-4 pb-8 pt-56 sm:min-h-0 sm:px-6 sm:pb-16 sm:pt-[22rem] lg:min-h-[640px] lg:justify-center lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <p className="hero-eyebrow inline-flex items-center gap-2 rounded-full border border-white/15 bg-ink-950/40 px-3.5 py-1.5 text-[11px] font-bold tracking-wide text-emerald-200 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Original, certified and topnotch products.
          </p>

          <h1 className="hero-fade-up mt-5 font-heading text-[2.6rem] font-extrabold leading-[1] tracking-[-0.05em] drop-shadow-[0_4px_30px_rgba(5,13,31,0.6)] sm:text-6xl lg:text-[4.6rem]">
            Everything Modern.
            <span className="text-brand-gradient mt-1 block pb-2">All in One Place.</span>
          </h1>

          <p className="hero-fade-up mt-4 max-w-xl text-[15px] leading-6 sm:mt-5 sm:leading-7 text-slate-200 [animation-delay:120ms] sm:text-lg sm:leading-8">
            Smartphones, electronics, home &amp; office appliances, solar systems, gadgets, cars and bikes —
            plus expert repairs and installations — from one trusted store in Lagos and Abia.
          </p>

          <div className="hero-fade-up mt-7 grid grid-cols-2 gap-2.5 [animation-delay:220ms] sm:mt-8 sm:flex sm:gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-3 py-3.5 text-[13px] font-extrabold sm:gap-2.5 sm:px-7 sm:py-4 sm:text-sm text-ink-900 shadow-[0_10px_40px_-10px_rgba(52,211,153,0.6)] transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <ShoppingBag className="hidden h-4 w-4 sm:block" />
              Shop All Products
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#catalog"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-3.5 text-[13px] font-extrabold sm:gap-2.5 sm:px-7 sm:py-4 sm:text-sm text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-emerald-300/60 hover:bg-white/15"
            >
              Explore Categories
              <ArrowDown className="h-4 w-4" />
            </Link>
          </div>

          {/* Live featured pick, woven into the copy rather than a separate panel */}
          {current && (
            <div
              className="hero-fade-up mt-7 [animation-delay:300ms]"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <button
                key={current.id}
                type="button"
                onClick={() => openProductModal(current)}
                className="hero-slide-in group flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-ink-950/45 p-2 pr-4 text-left backdrop-blur-md transition hover:border-emerald-300/40 hover:bg-ink-950/60"
                aria-label={`View ${current.name}`}
              >
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                  <Image src={current.image} alt="" fill sizes="48px" className="object-contain p-1" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-brand-cyan">
                    {current.isPreorder ? 'Pre-order now' : current.isFeatured ? 'Featured pick' : 'Just in'}
                  </span>
                  <span className="block truncate text-sm font-bold">{current.name}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-black text-brand-green">
                    {formatCurrency(current.price, storeConfig.currencySymbol)}
                  </span>
                  <ArrowRight className="ml-auto mt-0.5 h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-white" />
                </span>
              </button>
              {spotlight.length > 1 && (
                <div className="mt-2.5 flex gap-1.5 pl-1" role="tablist" aria-label="Featured products">
                  {spotlight.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      role="tab"
                      aria-selected={index === activeIndex % spotlight.length}
                      aria-label={`Show ${product.name}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === activeIndex % spotlight.length ? 'w-6 bg-brand-green' : 'w-1.5 bg-white/30 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <ul className="hero-fade-up mt-8 hidden grid-cols-1 gap-3 text-xs sm:grid font-semibold text-slate-200 [animation-delay:360ms] sm:grid-cols-3">
            {[
              { icon: ShieldCheck, text: storeConfig.motto || 'Original & certified' },
              { icon: Truck, text: 'Lagos & Abia dispatch' },
              { icon: LockKeyhole, text: 'Secure Flutterwave checkout' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-green backdrop-blur">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick category links */}
      <div className="border-t border-white/10 bg-ink-950/70 backdrop-blur">
        <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-2.5 overflow-x-auto px-4 py-3.5 sm:px-6 lg:px-8">
          {quickLinks.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-slate-200 transition hover:border-emerald-300/50 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5 text-brand-green" />
              {label}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px shrink-0 bg-white/15" />
          <span className="shrink-0 text-xs font-semibold text-slate-400">
            {products.length > 0
              ? `${products.length} products across ${categories.length || 1} categor${categories.length === 1 ? 'y' : 'ies'}`
              : 'Two branches: Lagos & Abia'}
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
