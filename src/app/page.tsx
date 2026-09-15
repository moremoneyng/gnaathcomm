'use client';

import React from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { CategoryBar } from '@/components/CategoryBar';
import { ProductGrid } from '@/components/ProductGrid';
import { HomeServicesSpotlight } from '@/components/HomeServicesSpotlight';
import { LocationsSection } from '@/components/LocationsSection';
import { BrandMarquee } from '@/components/BrandMarquee';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';
import { ToastNotification } from '@/components/ToastNotification';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Glassmorphism Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Revamped Hero Section */}
        <HeroSection />

        {/* Brand Marquee Banner */}
        <BrandMarquee />

        {/* Featured Product Spotlight Section */}
        <section id="catalog" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <CategoryBar />
          
          <ProductGrid />

          {/* Direct CTA to full shop page */}
          <div className="text-center pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-slate-950 hover:bg-emerald-600 text-white font-extrabold text-xs transition-all shadow-md active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Browse All Products in Full Online Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Services Teasers Spotlight (Repairs & Solar) */}
        <HomeServicesSpotlight />

        {/* Branch Offices & Locations */}
        <LocationsSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Modals & Popups */}
      <ProductModal />
      <CartDrawer />
      <ToastNotification />
    </div>
  );
}
