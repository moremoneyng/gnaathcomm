'use client';

import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { CategoryBar } from '@/components/CategoryBar';
import { ProductGrid } from '@/components/ProductGrid';
import { HomeServicesSpotlight } from '@/components/HomeServicesSpotlight';
import { LocationsSection } from '@/components/LocationsSection';
import { BrandMarquee } from '@/components/BrandMarquee';
import { Footer } from '@/components/Footer';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-emerald-500 selection:text-white">
      <main className="grow">
        <HeroSection />

        <BrandMarquee />

        <section id="catalog" className="mx-auto max-w-7xl scroll-mt-24 space-y-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <CategoryBar />
          <ProductGrid limit={12} />
        </section>

        <HomeServicesSpotlight />

        <LocationsSection />
      </main>

      <Footer />

      <ProductModal />
      <CartDrawer />
    </div>
  );
}
