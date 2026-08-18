'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink, Building2 } from 'lucide-react';
import { cleanPhoneNumber } from '@/utils/whatsapp';

export const LocationsSection: React.FC = () => {
  const { storeConfig } = useStore();
  const cleanPhone = cleanPhoneNumber(storeConfig.whatsappNumber);

  return (
    <section id="locations" className="py-20 bg-[#f5f5f7] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-sm mb-3">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Store Branch Network</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Visit Our Physical Stores
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Walk into any of our store locations in Lagos or Abia State for physical purchases, phone repair drop-offs, or solar consultations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Lagos Head Office */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  HEAD OFFICE (LAGOS)
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {storeConfig.businessHours}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                Lagos Head Office
              </h3>

              <div className="space-y-3 my-4 text-slate-700 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{storeConfig.headOfficeAddress}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Landmark: {storeConfig.headOfficeLandmark}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${storeConfig.whatsappNumber}`} className="hover:text-emerald-600 transition-colors font-medium">
                    {storeConfig.whatsappDisplayNumber}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`mailto:${storeConfig.email}`} className="hover:text-emerald-600 transition-colors font-medium">
                    {storeConfig.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello! I would like to visit your Lagos Head Office at Ago Palace Roundabout.')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with Lagos Store</span>
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(storeConfig.headOfficeAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>
            </div>
          </div>

          {/* Abia State Branch */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group">
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                  BRANCH OFFICE (ABIA STATE)
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  {storeConfig.businessHours}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors">
                Abia State University (ABSU) Branch
              </h3>

              <div className="space-y-3 my-4 text-slate-700 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{storeConfig.branchOfficeAddress}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Landmark: {storeConfig.branchOfficeLandmark}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-cyan-600 shrink-0" />
                  <a href={`tel:${storeConfig.whatsappNumber}`} className="hover:text-cyan-600 transition-colors font-medium">
                    {storeConfig.whatsappDisplayNumber}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-cyan-600 shrink-0" />
                  <a href={`mailto:${storeConfig.email}`} className="hover:text-cyan-600 transition-colors font-medium">
                    {storeConfig.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hello! I would like to visit your ABSU Uturu Branch Office in Abia State.')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with ABSU Branch</span>
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(storeConfig.branchOfficeAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LocationsSection;
