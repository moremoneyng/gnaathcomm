'use client';

import React, { useState } from 'react';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Footer } from '@/components/Footer';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';
import { MerchantConfigModal } from '@/components/MerchantConfigModal';
import { useStore } from '@/context/StoreContext';
import { cleanPhoneNumber } from '@/utils/whatsapp';
import {
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  Clock,
  Send,
  Building2,
  Navigation,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ContactPage() {
  const { storeConfig, showToast } = useStore();
  const cleanPhone = cleanPhoneNumber(storeConfig.whatsappNumber);

  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    service: 'Product Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.phone) {
      showToast('Please fill in your name and phone number', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('Thank you! Your message has been sent successfully.', 'success');
      setFormState({ name: '', phone: '', service: 'Product Inquiry', message: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-500 selection:text-white">
      <AnnouncementBar />

      <main className="flex-grow bg-[#f8f9fa] py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 uppercase tracking-wider mb-4">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Store Locations &amp; Support
            </span>
            <h1 className="font-heading text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Get in Touch with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">G Naath Global</span>
            </h1>
            <p className="mt-4 text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
              Visit our physical store locations in Lagos and Abia State, or reach out to us directly for original smartphones, accessories, expert repairs, and clean solar energy installations.
            </p>
          </div>

          {/* Dual Office Branch Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            
            {/* Lagos Head Office */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    HEAD OFFICE
                  </span>
                  <span className="text-xs font-bold text-slate-500">Lagos State</span>
                </div>

                <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-950 mb-3">
                  Lagos Head Office Branch
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Address:</p>
                      <p className="text-slate-600 font-medium leading-relaxed">{storeConfig.headOfficeAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Phone / Order Line:</p>
                      <a href={`tel:${storeConfig.whatsappNumber}`} className="text-emerald-700 font-bold hover:underline">
                        {storeConfig.whatsappDisplayNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Opening Hours:</p>
                      <p className="text-slate-600 font-medium">Mon - Sat: 8:00 AM - 7:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${cleanPhone}?text=Hello%20G%20Naath%20Global!%20I%20want%20to%20inquire%20about%20your%20Lagos%20Head%20Office.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Lagos Store</span>
                </a>
              </div>
            </div>

            {/* Abia State Branch */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-cyan-100 text-cyan-900 border border-cyan-200">
                    <Navigation className="w-3.5 h-3.5 text-cyan-600" />
                    CAMPUS BRANCH
                  </span>
                  <span className="text-xs font-bold text-slate-500">Abia State</span>
                </div>

                <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-950 mb-3">
                  Abia State Branch (ABSU Uturu)
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Address:</p>
                      <p className="text-slate-600 font-medium leading-relaxed">{storeConfig.branchOfficeAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Phone / Order Line:</p>
                      <a href={`tel:${storeConfig.whatsappNumber}`} className="text-cyan-700 font-bold hover:underline">
                        {storeConfig.whatsappDisplayNumber}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Opening Hours:</p>
                      <p className="text-slate-600 font-medium">Mon - Sat: 8:00 AM - 6:30 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${cleanPhone}?text=Hello%20G%20Naath%20Global!%20I%20want%20to%20inquire%20about%20your%20ABSU%20Branch.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Chat ABSU Branch</span>
                </a>
              </div>
            </div>

          </div>

          {/* Contact & Inquiry Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Direct Contact Cards */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
                <h3 className="font-heading text-lg font-black text-slate-950 mb-4">Direct Contact Lines</h3>
                
                <div className="space-y-4">
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Instant WhatsApp Chat</p>
                      <p className="text-xs font-semibold text-emerald-700">{storeConfig.whatsappDisplayNumber}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${storeConfig.whatsappNumber}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Direct Phone Order Line</p>
                      <p className="text-xs font-semibold text-slate-600">{storeConfig.whatsappDisplayNumber}</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${storeConfig.email}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-cyan-50 border border-cyan-200/80 hover:bg-cyan-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-cyan-900">Email Support</p>
                      <p className="text-xs font-semibold text-cyan-700 truncate">{storeConfig.email}</p>
                    </div>
                  </a>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>RC: {storeConfig.rcNumber} • Official Guarantee</span>
                </div>
              </div>
            </div>

            {/* Send Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
                <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-950 mb-2">
                  Send Us a Direct Message
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mb-6 font-medium">
                  Have a question about a smartphone, repair service, or solar installation? Send us a quick note.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Blessed Onyeulo"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Phone / WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 07034791996"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Inquiry Category</label>
                    <select
                      value={formState.service}
                      onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Product Inquiry">Product Inquiry (Phones / Accessories)</option>
                      <option value="Phone Repairs">Phone Repairs (Screen / Battery)</option>
                      <option value="Solar Energy">Solar Energy &amp; Inverter Installation</option>
                      <option value="Other Inquiry">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Your Message</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us what product or service you are interested in..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />

      <ProductModal />
      <CartDrawer />
      <MerchantConfigModal />
    </div>
  );
}
