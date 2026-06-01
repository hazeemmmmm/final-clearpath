import React from 'react';

/** Green verified badge for zero hidden fees guarantee */
const PricingGuaranteeBadge = ({ lang = 'EN', className = '' }) => (
  <div
    className={`tw-flex tw-items-center tw-gap-3 tw-p-3 tw-rounded-xl tw-bg-emerald-500/10 tw-border tw-border-emerald-500/30 ${className}`}
  >
    <div className="tw-flex-shrink-0 tw-w-10 tw-h-10 tw-rounded-full tw-bg-emerald-500/20 tw-flex tw-items-center tw-justify-center">
      <i className="fa-solid fa-shield-check tw-text-emerald-400 tw-text-lg" />
    </div>
    <div>
      <p className="tw-text-emerald-400 tw-text-xs tw-font-black tw-uppercase tw-tracking-wider tw-m-0">
        {lang === 'AR' ? 'ClearPath — سعر ثابت مضمون' : 'ClearPath Guaranteed Fixed Price'}
      </p>
      <p className="tw-text-slate-300 tw-text-[0.78rem] tw-m-0 tw-mt-0.5 tw-leading-snug">
        {lang === 'AR'
          ? 'رسوم خفية صفرية — النقل والتذاكر والضرائب مشمولة في السعر المعروض'
          : 'Verified Zero Hidden Fees — transport, entry fees & taxes included in displayed price'}
      </p>
    </div>
  </div>
);

export default PricingGuaranteeBadge;
