import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { getTrips } from '../utils/api';

const LocationBasedAdventures = () => {
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);
  const { formatPrice } = useContext(CurrencyContext);

  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [selectedLocKey, setSelectedLocKey] = useState('pyramids');
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simulated GPS Coordinates and Location Info
  const simulatedLocations = {
    pyramids: {
      nameEN: 'Giza Pyramids Plateau',
      nameAR: 'هضبة أهرامات الجيزة',
      coords: '29.9792° N, 31.1342° E',
      destinationName: 'Cairo',
      distances: {
        'Cairo Pyramids & Sphinx Full-Day Trip': '600m away',
        'Islamic Cairo & Khan El-Khalili Heritage Walk': '12.4km away',
        'Egyptian Museum & Old Cairo Private Tour': '10.8km away',
        'Cairo Nile Corniche Luxury Pool Day': '8.5km away',
        'Cairo Desert Escape: Spa & Wellness Day': '1.2km away'
      }
    },
    marina: {
      nameEN: 'Hurghada Marina Boulevard',
      nameAR: 'مارينا الغردقة السياحي',
      coords: '27.2579° N, 33.8116° E',
      destinationName: 'Hurghada',
      distances: {
        'Hurghada Red Sea Snorkeling & Island Cruise': '300m away',
        'Hurghada Deep Diving PADI Certification Trip': '1.5km away',
        'Hurghada Desert Safari & Quad Bike Adventure': '6.2km away',
        'Hurghada Beach Club: Water Sports & Snorkeling': '800m away',
        'Hurghada Luxury Marina Resort Day Pass': '400m away'
      }
    },
    luxor: {
      nameEN: 'Luxor East Bank (Nile Promenade)',
      nameAR: 'شرق الأقصر (ممشى النيل)',
      coords: '25.6872° N, 32.6396° E',
      destinationName: 'Luxor',
      distances: {
        'Luxor Valley of the Kings & Karnak Temple Tour': '2.1km away',
        'Luxor Hot Air Balloon & Nile Felucca Cruise': '1.1km away',
        'Upper Egypt Discovery: Luxor to Aswan Nile Cruise': '800m away',
        'Luxor East Bank Pool Day & Felucca Sunset': '300m away'
      }
    },
    dahab: {
      nameEN: 'Dahab Lighthouse Bay',
      nameAR: 'منطقة لايت هاوس دهب',
      coords: '28.5010° N, 34.5190° E',
      destinationName: 'Dahab',
      distances: {
        'Dahab Beach Yoga & Sunset Meditation Day': '200m away'
      }
    }
  };

  const activeLocation = simulatedLocations[selectedLocKey];

  // Fetch real matching adventures from backend when location changes or scans
  const fetchNearbyAdventures = async () => {
    setLoading(true);
    try {
      const res = await getTrips();
      const allList = Array.isArray(res) ? res : (res.data?.data || res.data || res.experiences || []);
      
      // Filter experiences matching the active location's destination
      const filtered = allList.filter(pkg => 
        pkg.destination?.name?.toLowerCase() === activeLocation.destinationName.toLowerCase()
      );

      // Map dynamic simulated distances
      const mapped = filtered.map(pkg => ({
        ...pkg,
        distanceTag: activeLocation.distances[pkg.name] || '1.8km away'
      }));

      setAdventures(mapped);
    } catch (err) {
      console.error('Failed to fetch location based experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanLocation = () => {
    setIsScanning(true);
    setHasScanned(false);

    // Simulate GPS scanning animation delay
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
      fetchNearbyAdventures();
    }, 1800);
  };

  // Re-fetch when simulated location changes, if already scanned
  useEffect(() => {
    if (hasScanned) {
      fetchNearbyAdventures();
    }
  }, [selectedLocKey]);

  return (
    <section className="tw-py-24 tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-border-t tw-border-slate-200 dark:tw-border-[#1b1e24]/40 tw-transition-colors">
      <div className="tw-container tw-mx-auto tw-px-4">
        
        {/* Title Block */}
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

        {/* Interactive Glass Panel Container */}
        <div className="tw-bg-white dark:tw-bg-[#121418]/80 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-white/5 tw-rounded-2xl tw-p-6 md:tw-p-8 tw-shadow-xl tw-max-w-5xl tw-mx-auto">
          
          <div className="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-8 tw-items-start">
            
            {/* Left Side: GPS Radar and Simulator Panel */}
            <div className="lg:tw-col-span-5 tw-flex tw-flex-col tw-gap-6 tw-bg-slate-100/50 dark:tw-bg-black/25 tw-border tw-border-slate-200 dark:tw-border-white/5 tw-rounded-xl tw-p-6">
              
              {/* Radar Scanner Block */}
              <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
                <div className="tw-relative tw-w-28 tw-h-28 tw-mb-4">
                  {/* Outer Pulsing Rings */}
                  <div className={`tw-absolute tw-inset-0 tw-rounded-full tw-bg-amber-500/20 tw-transition-all ${isScanning ? 'tw-animate-ping' : ''}`}></div>
                  <div className="tw-absolute tw-inset-2 tw-rounded-full tw-bg-amber-500/10 tw-border tw-border-amber-500/20"></div>
                  
                  {/* Central Radar Disk */}
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
                
                {/* Geo Coordinates Output */}
                <code className="tw-text-xs tw-text-amber-500/90 dark:tw-text-amber-400 tw-font-mono tw-bg-amber-500/5 tw-px-3 tw-py-1 tw-rounded-full tw-border tw-border-amber-500/10 tw-mt-2">
                  {isScanning 
                    ? '29.9792° N, 31.1342° E...' 
                    : hasScanned 
                      ? activeLocation.coords 
                      : '0.0000° N, 0.0000° E'}
                </code>
              </div>

              {/* Actions & Dropdowns */}
              <div className="tw-flex tw-flex-col tw-gap-4 tw-mt-4">
                
                {/* Simulated Location Selector (Demo Mode) */}
                <div className="tw-flex tw-flex-col tw-gap-1.5">
                  <label className="tw-text-[10px] tw-tracking-widest tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-uppercase">
                    {lang === 'AR' ? 'أداة المحاكاة للجنة المناقشة' : 'Simulation Tool for Jurors'}
                  </label>
                  <select 
                    className="tw-bg-white dark:tw-bg-black/50 tw-text-slate-900 dark:tw-text-white tw-w-full tw-outline-none tw-appearance-none tw-cursor-pointer tw-font-medium tw-px-4 tw-py-3 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl hover:tw-border-amber-500/40 focus:tw-border-amber-500 tw-transition-all"
                    value={selectedLocKey}
                    onChange={(e) => setSelectedLocKey(e.target.value)}
                    disabled={isScanning}
                  >
                    <option value="pyramids">{lang === 'AR' ? 'هضبة الأهرامات (الجيزة / القاهرة)' : 'Giza Pyramids Plateau (Cairo)'}</option>
                    <option value="marina">{lang === 'AR' ? 'مارينا الغردقة (البحر الأحمر)' : 'Hurghada Marina (Red Sea)'}</option>
                    <option value="luxor">{lang === 'AR' ? 'معابد الكرنك / شرق الأقصر' : 'Karnak Temples (East Luxor)'}</option>
                    <option value="dahab">{lang === 'AR' ? 'خليج لايتهاوس (دهب)' : 'Lighthouse Bay (Dahab)'}</option>
                  </select>
                </div>

                {/* Primary Scan Button */}
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

            {/* Right Side: Matched Nearby Adventures list */}
            <div className="lg:tw-col-span-7 tw-min-h-[300px] tw-flex tw-flex-col tw-justify-center">
              
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

              {isScanning && (
                <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16 tw-gap-4">
                  <i className="fa-solid fa-circle-notch fa-spin tw-text-4xl tw-text-amber-500"></i>
                  <div className="tw-flex tw-flex-col tw-items-center tw-text-center">
                    <span className="tw-text-xs tw-font-bold tw-text-amber-500 tw-tracking-widest tw-uppercase tw-animate-pulse">
                      {lang === 'AR' ? 'جاري الاتصال بالأقمار الصناعية...' : 'CONNECTING TO SATELLITES...'}
                    </span>
                    <span className="tw-text-[10px] tw-text-slate-400 tw-font-mono tw-mt-1">
                      {lang === 'AR' ? 'بحث في تجارب ' : 'Searching experiences in '} {activeLocation.destinationName}...
                    </span>
                  </div>
                </div>
              )}

              {hasScanned && !isScanning && (
                <div className="tw-flex tw-flex-col tw-gap-4">
                  
                  {/* Subtitle listing the matched destination */}
                  <div className="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-slate-100 dark:tw-border-slate-800 tw-pb-3">
                    <span className="tw-text-xs tw-font-bold tw-text-slate-500 dark:tw-text-slate-400">
                      {lang === 'AR' ? `المغامرات القريبة في ${activeLocation.nameAR}:` : `Immediate Adventures Near ${activeLocation.nameEN}:`}
                    </span>
                    <span className="tw-text-xs tw-bg-amber-500/10 tw-text-amber-500 tw-px-2.5 tw-py-0.5 tw-font-bold tw-rounded-full">
                      {adventures.length} {lang === 'AR' ? 'أنشطة قريبة' : 'Matched'}
                    </span>
                  </div>

                  {loading ? (
                    <div className="tw-text-center tw-py-12">
                      <i className="fa-solid fa-circle-notch fa-spin tw-text-2xl tw-text-amber-500"></i>
                    </div>
                  ) : adventures.length === 0 ? (
                    <div className="tw-text-center tw-py-8 tw-text-slate-500">
                      <i className="fa-solid fa-ghost tw-text-4xl tw-mb-2"></i>
                      <p className="tw-text-xs">{lang === 'AR' ? 'لا توجد أنشطة قريبة متاحة في قاعدة البيانات حالياً.' : 'No immediate adventures available in this region currently.'}</p>
                    </div>
                  ) : (
                    <div className="tw-flex tw-flex-col tw-gap-4.5">
                      {adventures.map((pkg) => (
                        <div 
                          key={pkg._id} 
                          className="tw-flex tw-flex-col sm:tw-flex-row tw-bg-slate-50 dark:tw-bg-black/30 tw-border tw-border-slate-100 dark:tw-border-white/5 tw-rounded-xl tw-overflow-hidden hover:tw-border-amber-500/30 tw-transition-all group"
                        >
                          {pkg.image && (
                            <div className="sm:tw-w-28 tw-h-24 sm:tw-h-auto tw-relative tw-overflow-hidden tw-flex-shrink-0">
                              <img 
                                src={pkg.image} 
                                alt={pkg.name} 
                                className="tw-w-full tw-h-full tw-object-cover group-hover:tw-scale-110 tw-transition-transform tw-duration-500" 
                              />
                              {/* Pulse location pin badge */}
                              <div className="tw-absolute tw-top-2 tw-left-2 tw-bg-amber-500 tw-text-slate-900 tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[9px] tw-font-bold tw-flex tw-items-center tw-gap-1">
                                <i className="fa-solid fa-location-dot tw-animate-bounce"></i>
                                {pkg.distanceTag}
                              </div>
                            </div>
                          )}

                          <div className="tw-p-4 tw-flex-1 tw-flex tw-flex-col tw-justify-between">
                            <div>
                              <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                                <span className="tw-text-[9px] tw-font-bold tw-text-amber-500 tw-tracking-widest tw-uppercase">
                                  {pkg.type === 'Trip' ? (lang === 'AR' ? 'تاريخي' : 'Trip') : (lang === 'AR' ? 'يوم ترفيهي' : 'Day Use')}
                                </span>
                                <span className="tw-text-[10px] tw-text-slate-400">
                                  <i className="fa-regular fa-clock"></i> {pkg.duration_days} {lang === 'AR' ? 'أيام' : 'days'}
                                </span>
                              </div>
                              <h4 className="tw-text-sm tw-font-bold tw-text-slate-950 dark:tw-text-white tw-mb-1.5 line-clamp-1 group-hover:tw-text-amber-500 tw-transition-colors">
                                {pkg.name}
                              </h4>
                              <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-text-[11.5px] tw-line-clamp-1 tw-mb-3">
                                {pkg.description}
                              </p>
                            </div>

                            <div className="tw-flex tw-items-center tw-justify-between tw-border-t tw-border-slate-100 dark:tw-border-slate-800/40 tw-pt-3">
                              <div>
                                <span className="tw-text-[9px] tw-text-slate-500 dark:tw-text-slate-500 tw-block">
                                  {lang === 'AR' ? 'السعر الثابت' : 'FIXED PRICE'}
                                </span>
                                <span className="tw-text-sm tw-font-bold tw-text-amber-500">
                                  {formatPrice(pkg.price || pkg.base_price)}
                                </span>
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
