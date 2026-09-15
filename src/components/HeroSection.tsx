'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, ArrowRight, ShieldCheck, Wrench, Sun, Smartphone, CheckCircle2, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { storeConfig } = useStore();

  return (
    <section className="relative overflow-hidden bg-[#f4f5f8] py-12 sm:py-20 lg:py-24 border-b border-slate-200/80">
      {/* Background Depth Ambient Blur Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-emerald-400/20 via-teal-300/20 to-cyan-400/20 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-12 left-10 w-48 sm:w-80 h-48 sm:h-80 bg-emerald-500/15 rounded-full blur-[80px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-56 sm:w-96 h-56 sm:h-96 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Sleek Brand Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-800 text-xs font-bold shadow-xs mb-4 sm:mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>G NAATH GLOBAL COMMUNICATIONS LTD • {storeConfig.rcNumber}</span>
        </div>

        {/* Bolder Headline */}
        <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] max-w-4xl mx-auto text-balance">
          Mobile Tech, Accessories &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 drop-shadow-xs">Solar Energy</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-slate-800 text-base sm:text-xl max-w-2xl mx-auto font-bold leading-relaxed px-1 sm:px-0">
          Your authorized destination for genuine smartphones, JBL audio, fast power banks, expert phone repairs, and high-performance solar installations in Lagos &amp; Abia State.
        </p>

        {/* Store Motto Badge */}
        <div className="mt-4 sm:mt-5 inline-flex items-center px-4.5 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-emerald-500/10 border border-emerald-500/30 text-emerald-950 text-xs sm:text-sm font-extrabold shadow-xs backdrop-blur-xs">
          <span>&quot;{storeConfig.motto}&quot;</span>
        </div>

        {/* 3 Primary Dedicated Action Pills */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl sm:rounded-full font-extrabold text-xs sm:text-sm bg-slate-950 hover:bg-slate-900 text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Shop Store Catalog</span>
          </Link>

          <Link
            href="/repairs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl sm:rounded-full font-extrabold text-xs sm:text-sm bg-white hover:bg-slate-50 text-slate-950 border border-slate-300 transition-all shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            <Wrench className="w-4 h-4 text-emerald-600" />
            <span>Book Phone Repairs</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Link
            href="/solar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl sm:rounded-full font-extrabold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
          >
            <Sun className="w-4 h-4 text-slate-950" />
            <span>Solar Quote</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </Link>
        </div>

        {/* Immersive Dark Glass Showcase Canopy */}
        <div className="hidden sm:block mt-12 sm:mt-16 max-w-5xl mx-auto relative text-left">
          
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-[2.5rem] sm:rounded-[3.5rem] blur-2xl opacity-75 pointer-events-none -z-10" />

          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 text-white relative overflow-hidden border border-white/15 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]">
            
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
              
              {/* Left Column */}
              <div className="md:col-span-7 space-y-4 sm:space-y-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 tracking-wider uppercase backdrop-blur-md shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  GENUINE PRODUCTS &amp; CERTIFIED SERVICES
                </span>

                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
                  Original Smartphones, Audio &amp; Clean Solar Power
                </h2>

                <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-medium">
                  Shop original Apple iPhones, Samsung Galaxy flagships, JBL Bluetooth speakers, Anker chargers &amp; high-efficiency solar inverter systems with official factory warranties.
                </p>

                {/* Key Pillars */}
                <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs sm:text-sm font-extrabold text-slate-100">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>100% Genuine</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 shadow-xs">
                    <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Dual Stores</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 shadow-xs col-span-2 sm:col-span-1">
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Solar Panels</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-extrabold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] active:scale-95"
                  >
                    <span>Explore Full Online Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column Image Frame */}
              <div className="md:col-span-5 relative w-full h-60 sm:h-80 md:h-96">
                <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/40 via-teal-400/30 to-cyan-500/40 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)] group">
                  <Image
                    src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1000&auto=format&fit=crop&q=80"
                    alt="Original Smartphones & Accessories Showcase"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end p-4 sm:p-5" />
                </div>

                <div className="absolute -bottom-3 -right-2 sm:-bottom-4 sm:-right-4 bg-slate-950/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-emerald-500/40 shadow-2xl text-white z-20">
                  <p className="text-[11px] sm:text-xs font-black text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Official Warranty Included
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-300 font-semibold mt-0.5">
                    Lagos Head Office &amp; ABSU Branch
                  </p>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
