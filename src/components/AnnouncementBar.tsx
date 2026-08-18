'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { PhoneCall } from 'lucide-react';
import { cleanPhoneNumber } from '@/utils/whatsapp';

export const AnnouncementBar: React.FC = () => {
  const { storeConfig } = useStore();
  const cleanPhone = cleanPhoneNumber(storeConfig.whatsappNumber);

  return (
    <div className="bg-[#f5f5f7] text-slate-600 text-[11px] py-2 px-4 border-b border-slate-200 relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Announcement */}
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="font-bold text-slate-900">
            {storeConfig.storeName}
          </span>
          <span className="hidden md:inline text-slate-300">•</span>
          <span className="hidden md:inline text-slate-600 font-medium">
            Lagos &amp; Abia State Branches
          </span>
          <span className="hidden lg:inline text-slate-300">•</span>
          <span className="hidden lg:inline text-emerald-600 font-semibold italic">
            &quot;{storeConfig.motto}&quot;
          </span>
        </div>

        {/* Right WhatsApp Link */}
        <div className="shrink-0">
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-emerald-600 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Order Line:</span>
            <span className="font-mono text-emerald-700 font-bold">{storeConfig.whatsappDisplayNumber}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
