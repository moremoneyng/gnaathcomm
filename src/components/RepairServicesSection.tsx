'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { generateRepairWhatsAppUrl } from '@/utils/whatsapp';
import { RepairBooking } from '@/types/ecommerce';
import { Wrench, Smartphone, ShieldCheck, Clock, CheckCircle2, MessageSquare, ArrowRight } from 'lucide-react';

export const RepairServicesSection: React.FC = () => {
  const { storeConfig } = useStore();

  const [booking, setBooking] = useState<RepairBooking>({
    deviceName: '',
    issueType: 'Screen Replacement',
    preferredBranch: 'lagos_head_office',
    additionalNotes: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const repairServices = [
    {
      title: 'Screen & Glass Replacement',
      desc: 'Fix cracked, broken, or unresponsive screens for iPhone, Samsung, and Android devices with original 9D & OEM panels.',
      icon: Smartphone,
    },
    {
      title: 'Battery Health & Replacement',
      desc: 'Restore phone battery life and fix fast draining, swollen batteries, or charging drops.',
      icon: Clock,
    },
    {
      title: 'Water & Liquid Damage Fix',
      desc: 'Deep motherboard chemical cleaning, short circuit diagnosis, and component recovery for wet devices.',
      icon: ShieldCheck,
    },
    {
      title: 'Charging Port & Speaker Fix',
      desc: 'Repair loose charging ports, mic issues, ear speakers, and distorted audio output.',
      icon: Wrench,
    },
  ];

  const handleSendRepairWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateRepairWhatsAppUrl(booking, storeConfig);
    window.open(url, '_blank');
    setIsModalOpen(false);
  };

  return (
    <section id="repairs" className="py-20 bg-[#f5f5f7] border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-3">
              <Wrench className="w-3.5 h-3.5" />
              <span>Certified Technicians</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Expert Mobile Phone Repair Services
            </h2>
            <p className="mt-2 text-slate-600 max-w-2xl text-sm sm:text-base">
              Got a broken screen, failing battery, or hardware issue? Our repair labs in Lagos (Ago Palace) and Abia State (ABSU Uturu) offer quick turn-around fixes.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 md:mt-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Book Phone Repair on WhatsApp</span>
          </button>
        </div>

        {/* Bento Repair Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {repairServices.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-6 rounded-3xl hover:border-emerald-500/50 transition-all duration-300 shadow-sm hover:shadow-xl group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{service.desc}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Original Parts Used</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Quote Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-base">Same-Day Express Repair</h4>
              <p className="text-slate-500 text-xs mt-0.5">Drop off your device at Lagos (Ago Palace Roundabout) or Abia State (ABSU Uturu).</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Get Free Quote</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Repair Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Book Repair Service Quote</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRepairWhatsApp} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Model / Brand *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 14 Pro Max, Samsung S22, Tecno Camon 20"
                  value={booking.deviceName}
                  onChange={(e) => setBooking({ ...booking, deviceName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Repair Issue Type *
                </label>
                <select
                  value={booking.issueType}
                  onChange={(e) => setBooking({ ...booking, issueType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Screen & Glass Replacement">Screen &amp; Glass Replacement</option>
                  <option value="Battery Health & Charging Drop">Battery Health &amp; Replacement</option>
                  <option value="Charging Port Repair">Charging Port Fix</option>
                  <option value="Water & Liquid Damage">Water &amp; Liquid Damage Fix</option>
                  <option value="Speaker / Microphone Repair">Speaker / Microphone Repair</option>
                  <option value="Software / Unlocking / Board Fix">Software / Unlocking / Motherboard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Office Branch *
                </label>
                <select
                  value={booking.preferredBranch}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      preferredBranch: e.target.value as 'lagos_head_office' | 'abia_branch_office',
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="lagos_head_office">Lagos Head Office (Ago Palace Roundabout, Isolo)</option>
                  <option value="abia_branch_office">Abia State Branch (ABSU Uturu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Describe Issue (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Screen flickering after drop..."
                  value={booking.additionalNotes}
                  onChange={(e) => setBooking({ ...booking, additionalNotes: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Repair Inquiry to WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default RepairServicesSection;
