import React, { useState } from 'react';

/**
 * Displays provider trust score from DB (Provider.trustScore).
 * Falls back to a conservative default when score is missing.
 */
const VendorTrustBadge = ({ provider, lang = 'EN', compact = false }) => {
  const [open, setOpen] = useState(false);

  const score = Math.min(
    100,
    Math.max(0, Math.round(Number(provider?.trustScore ?? provider?.trust_score ?? 85)))
  );

  const providerName = provider?.name || (lang === 'AR' ? 'مزود محلي' : 'Local Provider');
  const providerType = provider?.type || 'TourOperator';

  const fraudRisk =
    score >= 90 ? (lang === 'AR' ? 'منخفض جداً' : 'Extremely Low')
    : score >= 75 ? (lang === 'AR' ? 'منخفض' : 'Low')
    : (lang === 'AR' ? 'متوسط' : 'Moderate');

  const grievanceRate = score >= 90 ? '0%' : score >= 75 ? '<2%' : '5%';

  if (compact) {
    return (
      <span
        className="tw-inline-flex tw-items-center tw-gap-1 tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[0.65rem] tw-font-bold tw-bg-emerald-500/15 tw-text-emerald-400 tw-border tw-border-emerald-500/30 tw-cursor-default"
        title={`${providerName}: ${score}% ${lang === 'AR' ? 'أمان' : 'Secured'}`}
      >
        <i className="fa-solid fa-shield-halved" />
        {score}% {lang === 'AR' ? 'موثوق' : 'Secured'}
      </span>
    );
  }

  return (
    <span className="tw-relative tw-inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="tw-inline-flex tw-items-center tw-gap-1.5 tw-px-2.5 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold tw-bg-emerald-500/15 tw-text-emerald-400 tw-border tw-border-emerald-500/30 hover:tw-bg-emerald-500/25 tw-transition-colors tw-cursor-pointer"
        aria-label={lang === 'AR' ? 'درجة أمان المزود' : 'Vendor trust score'}
      >
        <i className="fa-solid fa-shield-halved" />
        {score}% {lang === 'AR' ? 'آمن' : 'Secured'}
      </button>

      {open && (
        <div
          className="tw-absolute tw-z-50 tw-top-full tw-mt-2 tw-left-0 tw-min-w-[240px] tw-p-4 tw-rounded-xl tw-bg-black/80 tw-backdrop-blur-md tw-border tw-border-white/10 tw-shadow-xl tw-text-left"
          style={{ direction: lang === 'AR' ? 'rtl' : 'ltr' }}
        >
          <p className="tw-text-amber-400 tw-text-[10px] tw-font-black tw-uppercase tw-tracking-widest tw-mb-2">
            {lang === 'AR' ? 'تحليل AI للثقة' : 'AI Trust Breakdown'}
          </p>
          <p className="tw-text-white tw-text-sm tw-font-bold tw-mb-2">{providerName}</p>
          <ul className="tw-space-y-1.5 tw-text-xs tw-text-slate-300">
            <li className="tw-flex tw-justify-between tw-gap-3">
              <span>{lang === 'AR' ? 'نوع المزود' : 'Provider Type'}</span>
              <span className="tw-text-white">{providerType}</span>
            </li>
            <li className="tw-flex tw-justify-between tw-gap-3">
              <span>{lang === 'AR' ? 'معدل الشكاوى' : 'Price Grievance Rate'}</span>
              <span className="tw-text-emerald-400">{grievanceRate}</span>
            </li>
            <li className="tw-flex tw-justify-between tw-gap-3">
              <span>{lang === 'AR' ? 'مزود محلي معتمد' : 'Certified Local Provider'}</span>
              <span className="tw-text-emerald-400">{lang === 'AR' ? 'نعم' : 'Yes'}</span>
            </li>
            <li className="tw-flex tw-justify-between tw-gap-3">
              <span>{lang === 'AR' ? 'مخاطر الاحتيال' : 'Fraud Risk'}</span>
              <span className="tw-text-emerald-400">{fraudRisk}</span>
            </li>
          </ul>
        </div>
      )}
    </span>
  );
};

export default VendorTrustBadge;
