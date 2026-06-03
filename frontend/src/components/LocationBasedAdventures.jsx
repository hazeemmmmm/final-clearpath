import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { getNearbyExperiences } from '../utils/api';

// Simulation locations for jurors — each maps to a real DB destination
const SIMULATED_LOCATIONS = {
  pyramids: {
    nameEN: 'Giza Pyramids Plateau (Cairo)',
    nameAR: 'هضبة الأهرامات — القاهرة',
    lat: 29.9792,
    lng: 31.1342,
    coordLabel: '29.9792° N, 31.1342° E',
  },
  sokhna: {
    nameEN: 'Porto Sokhna Marina (Ain Sokhna)',
    nameAR: 'مارينا بورتو السخنة — عين السخنة',
    lat: 29.6077,
    lng: 32.3481,
    coordLabel: '29.6077° N, 32.3481° E',
  },
  sharm: {
    nameEN: 'Naama Bay (Sharm El Sheikh)',
    nameAR: 'خليج نعمة — شرم الشيخ',
    lat: 27.9158,
    lng: 34.4309,
    coordLabel: '27.9158° N, 34.4309° E',
  },
  alex: {
    nameEN: 'Corniche (Alexandria)',
    nameAR: 'الكورنيش — الإسكندرية',
    lat: 31.2001,
    lng: 29.9187,
    coordLabel: '31.2001° N, 29.9187° E',
  },
};

