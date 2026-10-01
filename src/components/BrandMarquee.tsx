'use client';

import React from 'react';

const MISSION_STATEMENT =
  'G Naath exists to redefine trust in commerce—delivering only genuine, certified and exceptional products, with uncompromising standards that build lasting confidence and a legacy across Africa and the world.';

/** Continuously scrolling mission statement shown just below the hero. */
export const BrandMarquee: React.FC = () => {
  const renderStatement = (duplicate = false) => (
    <li key={duplicate ? 'duplicate' : 'original'} className="flex shrink-0 items-center gap-6 pr-6">
      <span className="whitespace-nowrap font-heading text-base font-semibold tracking-tight text-ink-900 sm:text-lg">
        {MISSION_STATEMENT}
      </span>
      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
    </li>
  );

  return (
    <section className="border-y border-slate-200 bg-linear-to-r from-slate-50 via-white to-slate-50 py-5" aria-label="Our mission">
      <div className="marquee-viewport">
        <div className="marquee-track" style={{ animationDuration: '45s' }}>
          <ul className="marquee-group">{renderStatement()}</ul>
          <ul className="marquee-group marquee-duplicate" aria-hidden="true">
            {renderStatement(true)}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;
