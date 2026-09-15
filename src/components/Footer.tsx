'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, MapPin, Phone, Mail, Wrench, Sun, Clock, Heart, ArrowRight } from 'lucide-react';
import { cleanPhoneNumber } from '@/utils/whatsapp';

export const Footer: React.FC = () => {
  const { storeConfig } = useStore();
  const cleanPhone = cleanPhoneNumber(storeConfig.whatsappNumber);

  return (
    <footer className="bg-[#f8f9fa] text-slate-700 border-t border-slate-200 relative overflow-hidden pb-16 md:pb-0">
      
      {/* Top Value Strip */}
      <div className="border-b border-slate-200/80 bg-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start text-center sm:text-left gap-2.5 sm:gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Genuine Guarantee</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5">100% Original Products &amp; Warranties</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start text-center sm:text-left gap-2.5 sm:gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Expert Phone Repairs</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5">Screen, Battery &amp; Board Fixes</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start text-center sm:text-left gap-2.5 sm:gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Solar Installations</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5">Inverters, Panels &amp; Maintenance</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start text-center sm:text-left gap-2.5 sm:gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Dual Office Branches</h4>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-tight mt-0.5">Lagos Head Office &amp; ABSU Uturu</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 shrink-0 shadow-xs">
                <Image
                  src={storeConfig.logoUrl || '/gnaathcommlogo.png'}
                  alt={storeConfig.storeName}
                  width={44}
                  height={44}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h3 className="font-heading text-sm font-black text-slate-950 tracking-wide">G NAATH GLOBAL</h3>
                <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">COMMUNICATIONS LTD</p>
                <span className="text-[10px] text-slate-500 font-mono">
                  RC: {storeConfig.rcNumber.replace(/^RC:\s*/i, '')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              We deal on original smartphones, authorized tech accessories, content creation gadgets, phone repair services, and clean solar energy installations.
            </p>

            <div className="p-3 bg-white border border-slate-200/90 rounded-xl text-emerald-800 text-xs font-extrabold shadow-xs inline-block">
              &quot;{storeConfig.motto}&quot;
            </div>

            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <span>View Full Contact &amp; Locations Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Lagos Head Office Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">Lagos Head Office</h4>
            
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="font-medium">{storeConfig.headOfficeAddress}</p>
              </div>
              
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href={`tel:${storeConfig.whatsappNumber}`} className="text-emerald-700 font-bold hover:underline">
                  {storeConfig.whatsappDisplayNumber}
                </a>
              </div>
            </div>
          </div>

          {/* Abia State Branch Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">Abia State Branch</h4>
            
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <p className="font-medium">{storeConfig.branchOfficeAddress}</p>
              </div>
              
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-cyan-600 shrink-0" />
                <a href={`tel:${storeConfig.whatsappNumber}`} className="text-cyan-700 font-bold hover:underline">
                  {storeConfig.whatsappDisplayNumber}
                </a>
              </div>
            </div>
          </div>

          {/* Connect Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">Connect With Us</h4>
            
            <div className="space-y-2 text-xs text-slate-600">
              <a
                href={`mailto:${storeConfig.email}`}
                className="flex items-center gap-2 hover:text-slate-950 transition-colors"
              >
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{storeConfig.email}</span>
              </a>

              <a
                href={storeConfig.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-slate-950 transition-colors"
              >
                <svg className="w-4 h-4 text-cyan-600 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="font-medium">Facebook Page</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} G Naath Global Communications Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-emerald-700 font-bold transition-colors">
              Admin Portal
            </Link>
            <div className="flex items-center gap-1">
              <span>Built with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for Ultimate Customer Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
