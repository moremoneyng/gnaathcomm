'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import styles from './BrandMarquee.module.css';

export const BrandMarquee: React.FC = () => {
  const { storeConfig, setSelectedCategory, setSearchQuery } = useStore();

  const handleBrandClick = (brandName: string) => {
    setSelectedCategory('all');
    setSearchQuery(brandName);
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderBrand = (brand: string, duplicate = false) => (
    <li key={`${duplicate ? 'duplicate-' : ''}${brand}`}>
      <button
        onClick={() => handleBrandClick(brand)}
        className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        title={`View ${brand} products`}
        tabIndex={duplicate ? -1 : undefined}
      >
        {brand}
      </button>
    </li>
  );

  return (
    <section
      className="border-y border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-6"
      aria-label="Product brands"
    >
      <div className={styles.viewport}>
        <div className={styles.track}>
          <ul className={styles.group}>
            {storeConfig.brands.map((brand) => renderBrand(brand))}
          </ul>
          <ul className={`${styles.group} ${styles.duplicate}`} aria-hidden="true">
            {storeConfig.brands.map((brand) => renderBrand(brand, true))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
