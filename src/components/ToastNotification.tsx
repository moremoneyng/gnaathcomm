'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2 } from 'lucide-react';

export function ToastNotification() {
  const { toastMessage } = useStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <span className="text-xs font-semibold">{toastMessage}</span>
      </div>
    </div>
  );
}

export default ToastNotification;
