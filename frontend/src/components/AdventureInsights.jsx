import React from 'react';

const normalizeSafetyTips = (tips) => {
  if (!tips || !Array.isArray(tips)) return [];
  return tips
    .map((t) => (typeof t === 'string' ? t : t?.tip || t?.text || ''))
    .filter(Boolean);
};

const normalizeEmergencyContacts = (contacts) => {
  if (!contacts) return [];
  if (Array.isArray(contacts)) {
    return contacts.map((c) => ({
      label: c.label || c.name || 'Contact',
      phone: c.phone || c.number || '',
    }));
  }
  if (typeof contacts === 'object') {
    const labels = {
      police: 'Police',
      ambulance: 'Ambulance',
      coastGuard: 'Coast Guard',
      localHospital: 'Local Hospital',
    };
    return Object.entries(contacts)
      .filter(([, value]) => value)
      .map(([key, value]) => ({
        label: labels[key] || key,
        phone: String(value),
      }));
  }
  return [];
};

const buildCulturalTips = (packageData, lang) => {
  const tips = [];

  (packageData?.itinerary || []).forEach((day) => {
    if (day.culturalGuide?.trim()) {
      tips.push({
        id: `day-${day.day_number}`,
        icon: 'fa-landmark',
        title:
          lang === 'AR'
            ? `اليوم ${day.day_number}${day.title ? `: ${day.title}` : ''}`
            : `Day ${day.day_number}${day.title ? `: ${day.title}` : ''}`,
        text: day.culturalGuide,
      });
    }
  });

  if (tips.length > 0) return tips;

  const dest = (packageData?.destination?.name || packageData?.name || '').toLowerCase();
  const generic =
    lang === 'AR'
      ? [
          { id: 'g1', icon: 'fa-handshake', title: 'آداب محلية', text: 'احترم العادات المحلية وارتدِ ملابس محتشمة عند زيارة المواقع الدينية.' },
          { id: 'g2', icon: 'fa-sun', title: 'أفضل وقت للنشاط', text: 'فضّل الأنشطة الخارجية في الصباح الباكر أو قبل الغروب لتجنب الحرارة.' },
          { id: 'g3', icon: 'fa-shield-halved', title: 'تجنب الاحتيال', text: 'احجز فقط عبر ClearPath — تجنب العروض الشفوية غير الموثقة في الشوارع.' },
        ]
      : [
          { id: 'g1', icon: 'fa-handshake', title: 'Local Customs', text: 'Dress modestly at religious sites and ask before photographing locals.' },
          { id: 'g2', icon: 'fa-sun', title: 'Best Activity Times', text: 'Schedule outdoor adventures early morning or late afternoon to avoid peak heat.' },
          { id: 'g3', icon: 'fa-shield-halved', title: 'Scam Prevention', text: 'Book only through ClearPath — avoid unverified street offers and touts.' },
        ];

  if (dest.includes('desert') || dest.includes('white') || dest.includes('safari')) {
    generic.unshift(
      lang === 'AR'
        ? { id: 'd1', icon: 'fa-wind', title: 'نصيحة صحراوية', text: 'احمل ماءً إضافياً وغطاء رأس — الرطوبة المنخفضة تزيد الجفاف بسرعة.' }
        : { id: 'd1', icon: 'fa-wind', title: 'Desert Tip', text: 'Carry extra water and head cover — low humidity dehydrates faster than you expect.' }
    );
  }

  return generic;
};

