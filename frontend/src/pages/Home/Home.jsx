import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import LocationBasedAdventures from '../../components/LocationBasedAdventures';
import { LanguageContext } from '../../context/LanguageContext';
import { CurrencyContext } from '../../context/CurrencyContext';
import { getTrips, getFilterOptions, trackInteraction } from '../../utils/api';

const ExperienceCard = ({ pkg, lang, navigate }) => {
  const { currency, convertPrice } = useContext(CurrencyContext);
  const displayedPrice = convertPrice(pkg.price);

  return (
    <div 
      onClick={() => {
        trackInteraction({ experienceId: pkg._id, action: 'click', role: 'user', source: 'home' }).catch(() => {});
        navigate(`/package-details/${pkg._id}`);
      }}
      className="tw-bg-white dark:tw-bg-[#15171a] tw-border tw-border-slate-100 dark:tw-border-none tw-shadow-sm dark:tw-shadow-none tw-rounded-sm tw-overflow-hidden tw-cursor-pointer tw-flex-shrink-0 tw-w-full md:tw-w-[350px] tw-snap-start tw-flex tw-flex-col hover:tw-shadow-xl hover:-tw-translate-y-1 tw-transition-all tw-duration-300 group"
    >
      <div className="tw-relative tw-h-56 tw-w-full tw-overflow-hidden">
        <img src={pkg.image || "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800&auto=format&fit=crop"} alt={lang === 'AR' ? pkg.name : pkg.name} className="tw-w-full tw-h-full tw-object-cover group-hover:tw-scale-110 tw-transition-transform tw-duration-700" />
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/80 tw-via-black/20 tw-to-transparent"></div>
        <div className="tw-absolute tw-top-4 tw-left-4 tw-z-20 tw-bg-black/60 tw-backdrop-blur-md tw-px-3 tw-py-1 tw-rounded-full tw-border-b-2 tw-border-amber-500">
          <span className="tw-text-[10px] tw-font-bold tw-tracking-widest tw-text-amber-500 tw-uppercase">
            {pkg.type === 'Trip' ? (lang === 'AR' ? 'تاريخ عريق' : 'ANCIENT HISTORY') : (lang === 'AR' ? 'ملاذ استثنائي' : 'EXCLUSIVE RETREAT')}
          </span>
        </div>
      </div>
      <div className="tw-p-6 tw-flex tw-flex-col tw-flex-grow">
        <h3 className="tw-text-xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2 group-hover:tw-text-amber-500 tw-transition-colors">
          {pkg.name}
        </h3>
        
        <div className="tw-flex tw-items-center tw-gap-2 tw-text-slate-500 dark:tw-text-slate-400 tw-text-sm tw-mb-4">
          <i className="fa-regular fa-calendar-days"></i>
          <span>{pkg.duration ? (lang === 'AR' ? `${pkg.duration} أيام` : `${pkg.duration} Days`) : '7 Days, 6 Nights'}</span>
        </div>
        
        <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-text-sm tw-line-clamp-2 tw-mb-4 tw-flex-grow">
          {pkg.description || "A unique experience combining the majesty of the pyramids with the serene flow of the Nile..."}
        </p>

        <div className="tw-flex tw-items-center tw-justify-between tw-text-xs tw-text-slate-500 dark:tw-text-slate-400 tw-mb-4">
          <div className="tw-flex tw-items-center tw-gap-1">
            <i className="fa-solid fa-location-dot tw-text-amber-500"></i>
            <span className="tw-truncate tw-max-w-[100px]">{pkg.destination?.name || (lang === 'AR' ? 'مصر' : 'Egypt')}</span>
          </div>
          {pkg.supervisor && (
            <div className="tw-flex tw-items-center tw-gap-1">
              <i className="fa-solid fa-user-tie tw-text-amber-500"></i>
              <span className="tw-truncate tw-max-w-[100px]">{pkg.supervisor.firstName} {pkg.supervisor.lastName}</span>
            </div>
          )}
          <div className="tw-flex tw-items-center tw-gap-1">
            <i className="fa-solid fa-star tw-text-amber-500"></i>
            <span className="tw-font-bold tw-text-slate-700 dark:tw-text-slate-300">{pkg.rating || '5.0'}</span>
          </div>
        </div>

        <div className="tw-flex tw-items-end tw-justify-between tw-mt-auto tw-pt-4 tw-border-t tw-border-slate-100 dark:tw-border-slate-800">
          <div>
            <p className="tw-text-[10px] tw-font-bold tw-text-slate-500 dark:tw-text-slate-500 tw-tracking-widest tw-mb-1 uppercase">
              {lang === 'AR' ? 'يبدأ من' : 'STARTING FROM'}
            </p>
            <p className="tw-text-2xl tw-font-bold tw-text-amber-500">
              {currency === 'USD' ? `$${displayedPrice}` : `${displayedPrice} `}
              {currency === 'EGP' && <span className="tw-text-sm">{lang === 'AR' ? 'ج.م' : 'EGP'}</span>}
            </p>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/package-details/${pkg._id}`);
            }}
            className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#2a2d35] hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-text-amber-600 dark:tw-text-amber-500 tw-font-bold tw-text-xs tw-px-6 tw-py-3 tw-rounded-sm tw-transition-colors tw-tracking-wide"
          >
            {lang === 'AR' ? 'عرض التفاصيل' : 'VIEW DETAILS'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  
  const [options, setOptions] = useState({ destinations: [], capacities: [] });
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const isRtl = lang === 'AR';
      let scrollAmount = 374; // card width + gap
      
      if (direction === 'left') {
        scrollAmount = isRtl ? scrollAmount : -scrollAmount;
      } else {
        scrollAmount = isRtl ? -scrollAmount : scrollAmount;
      }
      
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const { lang, setLang } = useContext(LanguageContext);
  const navigate = useNavigate();
  const isFirstRender = useRef(true);

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    const fetchInitialData = async () => {
      try {
        const [tripsRes, filtersRes] = await Promise.all([
          getTrips({ limit: 10 }).catch(e => ({ data: [] })),
          getFilterOptions().catch(e => ({ success: false }))
        ]);
        const tripsList = Array.isArray(tripsRes) ? tripsRes : (tripsRes.data?.data || tripsRes.data || tripsRes.experiences || []);
        setFeaturedPackages(tripsList);
        
        if (filtersRes.success) {
          setOptions({
            destinations: filtersRes.data.destinations || [],
            capacities: filtersRes.data.capacities || []
          });
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-filtering on dependency change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const fetchFilteredTrips = async () => {
      setLoading(true);
      try {
        const params = {};
        if (location) params.destination = location;
        if (guests) params.people = guests;
        if (date) params.date = date;
        
        const res = await getTrips(params);
        const tripsList = Array.isArray(res) ? res : (res.data?.data || res.data || res.experiences || []);
        setFeaturedPackages(tripsList);
      } catch (err) {
        console.error('Failed to filter experiences:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Run it every time location, date, or guests change (after initial render).
    fetchFilteredTrips();
  }, [location, guests, date]);

  return (
    <div className={`tw-bg-white dark:tw-bg-[#0a0b0d] tw-min-h-screen tw-font-sans ${lang === 'AR' ? 'tw-dir-rtl' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />

      <header className="tw-relative tw-h-[85vh] tw-w-full">
        <div className="tw-absolute tw-inset-0 tw-z-0 tw-bg-slate-100 dark:tw-bg-black">
          <img 
            src="/hero-abu-simbel.jpg" 
            alt="Hero Background" 
            className="tw-w-full tw-h-full tw-object-cover tw-opacity-70 dark:tw-opacity-50 tw-transition-opacity tw-duration-300"
          />
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-white/60 tw-via-white/20 tw-to-slate-50 dark:tw-from-black/60 dark:tw-via-black/20 dark:tw-to-[#0a0b0d]"></div>
        </div>

        <div className="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-items-center tw-justify-center tw-z-10 tw-text-center tw-px-4 tw-pt-36">
          <h1 className="tw-text-3xl md:tw-text-4xl lg:tw-text-5xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2 tw-tracking-tight drop-shadow-sm dark:drop-shadow-lg">
            {lang === 'AR' ? 'العالم بانتظارك.' : 'The world is waiting.'}
          </h1>
          <h1 className="tw-text-3xl md:tw-text-4xl lg:tw-text-5xl tw-font-serif tw-font-bold tw-text-amber-600 dark:tw-text-[#facc15] tw-italic tw-mb-5 tw-tracking-tight drop-shadow-sm dark:drop-shadow-lg">
            {lang === 'AR' ? 'نحن نمهد لك الطريق.' : 'We make the path clear.'}
          </h1>
          <p className="tw-text-slate-700 dark:tw-text-slate-200 tw-text-xs md:tw-text-sm lg:tw-text-base tw-max-w-2xl tw-leading-relaxed tw-font-medium dark:tw-font-light drop-shadow-sm dark:drop-shadow-md">
            {lang === 'AR' ? 'اختبر الإرث الخالد، والجمال الذي لا يُمحى، ورحلات لا تُنسى مع بروتوكولاتنا الحصرية المصممة خصيصاً لراحتك وخصوصيتك المطلقة.' : 'Experience the enduring legacy, timeless beauty, and unforgettable journeys with our exclusive protocols, tailored to your absolute comfort and privacy.'}
          </p>
        </div>

        <div className="tw-absolute tw-top-32 tw-left-0 tw-w-full tw-z-20 tw-px-4">
          <div className="tw-bg-white/90 dark:tw-bg-black/40 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-white/5 tw-py-4 tw-px-8 tw-mx-auto tw-max-w-4xl tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-gap-6 tw-rounded-xl">
            
            <div className="tw-flex-1 tw-w-full tw-flex tw-items-center tw-gap-4 tw-px-4 tw-py-2">
              <i className="fa-solid fa-location-dot tw-text-amber-500 tw-text-xl"></i>
              <div className="tw-flex tw-flex-col tw-w-full">
                <span className="tw-text-[10px] tw-tracking-widest tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-uppercase">{lang === 'AR' ? 'الوجهة' : 'DESTINATION'}</span>
                <div className="tw-relative tw-w-full tw-mt-1.5">
                  <select 
                    className={`tw-bg-white dark:tw-bg-black/50 tw-text-slate-900 dark:tw-text-white tw-w-full tw-outline-none tw-appearance-none tw-cursor-pointer tw-font-medium tw-px-4 tw-py-2.5 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl hover:tw-border-amber-500/50 dark:hover:tw-border-amber-500/50 focus:tw-border-amber-500 dark:focus:tw-border-amber-500 tw-transition-all ${lang === 'AR' ? 'tw-pl-10' : 'tw-pr-10'}`}
                    style={{ outline: 'none' }}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    <option value="" className="dark:tw-bg-slate-900">{lang === 'AR' ? 'اختر الوجهة' : 'Select Destination'}</option>
                    {options.destinations.map(dest => (
                      <option key={dest._id} value={dest._id} className="dark:tw-bg-slate-900">{dest.name}</option>
                    ))}
                  </select>
                  <i className={`fa-solid fa-chevron-down tw-text-slate-400 dark:tw-text-slate-500 tw-absolute tw-pointer-events-none tw-text-xs tw-top-1/2 -tw-translate-y-1/2 ${lang === 'AR' ? 'tw-left-4' : 'tw-right-4'}`}></i>
                </div>
              </div>
            </div>

            <div className="tw-hidden md:tw-block tw-w-px tw-h-12 tw-bg-slate-300 dark:tw-bg-slate-700/50"></div>

            <div className="tw-flex-1 tw-w-full tw-flex tw-items-center tw-gap-4 tw-px-4 tw-py-2">
              <i className="fa-solid fa-user-group tw-text-amber-500 tw-text-xl"></i>
              <div className="tw-flex tw-flex-col tw-w-full">
                <span className="tw-text-[10px] tw-tracking-widest tw-font-bold tw-text-slate-500 dark:tw-text-slate-400 tw-uppercase">{lang === 'AR' ? 'الضيوف' : 'GUESTS'}</span>
                <div className="tw-relative tw-w-full tw-mt-1.5">
                  <select 
                    className={`tw-bg-white dark:tw-bg-black/50 tw-text-slate-900 dark:tw-text-white tw-w-full tw-outline-none tw-appearance-none tw-cursor-pointer tw-font-medium tw-px-4 tw-py-2.5 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl hover:tw-border-amber-500/50 dark:hover:tw-border-amber-500/50 focus:tw-border-amber-500 dark:focus:tw-border-amber-500 tw-transition-all ${lang === 'AR' ? 'tw-pl-10' : 'tw-pr-10'}`}
                    style={{ outline: 'none' }}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    <option value="" className="dark:tw-bg-slate-900">{lang === 'AR' ? 'أي عدد' : '2 Guests'}</option>
                    {options.capacities.map(cap => (
                      <option key={cap} value={cap} className="dark:tw-bg-slate-900">{lang === 'AR' ? `حتى ${cap} ضيوف` : `Up to ${cap} Guests`}</option>
                    ))}
                  </select>
                  <i className={`fa-solid fa-chevron-down tw-text-slate-400 dark:tw-text-slate-500 tw-absolute tw-pointer-events-none tw-text-xs tw-top-1/2 -tw-translate-y-1/2 ${lang === 'AR' ? 'tw-left-4' : 'tw-right-4'}`}></i>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      <section id="experiences-section" className="tw-py-24 tw-bg-slate-50 dark:tw-bg-[#0a0b0d]">
        <div className="tw-container tw-mx-auto tw-px-4">
          <div className="tw-flex tw-justify-between tw-items-end tw-mb-12">
            <div>
              <h4 className="tw-text-amber-500 tw-text-xs tw-font-bold tw-tracking-widest tw-uppercase tw-mb-3">
                {lang === 'AR' ? 'رحلات مختارة بعناية' : 'SELECTED CURATED JOURNEYS'}
              </h4>
              <h2 className="tw-text-4xl md:tw-text-5xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white">
                {lang === 'AR' ? 'تجارب مميزة' : 'Featured Experiences'}
              </h2>
            </div>
            
            {/* Carousel Controls */}
            {featuredPackages.length > 0 && !loading && (
              <div className="tw-hidden md:tw-flex tw-gap-2">
                <button 
                  onClick={() => scroll('left')}
                  className="tw-w-12 tw-h-12 tw-rounded-full tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-white dark:hover:tw-text-white hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-all"
                >
                  <i className={`fa-solid ${lang === 'AR' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="tw-w-12 tw-h-12 tw-rounded-full tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-white dark:hover:tw-text-white hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-all"
                >
                  <i className={`fa-solid ${lang === 'AR' ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="tw-flex tw-justify-center tw-py-20">
              <i className="fa-solid fa-circle-notch fa-spin tw-text-4xl tw-text-amber-500"></i>
            </div>
          ) : (
            <div className="tw-relative tw-w-full">
              <div 
                ref={carouselRef}
                className="tw-flex tw-overflow-x-auto tw-snap-x tw-snap-mandatory tw-scroll-smooth tw-gap-6 tw-pb-8 tw-hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredPackages.length > 0 ? (
                  featuredPackages.map((pkg) => (
                    <ExperienceCard key={pkg._id} pkg={pkg} lang={lang} navigate={navigate} />
                  ))
                ) : (
                  <div className="tw-w-full tw-text-center tw-py-16 tw-text-slate-500">
                    <i className="fa-solid fa-earth-americas tw-text-5xl tw-mb-4 tw-text-slate-300 dark:tw-text-slate-700"></i>
                    <h3 className="tw-text-xl tw-font-bold tw-text-slate-700 dark:tw-text-slate-300 tw-mb-2">
                      {lang === 'AR' ? 'لم نجد أي رحلات مطابقة' : 'No exact matches found'}
                    </h3>
                    <p>{lang === 'AR' ? 'جرب تغيير فلاتر البحث لاكتشاف المزيد من المغامرات الرائعة.' : 'Try adjusting your search filters to discover more amazing adventures.'}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* GPS Location Based Seamless Trip Continuation Section */}
      <LocationBasedAdventures />

      <section className="tw-relative tw-py-32 tw-overflow-hidden">
        <div className="tw-absolute tw-inset-0">
          <img src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=2000&auto=format&fit=crop" alt="CTA Background" className="tw-w-full tw-h-full tw-object-cover tw-opacity-20 dark:tw-opacity-40" />
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-slate-50 dark:tw-from-[#0a0b0d] tw-via-slate-50/80 dark:tw-via-[#0a0b0d]/80 tw-to-slate-50 dark:tw-to-[#0a0b0d]"></div>
        </div>
        
        <div className="tw-container tw-mx-auto tw-px-4 tw-relative tw-z-10 tw-text-center">
          <h4 className="tw-text-amber-500 tw-text-xs tw-font-bold tw-tracking-widest tw-uppercase tw-mb-4">
            {lang === 'AR' ? 'مغامرتك القادمة بانتظارك' : 'YOUR NEXT ADVENTURE AWAITS'}
          </h4>
          <h2 className="tw-text-4xl md:tw-text-5xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-8 tw-max-w-3xl tw-mx-auto">
            {lang === 'AR' ? 'هل أنت مستعد لاستكشاف عجائب مصر مع ClearPath؟' : 'Ready to explore the wonders of Egypt with ClearPath?'}
          </h2>
          <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4 tw-justify-center">
            <button 
              onClick={() => navigate('/experiences')}
              className="tw-w-full sm:tw-w-auto tw-bg-gradient-to-r tw-from-amber-400 tw-to-yellow-500 hover:tw-from-amber-300 hover:tw-to-yellow-400 tw-text-slate-900 tw-font-bold tw-py-4 tw-px-8 tw-rounded-sm tw-shadow-lg hover:tw-shadow-amber-500/25 tw-transition-all tw-tracking-wide"
            >
              {lang === 'AR' ? 'تصفح الباقات' : 'EXPLORE PACKAGES'}
            </button>
          </div>
        </div>
      </section>

      {/* Protocol Modal */}
      {isProtocolModalOpen && (
        <div className="tw-fixed tw-inset-0 tw-z-[9999] tw-flex tw-items-center tw-justify-center tw-bg-black/60 dark:tw-bg-black/80 tw-backdrop-blur-sm tw-p-4">
          <div className="tw-bg-white dark:tw-bg-[#16171a] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-w-full tw-max-w-3xl tw-max-h-[85vh] tw-flex tw-flex-col tw-shadow-2xl tw-animate-in tw-fade-in tw-zoom-in-95 tw-duration-300">
            {/* Modal Header */}
            <div className="tw-flex tw-justify-between tw-items-center tw-p-6 tw-border-b tw-border-slate-100 dark:tw-border-slate-800">
              <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-amber-600 dark:tw-text-amber-500">
                {lang === 'AR' ? 'بروتوكولنا' : 'Our Protocol'}
              </h2>
              <button 
                onClick={() => setIsProtocolModalOpen(false)}
                className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-slate-100 dark:tw-bg-slate-800 hover:tw-bg-slate-200 dark:hover:tw-bg-slate-700 tw-text-slate-600 dark:tw-text-slate-300 tw-flex tw-items-center tw-justify-center tw-transition-colors"
              >
                <i className="fa-solid fa-xmark tw-text-xl"></i>
              </button>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="tw-p-6 tw-overflow-y-auto tw-flex-1 tw-scrollbar-thin tw-scrollbar-thumb-amber-500/50 tw-scrollbar-track-slate-100 dark:tw-scrollbar-track-slate-900/50">
              <div className="tw-space-y-8 tw-text-slate-600 dark:tw-text-slate-300">
                <div>
                  <h3 className="tw-text-lg tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                    <i className="fa-solid fa-car tw-text-amber-500"></i>
                    {lang === 'AR' ? 'النقل' : 'Transportation'}
                  </h3>
                  <p className="tw-text-sm tw-leading-relaxed">
                    {lang === 'AR' ? 'من لحظة وصولك وحتى مغادرتك، نضمن لك تجربة سلسة. نقدم وسائل نقل مخصصة من المطار إلى وجهتك المستهدفة، والعودة عند الانتهاء من برنامجك.' : 'From the moment you arrive until your departure, we ensure a seamless experience. We provide dedicated transportation from the airport to your target destination, and back upon the completion of your program.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="tw-text-lg tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                    <i className="fa-solid fa-hotel tw-text-amber-500"></i>
                    {lang === 'AR' ? 'الإقامة والتغذية' : 'Accommodation & Dining'}
                  </h3>
                  <p className="tw-text-sm tw-leading-relaxed">
                    {lang === 'AR' ? 'أثناء البرنامج، نوفر أماكن إقامة ممتازة لضمان راحتك. كما نغطي تكاليف الإفطار والغداء كجزء من مسار الرحلة لتوفير تجربة خالية من المتاعب.' : 'During the program, we provide premium accommodations to guarantee your comfort. We also cover breakfast and lunch as part of your itinerary to provide a hassle-free experience.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="tw-text-lg tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                    <i className="fa-solid fa-ticket tw-text-amber-500"></i>
                    {lang === 'AR' ? 'تذاكر الدخول للأنشطة' : 'Activity Entry Tickets'}
                  </h3>
                  <p className="tw-text-sm tw-leading-relaxed">
                    {lang === 'AR' ? 'استمتع بالوصول الكامل إلى جميع المعالم والأنشطة المخطط لها. جميع تذاكر الدخول للفعاليات والبرامج مشمولة ضمن الترتيبات.' : 'Enjoy full access to all planned attractions and activities. All entry tickets for events and programs are included in the arrangements.'}
                  </p>
                </div>

                <div>
                  <h3 className="tw-text-lg tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2 tw-flex tw-items-center tw-gap-2">
                    <i className="fa-solid fa-credit-card tw-text-amber-500"></i>
                    {lang === 'AR' ? 'المصروفات الشخصية والإضافات' : 'Personal Expenses & Extras'}
                  </h3>
                  <p className="tw-text-sm tw-leading-relaxed">
                    {lang === 'AR' ? 'يرجى ملاحظة أن النفقات الشخصية وتكاليف العشاء والأنشطة الإضافية غير المشمولة صراحةً في البرنامج تعتبر مسؤولية المشاركين.' : 'Please note that personal expenses, dinner costs, and extra activities not explicitly included in the program are the responsibility of the participants.'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="tw-p-6 tw-border-t tw-border-slate-100 dark:tw-border-slate-800 tw-flex tw-justify-end">
              <button 
                onClick={() => setIsProtocolModalOpen(false)}
                className="tw-bg-amber-500 hover:tw-bg-amber-400 tw-text-slate-900 tw-font-bold tw-py-2 tw-px-6 tw-rounded-sm tw-transition-colors"
              >
                {lang === 'AR' ? 'فهمت' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer isHome={true} />
    </div>
  );
};

export default Home;
