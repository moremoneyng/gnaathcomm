'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  ArrowDown,
  ArrowRight,
  Bike,
  CarFront,
  House,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sun,
  Wrench,
} from 'lucide-react';

const categories = [
  'Smartphones',
  'Electronics',
  'Home Appliances',
  'Office Equipment',
  'Solar Energy',
  'Gadgets',
  'Cars',
  'Bikes',
  'Accessories',
];

export const HeroSection: React.FC = () => {
  const { storeConfig } = useStore();

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f6f1]">
      <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute -bottom-44 left-1/3 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl" />

      <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-10 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-[1.03fr_0.97fr] lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <div className="hero-eyebrow mb-5 inline-flex text-[10px] font-black italic tracking-[0.12em] text-emerald-800 sm:mb-6 sm:text-[11px] sm:tracking-[0.18em]">
            Original, certified and topnotch products.
          </div>

          <h1 className="font-heading text-[2.8rem] font-black leading-[0.94] tracking-[-0.055em] text-slate-950 sm:text-7xl lg:text-[5.5rem]">
            Everything Modern.
            <span className="mt-2 block text-emerald-700">All in One Place.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[15px] font-semibold leading-6 text-slate-700 sm:mt-7 sm:text-lg sm:leading-8">
            Shop smartphones, electronics, home and office appliances, solar energy systems,
            gadgets, cars, bikes and more from one trusted destination.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            From everyday essentials to smart technology and modern mobility, G Naath brings
            you the products that power, connect and transform modern living.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm font-black text-slate-950">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            <span>&ldquo;{storeConfig.motto}&rdquo;</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:gap-3">
            <Link href="/shop" className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full bg-slate-950 px-3 py-3.5 text-[11px] font-extrabold text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:gap-2.5 sm:px-7 sm:py-4 sm:text-sm">
              <ShoppingBag className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              Shop All Products
              <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            </Link>
            <Link href="#catalog" className="inline-flex min-w-0 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-3.5 text-[11px] font-extrabold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-700 hover:text-emerald-800 sm:gap-2.5 sm:px-7 sm:py-4 sm:text-sm">
              Explore Categories
              <ArrowDown className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-bold text-slate-600">
            <Link href="/repairs" className="inline-flex items-center gap-1.5 transition hover:text-emerald-700">
              <Wrench className="h-3.5 w-3.5" /> Expert phone repairs
            </Link>
            <Link href="/solar" className="inline-flex items-center gap-1.5 transition hover:text-emerald-700">
              <Sun className="h-3.5 w-3.5" /> Solar consultation
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div className="absolute -inset-5 rotate-2 rounded-[2.5rem] border border-emerald-900/10 bg-emerald-950/5" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-3 shadow-[0_35px_80px_-30px_rgba(15,23,42,0.55)] sm:rounded-[2.5rem] sm:p-4">
            <div className="relative h-[300px] overflow-hidden rounded-[1.45rem] sm:h-[390px] sm:rounded-[2rem]">
              <Image
                src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1400&auto=format&fit=crop&q=85"
                alt="Modern electronics and technology available at G Naath"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">The modern marketplace</p>
                <p className="mt-2 max-w-sm text-2xl font-black leading-tight text-white sm:text-3xl">
                  Discover what moves your life forward.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-3 text-white sm:gap-3 sm:pt-4">
              {[
                { icon: Smartphone, label: 'Tech' },
                { icon: House, label: 'Home' },
                { icon: CarFront, label: 'Cars' },
                { icon: Bike, label: 'Bikes' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-2 py-3 text-center">
                  <Icon className="h-4 w-4 text-emerald-300" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider sm:text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -right-2 top-8 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl sm:-right-7 sm:top-12">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">One destination</p>
            <p className="mt-0.5 text-sm font-black text-slate-950">Products + Services</p>
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-200/80 bg-white/75 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-4 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
          <span className="shrink-0 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Shop by category</span>
          <span className="h-4 w-px shrink-0 bg-slate-300" />
          {categories.map((category) => (
            <Link key={category} href="#catalog" className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-extrabold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700">
              {category}
            </Link>
          ))}
          <span className="shrink-0 text-xs font-black text-emerald-700">&amp; More</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
