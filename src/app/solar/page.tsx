'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { generateSolarWhatsAppUrl } from '@/utils/whatsapp';
import { SolarQuoteRequest } from '@/types/ecommerce';
import {
  Sun,
  Zap,
  Wrench,
  MessageSquare,
  Check,
  ArrowRight,
  ShieldCheck,
  Battery,
  Sparkles,
  Award,
  CheckCircle2,
  PhoneCall,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

export default function SolarEnergyPage() {
  const { storeConfig } = useStore();

  const [quote, setQuote] = useState<SolarQuoteRequest>({
    systemSize: '3.5 kVA Solar Inverter Package',
    applianceDetails: 'TV, Fans, Refrigerator, Lights, Laptops & Mobile Phones',
    location: 'Lagos / Abia State',
    serviceType: 'new_installation',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const solarPackages = [
    {
      title: '1.5 kVA Mini Solar Package',
      size: '1.5 kVA Inverter',
      capacity: '100Ah / 200Ah Lithium or Tubular Battery + 2x 350W Solar Panels',
      powers: 'Lights, TV, Fans, Laptops, WiFi & Phone Charging',
      badge: 'STARTER HOME',
      ideal: '1 - 2 Bedroom Apartments / Office Desks',
    },
    {
      title: '3.5 kVA Standard Solar Package',
      size: '3.5 kVA Pure Sine Inverter',
      capacity: '5kWh Lithium LiFePO4 Battery + 4x 550W Monocrystalline Solar Panels',
      powers: 'Refrigerator/Freezer, TV, Fans, Lighting, Laptops & Sound System',
      badge: 'MOST POPULAR',
      ideal: '3 - 4 Bedroom Homes / Retail Shops',
    },
    {
      title: '5 kVA Heavy Duty Package',
      size: '5 kVA Hybrid Inverter',
      capacity: '10kWh High Capacity Lithium Bank + 6x 550W Solar Panels',
      powers: 'Air Conditioner (1HP Inverter AC), Washing Machine, Freezer, TVs, Fans & Pumps',
      badge: 'FULL HOUSEHOLD',
      ideal: 'Executive Duplexes & Corporate Offices',
    },
    {
      title: '10 kVA+ Commercial Package',
      size: '10 kVA Three-Phase Inverter',
      capacity: '15kWh - 30kWh Industrial Lithium Battery Bank + 12x 550W Panels',
      powers: 'Multiple Air Conditioners, Heavy Equipment, Medical Labs, Hotels & Supermarkets',
      badge: 'COMMERCIAL',
      ideal: 'Plazas, Hospitals & Industrial Facilities',
    },
  ];

  const solarHardware = [
    {
      title: 'Monocrystalline PERC Solar Panels',
      desc: 'High-efficiency 550W & 350W solar modules with 23% energy conversion rating and 25-year performance warranty.',
      icon: Sun,
    },
    {
      title: 'Lithium LiFePO4 Battery Banks',
      desc: 'Safe 6000+ cycle life lithium iron phosphate wall batteries with intelligent BMS overload protection.',
      icon: Battery,
    },
    {
      title: 'Pure Sine Wave Hybrid Inverters',
      desc: 'Heavy-duty 1.5kVA to 15kVA smart hybrid inverters featuring MPPT charge controllers and LCD power analytics.',
      icon: Zap,
    },
    {
      title: 'Maintenance & Upgrades',
      desc: 'Routine solar panel cleaning, inverter troubleshooting, battery health testing, and capacity expansion.',
      icon: Wrench,
    },
  ];

  const handleSendSolarWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateSolarWhatsAppUrl(quote, storeConfig);
    window.open(url, '_blank');
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-800 pb-20">
      
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-amber-950/80 to-slate-950 text-white pt-12 pb-16 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-amber-900/30">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-extrabold tracking-wider uppercase backdrop-blur-md">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>G-Naath Solar Energy Solutions</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white leading-tight">
              24/7 Uninterrupted Clean Solar Power
            </h1>

            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              Say goodbye to blackouts and high generator fuel costs. We supply and install high-grade monocrystalline solar panels, pure sine wave inverters, and long-life Lithium LiFePO4 battery systems across Lagos &amp; Abia State.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Zero Noise &amp; Zero Fuel Cost
              </span>
              <span className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/30 px-3 py-1.5 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                25-Year Solar Panel Warranty
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Solar Packages & Hardware (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Solar System Packages */}
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Solar Inverter Packages</h2>
              <p className="text-slate-600 text-xs sm:text-sm mb-6 font-medium">
                Choose a pre-configured solar package or request a custom setup tailored to your specific home/business appliances.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {solarPackages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 p-5 rounded-3xl hover:border-amber-400 transition-all duration-300 shadow-xs hover:shadow-lg space-y-3 relative overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {pkg.badge}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{pkg.ideal}</span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{pkg.title}</h3>
                      
                      <div className="mt-2 space-y-1.5 text-xs text-slate-600 font-medium">
                        <p><strong className="text-slate-900">System:</strong> {pkg.size}</p>
                        <p><strong className="text-slate-900">Capacity:</strong> {pkg.capacity}</p>
                        <p><strong className="text-slate-900">Powers:</strong> {pkg.powers}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setQuote((prev) => ({ ...prev, systemSize: pkg.title }))}
                      className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-900 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Select This Package</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware & Materials */}
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-3">Solar Materials &amp; Sales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {solarHardware.map((hw, idx) => {
                  const Icon = hw.icon;
                  return (
                    <div key={idx} className="bg-white border border-slate-200 p-5 rounded-3xl space-y-2">
                      <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{hw.title}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{hw.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guarantees Strip */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Why Choose G-Naath Solar Energy?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Licensed Solar Electrical Engineers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Surge &amp; Lightning Protection Integrated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Automatic Grid-to-Solar Seamless Changeover</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Lagos &amp; Abia State Nationwide Installation</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Custom Quote Calculator / Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase mb-2">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Free Consultation &amp; Quote</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">Request Custom Solar Quote</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Fill out your power requirements below and our solar engineers will design a custom solar system and send a breakdown via WhatsApp.
                </p>
              </div>

              <form onSubmit={handleSendSolarWhatsApp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Solar Service Needed *
                  </label>
                  <select
                    value={quote.serviceType}
                    onChange={(e) =>
                      setQuote({
                        ...quote,
                        serviceType: e.target.value as 'new_installation' | 'buy_materials' | 'maintenance_repair',
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
                  >
                    <option value="new_installation">Full Solar System Design &amp; Installation</option>
                    <option value="buy_materials">Buy Solar Materials (Panels, Inverters, Batteries)</option>
                    <option value="maintenance_repair">Solar System Maintenance &amp; Upgrade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select System Capacity / Package *
                  </label>
                  <select
                    value={quote.systemSize}
                    onChange={(e) => setQuote({ ...quote, systemSize: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-bold cursor-pointer"
                  >
                    <option value="1.5 kVA Mini Solar Package">1.5 kVA Package (Lights, Fans, TV, Laptops)</option>
                    <option value="3.5 kVA Standard Solar Package">3.5 kVA Package (Lights, Fans, TV, Refrigerator)</option>
                    <option value="5 kVA Heavy Duty Package">5 kVA Package (Full Household + 1HP Inverter AC)</option>
                    <option value="10 kVA+ Commercial Package">10 kVA+ Industrial / Commercial System</option>
                    <option value="Solar Panels Only (550W PERC)">Solar Panels Only (550W PERC)</option>
                    <option value="Lithium LiFePO4 Battery Pack Only">Lithium LiFePO4 Battery Pack Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Installation / Delivery Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Isolo Ago Palace Lagos OR ABSU Uturu Abia State"
                    value={quote.location}
                    onChange={(e) => setQuote({ ...quote, location: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Appliances You Want to Power (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 2 TVs, 1 Refrigerator, 4 Ceiling Fans, Laptops, Mobile Phones..."
                    value={quote.applianceDetails}
                    onChange={(e) => setQuote({ ...quote, applianceDetails: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Solar Quote Request to WhatsApp</span>
                  </button>
                </div>
              </form>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>All installations backed by G-Naath warranty &amp; lifetime technical support.</span>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
