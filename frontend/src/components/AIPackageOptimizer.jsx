import React, { useState, useEffect, useMemo } from 'react';
import { getPriceOptimization } from '../utils/api';

const SLIDERS = [
  { key: 'adventure', labelEN: 'Adventure Level', labelAR: 'مستوى المغامرة', icon: 'fa-mountain' },
  { key: 'luxury', labelEN: 'Luxury & Comfort', labelAR: 'الفخامة والراحة', icon: 'fa-gem' },
  { key: 'cultural', labelEN: 'Cultural Immersion', labelAR: 'الانغماس الثقافي', icon: 'fa-mosque' },
];

/**
 * Read-only AI-style price preview for tourists.
 * Does NOT mutate DB — uses local weighting + optional server optimize-price hint.
 */
const AIPackageOptimizer = ({ experienceId, basePrice = 0, lang = 'EN', formatPrice = (n) => `${n} EGP` }) => {
  const [levels, setLevels] = useState({ adventure: 50, luxury: 50, cultural: 50 });
  const [computing, setComputing] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(basePrice);
  const [marketHint, setMarketHint] = useState(null);

  useEffect(() => {
    setDisplayPrice(basePrice);
  }, [basePrice]);

  useEffect(() => {
    if (!experienceId || experienceId.startsWith('demo')) return;
    getPriceOptimization(experienceId)
      .then((res) => {
        const data = res?.data || res;
        if (data?.recommendedPrice) {
          setMarketHint(Number(data.recommendedPrice));
        }
      })
      .catch(() => {});
  }, [experienceId]);

  const localOptimized = useMemo(() => {
    const { adventure, luxury, cultural } = levels;
    const multiplier =
      1 +
      (luxury - 50) * 0.004 +
      (adventure - 50) * 0.003 +
      (cultural - 50) * 0.0025;
    return Math.max(0, Math.round(basePrice * multiplier));
  }, [levels, basePrice]);

  useEffect(() => {
    setComputing(true);
    const t = setTimeout(() => {
      setDisplayPrice(localOptimized);
      setComputing(false);
    }, 650);
    return () => clearTimeout(t);
  }, [localOptimized]);

  const handleSlider = (key, value) => {
    setLevels((prev) => ({ ...prev, [key]: Number(value) }));
  };

  if (!basePrice) return null;

  return (
    <section
      className="tw-relative tw-overflow-hidden tw-rounded-2xl tw-p-6 tw-mb-8 tw-border tw-border-indigo-500/30"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.85) 50%, rgba(15,23,42,0.95) 100%)',
        boxShadow: '0 0 40px rgba(99,102,241,0.15)',
      }}
    >
      <div className="tw-absolute tw-inset-0 tw-pointer-events-none tw-opacity-30"
        style={{ background: 'radial-gradient(circle at 20% 50%, rgba(56,189,248,0.2), transparent 50%)' }}
      />

      <div className="tw-relative tw-z-10">
        <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-mb-6">
          <div>
            <p className="tw-text-cyan-400 tw-text-[10px] tw-font-black tw-uppercase tw-tracking-[0.2em] tw-m-0 tw-flex tw-items-center tw-gap-2">
              <i className="fa-solid fa-wand-magic-sparkles" />
              {lang === 'AR' ? 'محسّن الباقة بالذكاء الاصطناعي' : 'AI Package Optimizer'}
            </p>
            <h3 className="tw-text-white tw-text-xl tw-font-bold tw-mt-1 tw-mb-0">
              {lang === 'AR' ? 'خصّص اهتماماتك — السعر الثابت يتحدّث فوراً' : 'Tune your preferences — fixed price updates instantly'}
            </h3>
          </div>
          <div className="tw-text-right">
            {computing ? (
              <div className="tw-flex tw-items-center tw-gap-2 tw-text-cyan-300 tw-text-sm">
                <i className="fa-solid fa-circle-notch fa-spin" />
                {lang === 'AR' ? 'جاري الحساب الذكي...' : 'AI recalculating...'}
              </div>
            ) : (
              <>
                <p className="tw-text-slate-400 tw-text-xs tw-m-0">{lang === 'AR' ? 'السعر الثابت المحسّن' : 'AI-Optimized Fixed Price'}</p>
                <p className="tw-text-3xl tw-font-black tw-text-amber-400 tw-m-0">{formatPrice(displayPrice)}</p>
                {marketHint && Math.abs(marketHint - displayPrice) > 50 && (
                  <p className="tw-text-slate-500 tw-text-[10px] tw-mt-1 tw-m-0">
                    {lang === 'AR' ? `مرجع السوق: ${formatPrice(marketHint)}` : `Market AI ref: ${formatPrice(marketHint)}`}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-5">
          {SLIDERS.map(({ key, labelEN, labelAR, icon }) => (
            <div key={key} className="tw-bg-white/5 tw-rounded-xl tw-p-4 tw-border tw-border-white/10">
              <label className="tw-flex tw-items-center tw-gap-2 tw-text-slate-300 tw-text-sm tw-font-semibold tw-mb-3">
                <i className={`fa-solid ${icon} tw-text-cyan-400`} />
                {lang === 'AR' ? labelAR : labelEN}
                <span className="tw-ml-auto tw-text-amber-400 tw-font-bold">{levels[key]}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={levels[key]}
                onChange={(e) => handleSlider(key, e.target.value)}
                className="tw-w-full tw-accent-cyan-400 tw-cursor-pointer"
              />
            </div>
          ))}
        </div>

        <p className="tw-text-slate-500 tw-text-xs tw-mt-4 tw-mb-0 tw-italic">
          {lang === 'AR'
            ? '* معاينة فقط — السعر النهائي يُثبت عند الحجز. لا رسوم خفية.'
            : '* Preview only — final price locks at checkout. Zero hidden fees.'}
        </p>
      </div>
    </section>
  );
};

export default AIPackageOptimizer;
