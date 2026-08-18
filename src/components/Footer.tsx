'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck, MapPin, Phone, Mail, Wrench, Sun, Clock, Heart } from 'lucide-react';
import { cleanPhoneNumber } from '@/utils/whatsapp';

export const Footer: React.FC = () => {
  const { storeConfig } = useStore();
  const cleanPhone = cleanPhoneNumber(storeConfig.whatsappNumber);

  return (
    <footer className="bg-[#f5f5f7] text-slate-600 border-t border-slate-200 relative overflow-hidden pb-16 md:pb-0">
      
      {/* Top Value Strip */}
      <div className="border-b border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Genuine Guarantee</h4>
              <p className="text-[11px] text-slate-500">100% Original Products &amp; Warranties</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Expert Phone Repairs</h4>
              <p className="text-[11px] text-slate-500">Screen, Battery &amp; Board Fixes</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Solar Installations</h4>
              <p className="text-[11px] text-slate-500">Inverters, Panels &amp; Maintenance</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="p-2.5 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Dual Office Branches</h4>
              <p className="text-[11px] text-slate-500">Lagos Head Office &amp; ABSU Uturu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 shrink-0 shadow-sm">
                <Image
                  src={storeConfig.logoUrl || '/gnaathcommlogo.png'}
                  alt={storeConfig.storeName}
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">G NAATH GLOBAL</h3>
                <p className="text-[10px] text-emerald-700 font-bold uppercase">COMMUNICATIONS LTD</p>
                <span className="text-[9px] text-slate-500 font-mono">{storeConfig.rcNumber}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              We deal on original smartphones, authorized tech accessories, content creation gadgets, phone repair services, and solar energy installations.
            </p>

            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-emerald-800 text-xs font-bold shadow-sm">
              &quot;{storeConfig.motto}&quot;
            </div>
            <div className="pt-1">
              <a
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                <span>View Full Contact &amp; Locations Page</span>
                <span className="text-emerald-500">→</span>
              </a>
            </div>
          </div>

          {/* Lagos Head Office */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Lagos Head Office</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>{storeConfig.headOfficeAddress}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <a href={`tel:${storeConfig.whatsappNumber}`} className="hover:text-slate-900 transition-colors">
                  {storeConfig.whatsappDisplayNumber}
                </a>
              </div>
            </div>
          </div>

          {/* ABSU Branch Office */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Abia State Branch</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <p>{storeConfig.branchOfficeAddress}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <a href={`tel:${storeConfig.whatsappNumber}`} className="hover:text-slate-900 transition-colors">
                  {storeConfig.whatsappDisplayNumber}
                </a>
              </div>
            </div>
          </div>

          {/* Connect */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Connect With Us</h4>
            <div className="space-y-2 text-xs text-slate-600">
              <a
                href={`mailto:${storeConfig.email}`}
                className="flex items-center gap-2 hover:text-slate-900 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">{storeConfig.email}</span>
              </a>

              <a
                href={storeConfig.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-slate-900 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-cyan-600 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook Page</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} G Naath Global Communications Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>for Ultimate Customer Satisfaction</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
