'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { generateSolarWhatsAppUrl } from '@/utils/whatsapp';
import { SolarQuoteRequest } from '@/types/ecommerce';
import { Sun, Zap, Wrench, MessageSquare, Check, ArrowRight } from 'lucide-react';

export const SolarSection: React.FC = () => {
  const { storeConfig } = useStore();

  const [quote, setQuote] = useState<SolarQuoteRequest>({
    systemSize: '3.5 kVA Solar Inverter System',
    applianceDetails: 'TV, Fans, Freezer, Lights, Laptops, Mobile Phones',
    location: 'Lagos / Abia State',
    serviceType: 'new_installation',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const solarFeatures = [
    {
      title: 'Solar Materials & Hardware Sales',
      desc: 'Top-tier monocrystalline solar panels, pure sine wave inverters (1.5kVA to 15kVA), and long-life Lithium LiFePO4 battery banks.',
      icon: Sun,
    },
    {
      title: 'Professional Solar Installation',
      desc: 'Expert electrical engineering, rooftop mounting, surge protection, and seamless automatic grid-to-solar changeover.',
      icon: Zap,
    },
    {
      title: 'Maintenance & Capacity Upgrade',
      desc: 'Routine solar panel cleaning, inverter troubleshooting, battery health testing, and capacity expansion.',
      icon: Wrench,
    },
  ];

  const handleSendSolarWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateSolarWhatsAppUrl(quote, storeConfig);
    window.open(url, '_blank');
    setIsModalOpen(false);
  };

  return (
    <section id="solar" className="py-20 bg-white border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#f5f5f7] border border-amber-200 rounded-[2.5rem] p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                <Sun className="w-3.5 h-3.5 text-amber-700" />
                <span>G-Naath Solar Energy Solutions</span>
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
                Reliable Clean Power With High-Efficiency <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600">Solar Systems</span>
              </h2>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We deal on high-grade solar materials, full residential/commercial installations, and routine maintenance. Enjoy 24/7 uninterrupted power!
              </p>

              {/* Feature Points */}
              <div className="space-y-2.5 pt-2">
                {[
                  'Sales of High Efficiency Solar Panels & Lithium Batteries',
                  'Residential & Commercial Solar Inverter Installation',
                  'Professional Solar Maintenance & System Upgrades',
                  'Factory Warranties & Ultimate Satisfaction Assured',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="p-1 rounded-full bg-amber-200 text-amber-900 shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{item}</span>
                  </div>
                ))}
              </div>

              {/* Action Pill Button */}
              <div className="pt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all transform hover:scale-[1.02]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Request Custom Solar Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Feature Cards */}
            <div className="lg:col-span-5 space-y-4">
              {solarFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-bold text-sm mb-1">{feat.title}</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Solar Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Request Solar Solution Quote</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendSolarWhatsApp} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Solar Service Required *
                </label>
                <select
                  value={quote.serviceType}
                  onChange={(e) =>
                    setQuote({
                      ...quote,
                      serviceType: e.target.value as 'new_installation' | 'buy_materials' | 'maintenance_repair',
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="new_installation">Full Solar System Design &amp; Installation</option>
                  <option value="buy_materials">Buy Solar Materials (Panels, Inverters, Batteries)</option>
                  <option value="maintenance_repair">Solar Maintenance &amp; Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated System Capacity *
                </label>
                <select
                  value={quote.systemSize}
                  onChange={(e) => setQuote({ ...quote, systemSize: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="1.5 kVA Solar Inverter Package">1.5 kVA System (Lights, Fans, TV, Laptops)</option>
                  <option value="3.5 kVA Solar Inverter Package">3.5 kVA System (Lights, Fans, TV, Freezer)</option>
                  <option value="5 kVA Solar Inverter Package">5 kVA System (Full Home / Office / AC)</option>
                  <option value="10kVA+ Commercial Solar System">10 kVA+ Commercial Business System</option>
                  <option value="Solar Panels Only">Solar Panels Only</option>
                  <option value="Lithium Battery Pack Only">Lithium Battery Pack Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Installation / Delivery Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ago Palace Roundabout Isolo Lagos OR ABSU Uturu Abia State"
                  value={quote.location}
                  onChange={(e) => setQuote({ ...quote, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Appliances You Want to Power (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 2 TVs, 1 Refrigerator, 4 Ceiling Fans, Laptops, Phones"
                  value={quote.applianceDetails}
                  onChange={(e) => setQuote({ ...quote, applianceDetails: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Solar Quote Request to WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default SolarSection;
