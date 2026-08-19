'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, MapPin, Phone, Mail, Wrench, Sun, Clock, Heart, ArrowRight, Building2, Navigation } from 'lucide-react';
import { cleanPhoneNumber } from '@/utils/whatsapp';

export const Footer: React.FC = () => {
  const { storeConfig } = useStore();
  const cleanPhone = cleanPhoneNumber(storeConfig.whatsappNumber);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 relative overflow-hidden pb-16 md:pb-0 selection:bg-emerald-500 selection:text-white">
      
      {/* Background Depth Ambient Glow */}
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-0" />

      {/* Top Value Strip - Organized 2x2 Glass Card Grid on Mobile */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md py-6 sm:py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          
          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start text-center sm:text-left gap-2.5 sm:gap-3 shadow-sm hover:border-emerald-500/40 transition-all group">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Genuine Guarantee</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5">100% Original Products &amp; Warranties</p>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start text-center sm:text-left gap-2.5 sm:gap-3 shadow-sm hover:border-emerald-500/40 transition-all group">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Expert Phone Repairs</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5">Screen, Battery &amp; Board Fixes</p>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start text-center sm:text-left gap-2.5 sm:gap-3 shadow-sm hover:border-amber-500/40 transition-all group">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Solar Installations</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5">Inverters, Panels &amp; Maintenance</p>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start text-center sm:text-left gap-2.5 sm:gap-3 shadow-sm hover:border-cyan-500/40 transition-all group">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-white">Dual Office Branches</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight mt-0.5">Lagos Head Office &amp; ABSU Uturu</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 shrink-0 shadow-lg border border-white/20">
                <Image
                  src={storeConfig.logoUrl || '/gnaathcommlogo.png'}
                  alt={storeConfig.storeName}
                  width={48}
                  height={48}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h3 className="font-heading text-base font-black text-white tracking-wide">G NAATH GLOBAL</h3>
                <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">COMMUNICATIONS LTD</p>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 inline-block mt-0.5">
                  RC: {storeConfig.rcNumber}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              We deal on original smartphones, authorized tech accessories, content creation gadgets, phone repair services, and clean solar energy installations.
            </p>

            <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/15 to-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-black shadow-sm backdrop-blur-md">
              &quot;{storeConfig.motto}&quot;
            </div>

            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 w-full sm:w-auto"
              >
                <Building2 className="w-4 h-4" />
                <span>Visit Contact &amp; Locations Page</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Lagos Head Office Card */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Lagos Head Office</span>
                </h4>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HEADQUARTERS
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <p className="leading-relaxed font-medium">{storeConfig.headOfficeAddress}</p>
                
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <a href={`tel:${storeConfig.whatsappNumber}`} className="text-emerald-400 font-bold hover:underline">
                    {storeConfig.whatsappDisplayNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ABSU Branch Office Card */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span>Abia State Branch</span>
                </h4>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ABSU UTURU
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <p className="leading-relaxed font-medium">{storeConfig.branchOfficeAddress}</p>
                
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <a href={`tel:${storeConfig.whatsappNumber}`} className="text-cyan-400 font-bold hover:underline">
                    {storeConfig.whatsappDisplayNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Connect With Us</h4>
            
            <div className="space-y-2 text-xs">
              <a
                href={`mailto:${storeConfig.email}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate font-semibold text-[11px]">{storeConfig.email}</span>
              </a>

              <a
                href={storeConfig.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 text-cyan-400 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="font-semibold text-[11px]">Facebook Page</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} G Naath Global Communications Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Ultimate Customer Satisfaction</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
