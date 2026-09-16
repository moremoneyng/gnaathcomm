'use client';

import React from 'react';
import Link from 'next/link';
import { Wrench, Sun, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const HomeServicesSpotlight: React.FC = () => {
  return (
    <section className="py-16 bg-[#f8f9fa] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Authorized Services</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Expert Phone Repairs &amp; Clean Solar Energy
          </h2>
          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            Alongside our growing marketplace, we operate certified phone repair labs and professional solar installation services across Lagos &amp; Abia State.
          </p>
        </div>

        {/* 2 Clean Feature Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 1. Phone Repairs Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Certified Technicians</span>
                <h3 className="text-2xl font-black text-slate-900">Mobile Phone Repair Center</h3>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Shattered screen? Failing battery? Water damage? Our repair centers in Lagos (Ago Palace) and Abia State (ABSU Uturu) use 100% original OEM replacement parts with same-day express service.
              </p>

              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Screen &amp; Touch Glass Replacement</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Battery Health &amp; Charging Port Repair</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Liquid Chemical Cleaning &amp; Motherboard Fix</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/repairs"
                className="w-full py-3.5 px-6 rounded-full bg-slate-950 hover:bg-emerald-600 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>View Full Repair Services &amp; Book Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 2. Solar Energy Card */}
          <div className="bg-white border border-amber-200/90 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Sun className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Clean Solar Power</span>
                <h3 className="text-2xl font-black text-slate-900">Solar Energy &amp; Inverters</h3>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                Enjoy 24/7 uninterrupted power with zero generator noise or fuel costs. We supply monocrystalline PERC solar panels, pure sine wave inverters, and long-life Lithium battery banks.
              </p>

              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>1.5kVA to 10kVA+ Hybrid Solar Inverter Packages</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Lithium LiFePO4 Battery Banks &amp; 550W Panels</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Full Installation &amp; 25-Year Performance Warranty</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/solar"
                className="w-full py-3.5 px-6 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Explore Solar Packages &amp; Calculate Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default HomeServicesSpotlight;