const AdventureInsights = ({
  packageData,
  packingGuide,
  lang = 'EN',
  checkedItems = {},
  onToggleItem,
}) => {
  if (!packageData) return null;

  const culturalTips = buildCulturalTips(packageData, lang);
  const packingItems = [
    ...(packingGuide?.essentials || []).map((item, idx) => ({
      key: `ess_${idx}`,
      label: typeof item === 'string' ? item : item.item || item.name || '',
    })),
    ...(packingGuide?.clothing || []).map((item, idx) => ({
      key: `clo_${idx}`,
      label: typeof item === 'string' ? item : item.item || item.name || '',
    })),
  ].filter((row) => row.label);
  const safetyTips = normalizeSafetyTips(packingGuide?.safetyTips);
  const emergency = normalizeEmergencyContacts(packingGuide?.emergencyContacts);

  return (
    <section className="tw-mt-10 tw-mb-10">
      <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-white tw-mb-6 tw-flex tw-items-center tw-gap-3">
        <i className="fa-solid fa-compass tw-text-amber-500" />
        {lang === 'AR' ? 'رؤى المغامرة والثقافة المحلية' : 'Adventure Insights & Local Guide'}
      </h2>

      <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
        {/* Cultural column */}
        <div className="tw-rounded-2xl tw-p-6 tw-bg-white/5 tw-backdrop-blur-sm tw-border tw-border-white/10">
          <h3 className="tw-text-amber-400 tw-text-sm tw-font-black tw-uppercase tw-tracking-widest tw-mb-4 tw-flex tw-items-center tw-gap-2">
            <i className="fa-solid fa-book-open" />
            {lang === 'AR' ? 'دليل محلي ونصائح ثقافية' : 'Local Guide & Cultural Insights'}
          </h3>
          <ul className="tw-space-y-4">
            {culturalTips.map((tip) => (
              <li key={tip.id} className="tw-flex tw-gap-3">
                <span className="tw-flex-shrink-0 tw-w-8 tw-h-8 tw-rounded-lg tw-bg-amber-500/15 tw-flex tw-items-center tw-justify-center">
                  <i className={`fa-solid ${tip.icon} tw-text-amber-400 tw-text-sm`} />
                </span>
                <div>
                  <p className="tw-text-white tw-font-bold tw-text-sm tw-m-0">{tip.title}</p>
                  <p className="tw-text-slate-400 tw-text-sm tw-mt-1 tw-m-0 tw-leading-relaxed">{tip.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Safety & packing column */}
        <div className="tw-rounded-2xl tw-p-6 tw-bg-white/5 tw-backdrop-blur-sm tw-border tw-border-white/10">
          <h3 className="tw-text-amber-400 tw-text-sm tw-font-black tw-uppercase tw-tracking-widest tw-mb-4 tw-flex tw-items-center tw-gap-2">
            <i className="fa-solid fa-shield-heart" />
            {lang === 'AR' ? 'بروتوكولات السلامة وقائمة التجهيز' : 'Safety Protocols & Packing Checklist'}
          </h3>

          {packingItems.length > 0 && (
            <div className="tw-mb-5">
              <p className="tw-text-slate-400 tw-text-xs tw-font-bold tw-uppercase tw-mb-2">
                {lang === 'AR' ? 'قائمة التجهيز' : 'Packing Checklist'}
              </p>
              <ul className="tw-space-y-2">
                {packingItems.map(({ key, label }) => {
                  const checked = !!checkedItems[key];
                  return (
                    <li key={key}>
                      <label className="tw-flex tw-items-center tw-gap-3 tw-cursor-pointer tw-group">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleItem?.(key)}
                          className="tw-accent-amber-500 tw-w-4 tw-h-4"
                        />
                        <span className={`tw-text-sm ${checked ? 'tw-text-slate-500 tw-line-through' : 'tw-text-slate-200'}`}>
                          {label}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {safetyTips.length > 0 && (
            <div className="tw-mb-4">
              <p className="tw-text-slate-400 tw-text-xs tw-font-bold tw-uppercase tw-mb-2">
                {lang === 'AR' ? 'تحذيرات السلامة' : 'Safety Warnings'}
              </p>
              <ul className="tw-space-y-2">
                {safetyTips.map((tip, idx) => (
                  <li key={idx} className="tw-flex tw-gap-2 tw-text-sm tw-text-slate-300">
                    <i className="fa-solid fa-triangle-exclamation tw-text-amber-500 tw-mt-0.5 tw-flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {emergency.length > 0 && (
            <div className="tw-p-3 tw-rounded-lg tw-bg-red-500/10 tw-border tw-border-red-500/20">
              <p className="tw-text-red-400 tw-text-xs tw-font-bold tw-uppercase tw-mb-2">
                {lang === 'AR' ? 'جهات الطوارئ' : 'Emergency Contacts'}
              </p>
              {emergency.map((c, idx) => (
                <p key={idx} className="tw-text-slate-300 tw-text-sm tw-m-0">
                  <strong className="tw-text-white">{c.label}:</strong> {c.phone}
                </p>
              ))}
            </div>
          )}

          {packingItems.length === 0 && safetyTips.length === 0 && (
            <p className="tw-text-slate-400 tw-text-sm tw-italic">
              {lang === 'AR'
                ? 'دليل التجهيز الكامل متاح في قسم أساسيات الرحلة أدناه.'
                : 'Full packing guide available in the Trip Essentials section below.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdventureInsights;