const LocationBasedAdventures = () => {
  const navigate    = useNavigate();
  const { lang }    = useContext(LanguageContext);
  const { formatPrice } = useContext(CurrencyContext);

  const [isScanning,      setIsScanning]      = useState(false);
  const [hasScanned,      setHasScanned]       = useState(false);
  const [adventures,      setAdventures]       = useState([]);
  const [loading,         setLoading]          = useState(false);
  const [gpsMode,         setGpsMode]          = useState('simulated'); // 'real' | 'simulated' | 'denied'
  const [activeLat,       setActiveLat]        = useState(null);
  const [activeLng,       setActiveLng]        = useState(null);
  const [activeCoordLabel, setActiveCoordLabel] = useState('0.0000° N, 0.0000° E');
  const [selectedLocKey,  setSelectedLocKey]   = useState('pyramids');
  const [expandedSearch,  setExpandedSearch]   = useState(false);
  const [radiusKm,        setRadiusKm]         = useState(50);

  const simLoc = SIMULATED_LOCATIONS[selectedLocKey];

  const fetchNearby = async (lat, lng) => {
    setLoading(true);
    setAdventures([]);
    try {
      const res = await getNearbyExperiences({ lat, lng, radiusKm });
      const exps = res?.experiences || [];
      setAdventures(exps);
      setExpandedSearch(res?.expanded || false);
    } catch (err) {
      console.error('getNearby failed:', err);
      setAdventures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScanLocation = () => {
    setIsScanning(true);
    setHasScanned(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const label = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
          setActiveLat(lat);
          setActiveLng(lng);
          setActiveCoordLabel(label);
          setGpsMode('real');
          setTimeout(() => {
            setIsScanning(false);
            setHasScanned(true);
            fetchNearby(lat, lng);
          }, 1800);
        },
        () => {
          // Permission denied — fall back to simulation
          useSimulated();
        },
        { timeout: 4000 }
      );
    } else {
      useSimulated();
    }
  };

  const useSimulated = () => {
    const loc = SIMULATED_LOCATIONS[selectedLocKey];
    setActiveLat(loc.lat);
    setActiveLng(loc.lng);
    setActiveCoordLabel(loc.coordLabel);
    setGpsMode('simulated');
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
      fetchNearby(loc.lat, loc.lng);
    }, 1800);
  };

  // Re-fetch when simulated location changes and already scanned
  useEffect(() => {
    if (hasScanned && gpsMode !== 'real') {
      const loc = SIMULATED_LOCATIONS[selectedLocKey];
      setActiveLat(loc.lat);
      setActiveLng(loc.lng);
      setActiveCoordLabel(loc.coordLabel);
      fetchNearby(loc.lat, loc.lng);
    }
  }, [selectedLocKey]);

  return (
    <section className="tw-py-24 tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border-t tw-border-slate-200 dark:tw-border-[#1b1e24]/40 tw-transition-colors">
      <div className="tw-container tw-mx-auto tw-px-4">

        {/* Title */}
        <div className="tw-text-center tw-mb-12">
          <h4 className="tw-text-amber-500 tw-text-xs tw-font-bold tw-tracking-widest tw-uppercase tw-mb-3">
            {lang === 'AR' ? 'الاستمرار السلس للرحلات' : 'SEAMLESS TRIP CONTINUATION'}
          </h4>
          <h2 className="tw-text-3xl md:tw-text-5xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white">
            {lang === 'AR' ? 'ابحث عن مغامرات قريبة من موقعك' : 'Discover Adventures Near You'}
          </h2>
          <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm tw-max-w-2xl tw-mx-auto tw-mt-4 tw-leading-relaxed">
            {lang === 'AR'
              ? 'هل أنهيت رحلتك الحالية للتو؟ اسمح للـ GPS بتحديد موقعك فوراً ليقترح عليك عروضاً استثنائية وأنشطة ترفيهية تبدأ فوراً من مكانك الحالي دون أي وقت ضائع.'
              : 'Finished your tour or just looking to extend? Let GPS pinpoint your location to instantly suggest exclusive day-use retreats or next-step experiences starting right from where you stand.'}
          </p>
        </div>

        {/* Glass Panel */}
        <div className="tw-bg-white dark:tw-bg-[#121418]/80 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-white/5 tw-rounded-2xl tw-p-6 md:tw-p-8 tw-shadow-xl tw-max-w-5xl tw-mx-auto">
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8 tw-items-start">

            {/* Left: GPS Radar + Controls */}
            <div className="lg:tw-col-span-5 tw-flex tw-flex-col tw-gap-6 tw-bg-slate-100/50 dark:tw-bg-black/25 tw-border tw-border-slate-200 dark:tw-border-white/5 tw-rounded-xl tw-p-6">

              {/* Radar */}
              <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
                <div className="tw-relative tw-w-28 tw-h-28 tw-mb-4">
                  <div className={`tw-absolute tw-inset-0 tw-rounded-full tw-bg-amber-500/20 tw-transition-all ${isScanning ? 'tw-animate-ping' : ''}`}></div>
                  <div className="tw-absolute tw-inset-2 tw-rounded-full tw-bg-amber-500/10 tw-border tw-border-amber-500/20"></div>
                  <div className="tw-absolute tw-inset-4 tw-rounded-full tw-bg-slate-900 dark:tw-bg-black tw-border tw-border-amber-500/30 tw-flex tw-items-center tw-justify-center">
                    <i className={`fa-solid fa-compass tw-text-3xl tw-text-amber-500 ${isScanning ? 'tw-animate-spin' : ''}`}></i>
                  </div>
                </div>

                <h3 className="tw-text-base tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-1">
                  {isScanning
                    ? (lang === 'AR' ? 'جاري لقط إحداثيات الـ GPS...' : 'Acquiring GPS coordinates...')
                    : hasScanned
                      ? (lang === 'AR' ? 'تم تحديد الموقع بنجاح' : 'Location Pinpointed!')
                      : (lang === 'AR' ? 'مستعد للبحث عن موقعك' : 'Ready to Pinpoint Location')}
                </h3>

                <code className="tw-text-xs tw-text-amber-500/90 dark:tw-text-amber-400 tw-font-mono tw-bg-amber-500/5 tw-px-3 tw-py-1 tw-rounded-full tw-border tw-border-amber-500/10 tw-mt-2">
                  {isScanning ? '...' : hasScanned ? activeCoordLabel : '0.0000° N, 0.0000° E'}
                </code>

                {/* GPS mode badge */}
                {hasScanned && (
                  <span className={`tw-mt-2 tw-text-[9px] tw-font-bold tw-tracking-widest tw-uppercase tw-px-2.5 tw-py-0.5 tw-rounded-full ${
                    gpsMode === 'real'
                      ? 'tw-bg-green-500/10 tw-text-green-500'
                      : 'tw-bg-blue-500/10 tw-text-blue-400'
                  }`}>
                    {gpsMode === 'real'
                      ? (lang === 'AR' ? 'GPS حقيقي' : 'Live GPS')
                      : (lang === 'AR' ? 'محاكاة' : 'Simulated')}
                  </span>
                )}
              </div>

              {/* Controls */}
              <div className="tw-flex tw-flex-col tw-gap-4 tw-mt-2">

                {/* Radius selector */}
                <div className="tw-flex tw-flex-col tw-gap-1.5">
                  <label className="tw-text-[10px] tw-tracking-widest tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-uppercase">
                    {lang === 'AR' ? 'نطاق البحث' : 'Search Radius'}
                  </label>
                  <select
                    className="tw-bg-white dark:tw-bg-black/50 tw-text-slate-900 dark:tw-text-white tw-w-full tw-outline-none tw-appearance-none tw-cursor-pointer tw-font-medium tw-px-4 tw-py-3 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl hover:tw-border-amber-500/40 focus:tw-border-amber-500 tw-transition-all"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    disabled={isScanning}
                  >
                    <option value={15}>{lang === 'AR' ? '15 كم — محلي' : '15 km — Local'}</option>
                    <option value={50}>{lang === 'AR' ? '50 كم — إقليمي' : '50 km — Regional'}</option>
                    <option value={150}>{lang === 'AR' ? '150 كم — موسع' : '150 km — Extended'}</option>
                  </select>
                </div>

                {/* Scan button */}
                <button
                  onClick={handleScanLocation}
                  disabled={isScanning}
                  className="tw-w-full tw-bg-gradient-to-r tw-from-amber-400 tw-to-yellow-500 hover:tw-from-amber-300 hover:tw-to-yellow-400 tw-text-slate-900 tw-font-bold tw-py-3.5 tw-px-6 tw-rounded-xl tw-shadow-lg hover:tw-shadow-amber-500/20 tw-transition-all tw-tracking-wide tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-opacity-65 disabled:tw-cursor-not-allowed"
                >
                  {isScanning ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>{lang === 'AR' ? 'جاري المسح...' : 'Scanning GPS...'}</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-location-crosshairs"></i>
                      <span>{lang === 'AR' ? 'حدد موقعي بالـ GPS وابحث' : 'Scan My Location & Recommend'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Results panel */}
            <div className="lg:tw-col-span-7 tw-min-h-[300px] tw-flex tw-flex-col tw-justify-center">

              {/* Pre-scan placeholder */}
              {!hasScanned && !isScanning && (
                <div className="tw-text-center tw-py-12 tw-text-slate-400 dark:tw-text-slate-600">
                  <i className="fa-solid fa-map-location-dot tw-text-6xl tw-mb-4 tw-text-slate-300 dark:tw-text-slate-800"></i>
                  <h4 className="tw-text-base tw-font-bold tw-text-slate-600 dark:tw-text-slate-400 tw-mb-2">
                    {lang === 'AR' ? 'تحديد الموقع مطلوب' : 'Location Scan Required'}
                  </h4>
                  <p className="tw-text-xs tw-max-w-md tw-mx-auto">
                    {lang === 'AR'
                      ? 'يرجى الضغط على زر تحديد الموقع على اليسار لبدء لقط الـ GPS وإيجاد أفضل الأنشطة التي تبدأ فوراً من مكانك الحالي.'
                      : 'Please trigger the location scan on the left to simulate active GPS tracking and fetch available next-day or immediate activities near you.'}
                  </p>
                </div>
              )}

              {/* Scanning animation */}
              {isScanning && (
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-gap-4">
                  <i className="fa-solid fa-circle-notch fa-spin tw-text-4xl tw-text-amber-500"></i>
                  <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
                    <span className="tw-text-xs tw-font-bold tw-text-amber-500 tw-tracking-widest tw-uppercase tw-animate-pulse">
                      {lang === 'AR' ? 'جاري الاتصال بالأقمار الصناعية...' : 'CONNECTING TO SATELLITES...'}
                    </span>
                    <span className="tw-text-[10px] tw-text-slate-400 tw-font-mono tw-mt-1">
                      {lang === 'AR' ? `بحث في نطاق ${radiusKm} كم...` : `Searching within ${radiusKm} km...`}
                    </span>
                  </div>
                </div>
              )}

              {/* Results */}
              {hasScanned && !isScanning && (
                <div className="tw-flex tw-flex-col tw-gap-4">

                  {/* Header row */}
                  <div className="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-slate-100 dark:tw-border-slate-800 tw-pb-3">
                    <span className="tw-text-xs tw-font-bold tw-text-slate-500 dark:tw-text-slate-400">
                      {expandedSearch
                        ? (lang === 'AR' ? 'نتائج البحث الموسع:' : 'Expanded Search Results:')
                        : (lang === 'AR' ? 'المغامرات القريبة:' : 'Nearby Adventures:')}
                    </span>
                    <span className="tw-text-xs tw-bg-amber-500/10 tw-text-amber-500 tw-px-2.5 tw-py-0.5 tw-font-bold tw-rounded-full">
                      {adventures.length} {lang === 'AR' ? 'نتيجة' : 'Found'}
                    </span>
                  </div>

                  {/* Expanded radius notice */}
                  {expandedSearch && adventures.length > 0 && (
                    <div className="tw-flex tw-items-center tw-gap-2 tw-bg-blue-500/5 tw-border tw-border-blue-500/20 tw-rounded-xl tw-px-4 tw-py-2.5">
                      <i className="fa-solid fa-circle-info tw-text-blue-400 tw-text-xs"></i>
                      <p className="tw-text-[10.5px] tw-text-blue-400">
                        {lang === 'AR'
                          ? `لم تُوجد تجارب قريبة — تم توسيع النطاق تلقائياً إلى ${radiusKm * 3} كم`
                          : `No close matches — radius auto-expanded to ${radiusKm * 3} km`}
                      </p>
                    </div>
                  )}

                  {loading ? (
                    <div className="tw-text-center tw-py-12">
                      <i className="fa-solid fa-circle-notch fa-spin tw-text-2xl tw-text-amber-500"></i>
                    </div>
                  ) : adventures.length === 0 ? (
                    /* Smart empty state */
                    <div className="tw-text-center tw-py-8 tw-text-slate-500">
                      <i className="fa-solid fa-satellite-dish tw-text-4xl tw-mb-3 tw-text-slate-300 dark:tw-text-slate-700"></i>
                      <p className="tw-text-sm tw-font-bold tw-mb-1 tw-text-slate-600 dark:tw-text-slate-400">
                        {lang === 'AR' ? 'لا توجد تجارب في هذا النطاق حالياً' : 'No experiences in range right now'}
                      </p>
                      <p className="tw-text-[11px] tw-text-slate-400">
                        {lang === 'AR'
                          ? 'جرّب تغيير موقع المحاكاة أو توسيع نطاق البحث'
                          : 'Try a different simulation location or expand the search radius'}
                      </p>
                    </div>
                  ) : (
                    <div className="tw-flex tw-flex-col tw-gap-3.5">
                      {adventures.map((pkg) => (
                        <div
                          key={pkg._id}
                          className="tw-flex tw-flex-col sm:tw-flex-row tw-bg-slate-50 dark:tw-bg-black/30 tw-border tw-border-slate-100 dark:tw-border-white/5 tw-rounded-xl tw-overflow-hidden hover:tw-border-amber-500/30 tw-transition-all group"
                        >
                          {/* Thumbnail */}
                          {pkg.image && (
                            <div className="sm:tw-w-28 tw-h-24 sm:tw-h-auto tw-relative tw-overflow-hidden tw-flex-shrink-0">
                              <img
                                src={pkg.image}
                                alt={pkg.name}
                                className="tw-w-full tw-h-full tw-object-cover group-hover:tw-scale-110 tw-transition-transform tw-duration-500"
                              />
                              {/* Distance badge */}
                              <div className="tw-absolute tw-top-2 tw-left-2 tw-bg-amber-500 tw-text-slate-900 tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[9px] tw-font-bold tw-flex tw-items-center tw-gap-1">
                                <i className="fa-solid fa-location-dot tw-animate-bounce"></i>
                                {pkg.proximityLabel || 'Nearby'}
                              </div>
                            </div>
                          )}

                          {/* Info */}
                          <div className="tw-p-4 tw-flex-1 tw-flex tw-flex-col tw-justify-between">
                            <div>
                              <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                                <span className="tw-text-[9px] tw-font-bold tw-text-amber-500 tw-tracking-widest tw-uppercase">
                                  {pkg.type === 'Trip'
                                    ? (lang === 'AR' ? 'رحلة' : 'Trip')
                                    : (lang === 'AR' ? 'يوم ترفيهي' : 'Day Use')}
                                </span>
                                <span className="tw-text-[10px] tw-text-slate-400">
                                  <i className="fa-regular fa-clock tw-mr-1"></i>
                                  {pkg.duration_days} {lang === 'AR' ? 'أيام' : 'days'}
                                </span>
                              </div>
                              <h4 className="tw-text-sm tw-font-bold tw-text-slate-950 dark:tw-text-white tw-mb-1.5 tw-line-clamp-1 group-hover:tw-text-amber-500 tw-transition-colors">
                                {pkg.name}
                              </h4>
                              <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-[11.5px] tw-line-clamp-1 tw-mb-3">
                                {pkg.description}
                              </p>
                            </div>

                            <div className="tw-flex tw-items-center tw-justify-between tw-border-t tw-border-slate-100 dark:tw-border-slate-800/40 tw-pt-3">
                              <div>
                                {/* Pricing tag badge */}
                                {pkg.pricingTag && (
                                  <span className={`tw-block tw-text-[9px] tw-font-bold tw-tracking-widest tw-uppercase tw-mb-0.5 ${
                                    pkg.discountPct
                                      ? 'tw-text-green-500'
                                      : 'tw-text-amber-400'
                                  }`}>
                                    {pkg.pricingTag}
                                    {pkg.discountPct ? ` —${pkg.discountPct}%` : ''}
                                  </span>
                                )}
                                {!pkg.pricingTag && (
                                  <span className="tw-block tw-text-[9px] tw-text-slate-500 tw-uppercase tw-tracking-widest tw-mb-0.5">
                                    {lang === 'AR' ? 'السعر الثابت' : 'FIXED PRICE'}
                                  </span>
                                )}
                                <div className="tw-flex tw-items-baseline tw-gap-1.5">
                                  {pkg.optimizedPrice ? (
                                    <>
                                      <span className="tw-text-sm tw-font-bold tw-text-green-500">
                                        {formatPrice(pkg.optimizedPrice)}
                                      </span>
                                      <span className="tw-text-xs tw-line-through tw-text-slate-400">
                                        {formatPrice(pkg.price)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="tw-text-sm tw-font-bold tw-text-amber-500">
                                      {formatPrice(pkg.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => navigate(`/package-details/${pkg._id}`)}
                                className="tw-bg-transparent tw-border tw-border-slate-200 dark:tw-border-slate-800 hover:tw-border-amber-500 tw-text-slate-700 dark:tw-text-white hover:tw-text-amber-500 tw-text-[10.5px] tw-font-bold tw-px-4 tw-py-2 tw-rounded-lg tw-transition-all"
                              >
                                {lang === 'AR' ? 'ابدأ الآن' : 'Start Extension'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default LocationBasedAdventures;
