'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { generateRepairWhatsAppUrl } from '@/utils/whatsapp';
import { RepairBooking } from '@/types/ecommerce';
import {
  Wrench,
  Smartphone,
  ShieldCheck,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Sparkles,
  MapPin,
  PhoneCall,
  Zap,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function PhoneRepairsPage() {
  const { storeConfig } = useStore();

  const [booking, setBooking] = useState<RepairBooking>({
    deviceName: '',
    issueType: 'Screen Replacement',
    preferredBranch: 'lagos_head_office',
    additionalNotes: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const repairServices = [
    {
      title: 'Screen & Glass Replacement',
      desc: 'Fix cracked, shattered, blacked-out, or unresponsive touch displays for Apple iPhone, Samsung Galaxy, Google Pixel, and all Android devices with 9D tempered glass & original OEM screens.',
      icon: Smartphone,
      time: '30 - 60 Minutes',
      popular: true,
    },
    {
      title: 'Battery Health & Replacement',
      desc: 'Restore battery performance to 100%. Fix rapid battery draining, overheating, battery swelling, or unexpected phone shutdowns with genuine high-density battery cells.',
      icon: Clock,
      time: '20 - 45 Minutes',
      popular: true,
    },
    {
      title: 'Water & Liquid Damage Fix',
      desc: 'Deep motherboard chemical cleaning, ultrasonic bath drying, short-circuit diagnostic isolation, and component repair for phones dropped in water or liquids.',
      icon: ShieldCheck,
      time: 'Same Day Diagnosis',
      popular: false,
    },
    {
      title: 'Charging Port & Speaker Repair',
      desc: 'Fix loose or broken USB-C / Lightning charging ports, weak microphone audio, distorted loud speakers, and earpiece calling issues.',
      icon: Wrench,
      time: '30 - 45 Minutes',
      popular: false,
    },
    {
      title: 'Motherboard & Micro-Soldering',
      desc: 'Advanced IC chip replacement, power IC repair, face-ID repair, camera IC fix, and motherboard logic repair carried out by expert engineers.',
      icon: Zap,
      time: '1 - 2 Business Days',
      popular: false,
    },
    {
      title: 'Software, Unlocking & Flashing',
      desc: 'Fix boot loop stuck devices, OS crashing, iCloud/Google Account lockout recovery, firmware updates, and data backup & transfer.',
      icon: CheckCircle2,
      time: '1 - 3 Hours',
      popular: false,
    },
  ];

  const handleSendRepairWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateRepairWhatsAppUrl(booking, storeConfig);
    window.open(url, '_blank');
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 pb-20">
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold tracking-wider uppercase backdrop-blur-md">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>Certified Repair Lab &amp; Engineers</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white leading-tight">
              Expert Mobile Phone Repair Services
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Got a broken screen, failing battery, liquid damage, or charging issue? Our certified repair labs in Lagos (Ago Palace) and Abia State (ABSU Uturu) offer quick turn-around fixes using 100% genuine replacement parts.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-1.5 bg-emerald-900/50 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Original OEM Replacement Parts
              </span>
              <span className="flex items-center gap-1.5 bg-emerald-900/50 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Same-Day Repair Guarantee
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Services & Process (8 cols) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Services Overview */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Our Repair Specialties</h2>
              <p className="text-slate-600 text-xs sm:text-sm mb-6 font-medium">
                We repair all major smartphone brands including Apple iPhone, Samsung, Google Pixel, Xiaomi, Tecno, Infinix, and Huawei.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {repairServices.map((service, idx) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-emerald-500/50 transition-all duration-300 shadow-xs hover:shadow-lg space-y-3 relative overflow-hidden group"
                    >
                      {service.popular && (
                        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          POPULAR
                        </span>
                      )}

                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{service.title}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{service.desc}</p>
                      
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Estimated Time:</span>
                        <strong className="text-emerald-700 font-bold">{service.time}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Repair Process Workflow */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <h3 className="text-lg font-black text-slate-900">How Our Repair Service Works</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">1</div>
                  <h4 className="text-xs font-bold text-slate-900">Submit Details</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Fill out the quick repair form with your phone model &amp; issue.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">2</div>
                  <h4 className="text-xs font-bold text-slate-900">Free Quote</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Get instant cost estimation &amp; part availability confirmation.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">3</div>
                  <h4 className="text-xs font-bold text-slate-900">Device Drop-off</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Drop off device at Lagos (Ago Palace) or ABSU Uturu branch.</p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">4</div>
                  <h4 className="text-xs font-bold text-slate-900">Quality Tested</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Engineer completes repair &amp; tests device with warranty sticker.</p>
                </div>
              </div>
            </div>

            {/* Repair Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Lagos Head Office Repair Center</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{storeConfig.headOfficeAddress}</p>
                <p className="text-[11px] text-slate-500 font-semibold">Hours: {storeConfig.businessHours}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Abia State Repair Center</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{storeConfig.branchOfficeAddress}</p>
                <p className="text-[11px] text-slate-500 font-semibold">Hours: {storeConfig.businessHours}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Instant Booking Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase mb-2">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Instant Online Inquiry</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Book Phone Repair Quote</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Select your device details below to get an instant cost estimation from our senior engineers via WhatsApp.
                </p>
              </div>

              <form onSubmit={handleSendRepairWhatsApp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Model / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 15 Pro, Samsung S23 Ultra, Tecno Camon 20"
                    value={booking.deviceName}
                    onChange={(e) => setBooking({ ...booking, deviceName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Repair Issue Category *
                  </label>
                  <select
                    value={booking.issueType}
                    onChange={(e) => setBooking({ ...booking, issueType: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
                  >
                    <option value="Screen & Glass Replacement">Screen &amp; Touch Glass Replacement</option>
                    <option value="Battery Health & Charging Drop">Battery Replacement / Fast Drain</option>
                    <option value="Charging Port Repair">Charging Port / Connector Fix</option>
                    <option value="Water & Liquid Damage">Water &amp; Liquid Damage Chemical Fix</option>
                    <option value="Speaker / Earpiece / Mic">Speaker / Earpiece / Mic Fix</option>
                    <option value="Motherboard / IC / Camera Repair">Motherboard IC / Camera / Hardware</option>
                    <option value="Software / Unlocking">Software / OS Crash / Unlocking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Service Branch *
                  </label>
                  <select
                    value={booking.preferredBranch}
                    onChange={(e) =>
                      setBooking({
                        ...booking,
                        preferredBranch: e.target.value as 'lagos_head_office' | 'abia_branch_office',
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
                  >
                    <option value="lagos_head_office">Lagos Head Office (Isolo / Ago Palace)</option>
                    <option value="abia_branch_office">Abia State Branch (ABSU Uturu)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Additional Issue Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Touch stopped working after dropping in water..."
                    value={booking.additionalNotes}
                    onChange={(e) => setBooking({ ...booking, additionalNotes: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Inquiry to Repair Engineer</span>
                  </button>
                </div>
              </form>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>All repair jobs include official service warranty &amp; quality test check.</span>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
