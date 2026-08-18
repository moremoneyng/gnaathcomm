'use client';

import React from 'react';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { CategoryBar } from '@/components/CategoryBar';
import { ProductGrid } from '@/components/ProductGrid';
import { RepairServicesSection } from '@/components/RepairServicesSection';
import { SolarSection } from '@/components/SolarSection';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';
import { MerchantConfigModal } from '@/components/MerchantConfigModal';
import { ToastNotification } from '@/components/ToastNotification';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Glassmorphism Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />

        {/* Product Catalog Section */}
        <section id="catalog" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryBar />
          <ProductGrid />
        </section>

        {/* Mobile Phone Repairs Section */}
        <RepairServicesSection />

        {/* Solar Energy & Installations Section */}
        <SolarSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Modals & Popups */}
      <ProductModal />
      <CartDrawer />
      <MerchantConfigModal />
      <ToastNotification />
    </div>
  );
}
