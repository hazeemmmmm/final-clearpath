import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { addToWishlist, removeFromWishlist, getTrips, getDestinations, trackInteraction } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import { CurrencyContext } from '../../context/CurrencyContext';

const ExperienceCard = ({ exp, destinations, wishlistIds, handleCardClick, handleWishlistToggle, lang }) => {
  const { formatPrice } = useContext(CurrencyContext);
  const images = Array.isArray(exp.images) && exp.images.length > 0 ? exp.images : [exp.image || "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=800"];
  const destName = exp.destination?.name || destinations.find(d => d._id === (exp.destination?._id || exp.destination))?.name || (lang === 'AR' ? 'مصر' : 'Egypt');
  const price = exp.calculatedPrice || exp.base_price || 0;
  const isDayuse = exp.duration_days === 1;
  const tagText = isDayuse 
    ? (lang === 'AR' ? 'داي يوز - دخول حصري' : 'DAYUSE - EXCLUSIVE ACCESS')
    : (lang === 'AR' ? `${exp.duration_days} أيام - جولة خاصة` : `${exp.duration_days} DAYS - PRIVATE CHARTER`);

  return (
    <div 
      className="tw-bg-white dark:tw-bg-[#111111] tw-rounded-xl tw-overflow-hidden tw-border tw-border-slate-200 dark:tw-border-white/5 hover:tw-border-slate-300 dark:hover:tw-border-white/20 hover:tw-shadow-xl dark:hover:tw-shadow-2xl hover:tw-shadow-slate-200 dark:hover:tw-shadow-[#ffd700]/5 hover:-tw-translate-y-1 tw-transition-all tw-duration-300 tw-cursor-pointer tw-flex tw-flex-col tw-h-[500px] tw-w-[340px] tw-flex-shrink-0 tw-group tw-snap-start"
      onClick={() => handleCardClick(exp._id)}
    >
      {/* Image Section */}
      <div className="tw-relative tw-h-64 tw-w-full tw-overflow-hidden tw-flex-shrink-0">
        <img src={images[0]} alt={exp.name} className="tw-w-full tw-h-full tw-object-cover group-hover:tw-scale-105 tw-transition-transform tw-duration-700" />
        {/* Wishlist Button Overlay */}
        <button 
          className={`tw-absolute tw-top-4 tw-right-4 tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-bg-black/30 tw-backdrop-blur-sm tw-transition-colors hover:tw-bg-black/60 ${wishlistIds.has(exp._id) ? 'tw-text-red-500' : 'tw-text-white'}`}
          onClick={(e) => handleWishlistToggle(e, exp._id)}
        >
          <i className={`${wishlistIds.has(exp._id) ? 'fa-solid' : 'fa-regular'} fa-heart tw-text-lg`}></i>
        </button>
        {/* Bottom fade gradient */}
        <div className="tw-absolute tw-inset-x-0 tw-bottom-0 tw-h-1/2 tw-bg-gradient-to-t tw-from-white dark:tw-from-[#111111] tw-to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="tw-p-6 tw-flex tw-flex-col tw-flex-grow">
        <div className="tw-text-amber-600 dark:tw-text-[#ffd700] tw-text-[10px] tw-font-bold tw-tracking-widest tw-uppercase tw-mb-2">
          {tagText}
        </div>
        <h3 className="tw-text-xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-2 tw-leading-tight group-hover:tw-text-amber-600 dark:group-hover:tw-text-[#ffd700] tw-transition-colors tw-line-clamp-2">
          {exp.name}
        </h3>
        <p className="tw-text-xs tw-text-slate-600 dark:tw-text-slate-400 tw-mb-4 tw-line-clamp-2 tw-leading-relaxed">
          {exp.description || `${lang === 'AR' ? 'اكتشف سحر' : 'Discover the magic of'} ${destName}`}
        </p>
        
        {/* Card Footer */}
        <div className="tw-mt-auto tw-flex tw-justify-between tw-items-center tw-pt-4 tw-border-t tw-border-slate-100 dark:tw-border-white/5">
          <div className="tw-flex tw-flex-col">
            <span className="tw-text-amber-600 dark:tw-text-[#ffd700] tw-font-serif tw-font-bold tw-text-lg">
              From {formatPrice(price)}
            </span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2 tw-text-amber-600 dark:tw-text-[#ffd700] tw-text-[10px] tw-font-bold tw-tracking-widest tw-uppercase">
            {lang === 'AR' ? 'التفاصيل' : 'VIEW DETAIL'}
            <i className="fa-solid fa-arrow-right tw-text-[10px]"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

const Experiences = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [isScrolled, setIsScrolled] = useState(false);

  const dahabRef = useRef(null);
  const cairoRef = useRef(null);
  const otherRef = useRef(null);

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const isRtl = lang === 'AR';
      let scrollAmount = 364; // card width (340px) + gap (24px)
      if (direction === 'left') {
        scrollAmount = isRtl ? scrollAmount : -scrollAmount;
      } else {
        scrollAmount = isRtl ? -scrollAmount : scrollAmount;
      }
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  // Search States
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedDestName, setSelectedDestName] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { lang, setLang } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'auto';

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-item')) {
        setShowDestDropdown(false);
        setShowPriceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchExperiences();
    fetchDestinationsData();
  }, []);

  const fetchDestinationsData = async () => {
    try {
      const res = await getDestinations();
      const list = res.destinations || res.data?.destinations || res.data || res || [];
      setDestinations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load destinations in Experiences page', err);
    }
  };

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const data = await getTrips({ limit: 100 });
      if (data && data.data) {
        setExperiences(data.data);
      } else {
        setExperiences([]);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error.message);
      setExperiences([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/package-details/${id}`);
  };

  const handleWishlistToggle = async (e, experienceId) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;

    const inWishlist = wishlistIds.has(experienceId);
    
    // Optimistic update
    setWishlistIds(prev => {
      const newSet = new Set(prev);
      if (inWishlist) newSet.delete(experienceId);
      else newSet.add(experienceId);
      return newSet;
    });

    try {
      const action = inWishlist ? removeFromWishlist : addToWishlist;
      const res = await action(experienceId);
      
      if (res && res.success && !inWishlist) {
         trackInteraction({
            experienceId,
            actionType: 'WISHLIST_ADD',
            metadata: { source: 'ExperiencesPage' }
         }).catch(err => console.log('Tracking error', err));
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      // Revert optimistic update
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        if (inWishlist) newSet.add(experienceId);
        else newSet.delete(experienceId);
        return newSet;
      });
    }
  };

  const displayedExperiences = experiences.filter((exp) => {
    if (activeTab === 'dayuse' && exp.duration_days !== 1) return false;
    if (activeTab === 'trip' && exp.duration_days <= 1) return false;
    if (selectedDestination) {
      const expDestId = exp.destination?._id || exp.destination?.id || exp.destination;
      if (expDestId !== selectedDestination) return false;
    }
    const price = exp.calculatedPrice || exp.base_price || 0;
    if (price < minPrice || price > maxPrice) return false;

    // Filter by chainStartDate from URL parameter for Modular Trip Chaining
    const urlParams = new URLSearchParams(window.location.search);
    const chainStartDateStr = urlParams.get('chainStartDate');
    if (chainStartDateStr) {
      const targetDate = new Date(chainStartDateStr);
      if (!isNaN(targetDate.getTime())) {
        if (exp.availableDates && exp.availableDates.length > 0) {
          const hasValidDate = exp.availableDates.some(d => {
            const ad = new Date(d.date || d);
            return !isNaN(ad.getTime()) && ad >= targetDate;
          });
          if (!hasValidDate) return false;
        }
      }
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(displayedExperiences.length / itemsPerPage));
  const currentExperiences = displayedExperiences.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      document.getElementById('recommended-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      document.getElementById('recommended-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`tw-min-h-screen tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-font-sans tw-flex tw-flex-col ${lang === 'AR' ? 'tw-dir-rtl' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />

      {/* Hero Section with Pyramids Background */}
      <header className="tw-relative tw-w-full tw-min-h-[80vh] tw-flex tw-flex-col tw-items-center tw-justify-center tw-pt-32 tw-pb-16">
        <div className="tw-absolute tw-inset-0 tw-z-0 tw-bg-slate-900 dark:tw-bg-black">
          <img 
            src="https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Pyramids" 
            className="tw-w-full tw-h-full tw-object-cover tw-opacity-60 dark:tw-opacity-60"
            style={{ objectPosition: 'center' }}
          />
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-slate-900/40 dark:tw-from-black/40 tw-via-slate-900/20 dark:tw-via-black/20 tw-to-slate-50 dark:tw-to-[#0a0b0d]"></div>
        </div>

        <div className="tw-relative tw-z-10 tw-text-center tw-px-4 tw-mb-12">
          <h1 className="tw-text-4xl md:tw-text-6xl tw-font-serif tw-font-bold tw-text-white tw-mb-4 tw-tracking-tight drop-shadow-lg">
            {lang === 'AR' ? 'اكتشف مصر' : 'Discover Egypt'} <span className="tw-text-amber-400 dark:tw-text-[#ffd700] tw-italic tw-font-light">{lang === 'AR' ? 'وتجاربها' : 'Experience'}</span>
          </h1>
          <p className="tw-text-white/90 dark:tw-text-slate-200 tw-text-sm md:tw-text-base tw-max-w-2xl tw-mx-auto tw-leading-relaxed tw-font-medium dark:tw-font-light drop-shadow-md">
            {lang === 'AR' 
              ? 'من عجائب الفراعنة القديمة إلى أيام الاسترخاء والراحة على ساحل البحر الأحمر، اعثر على تجربتك المصرية المثالية معنا.' 
              : 'From the ancient wonders of the pharaohs to relaxing days on the Red Sea coast, find your perfect Egyptian experience.'}
          </p>
        </div>

        {/* Floating Search Bar */}
        <div className="tw-relative tw-z-20 tw-w-full tw-max-w-4xl tw-px-4">
          <div className="tw-bg-white/95 dark:tw-bg-[#1a1a1a]/80 tw-backdrop-blur-xl tw-border tw-border-slate-200 dark:tw-border-white/10 tw-rounded-xl tw-p-2 tw-flex tw-flex-col md:tw-flex-row tw-items-center tw-justify-between tw-shadow-2xl tw-relative tw-z-50">
            
            {/* Where Input */}
            <div className="search-item tw-flex-1 tw-w-full tw-relative tw-cursor-pointer hover:tw-bg-slate-100 dark:hover:tw-bg-white/5 tw-rounded-lg tw-transition-colors tw-px-5 tw-py-4" onClick={() => { setShowDestDropdown(!showDestDropdown); setShowPriceDropdown(false); }}>
              <div className="tw-flex tw-items-center tw-gap-3">
                <i className="fa-solid fa-location-dot tw-text-amber-500 dark:tw-text-[#ffd700] tw-text-lg"></i>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-[10px] tw-font-bold tw-text-amber-600 dark:tw-text-[#ffd700] tw-uppercase tw-tracking-widest">{lang === 'AR' ? 'الوجهة' : 'WHERE'}</span>
                  <span className="tw-text-slate-900 dark:tw-text-white tw-font-medium tw-text-sm">{selectedDestName || (lang === 'AR' ? 'ابحث عن وجهة' : 'Search destinations')}</span>
                </div>
              </div>
              
              {showDestDropdown && (
                <div className="tw-absolute tw-top-full tw-left-0 tw-mt-2 tw-w-full md:tw-w-64 tw-bg-white dark:tw-bg-[#1f1f1f] tw-border tw-border-slate-200 dark:tw-border-white/10 tw-rounded-xl tw-shadow-2xl tw-overflow-hidden tw-z-50" onClick={(e) => e.stopPropagation()}>
                  <div className="tw-px-4 tw-py-3 tw-bg-slate-50 dark:tw-bg-white/5 tw-text-xs tw-font-bold tw-text-amber-600 dark:tw-text-[#ffd700] tw-uppercase tw-tracking-wider tw-border-b tw-border-slate-200 dark:tw-border-white/10">
                    {lang === 'AR' ? 'الوجهات المتاحة لدينا' : 'Our Available Destinations'}
                  </div>
                  <div className="tw-px-4 tw-py-3 tw-text-slate-700 dark:tw-text-white hover:tw-bg-amber-50 dark:hover:tw-bg-[#ffd700]/10 hover:tw-text-amber-600 dark:hover:tw-text-[#ffd700] tw-cursor-pointer tw-transition-colors tw-flex tw-items-center tw-gap-2" onClick={() => { setSelectedDestination(''); setSelectedDestName(''); setShowDestDropdown(false); }}>
                    <i className="fa-solid fa-globe"></i> {lang === 'AR' ? 'كل الوجهات في مصر' : 'All Destinations in Egypt'}
                  </div>
                  {destinations.map(d => (
                    <div key={d._id || d.id} className="tw-px-4 tw-py-3 tw-text-slate-700 dark:tw-text-white hover:tw-bg-amber-50 dark:hover:tw-bg-[#ffd700]/10 hover:tw-text-amber-600 dark:hover:tw-text-[#ffd700] tw-cursor-pointer tw-transition-colors tw-flex tw-items-center tw-gap-2" onClick={() => { setSelectedDestination(d._id || d.id); setSelectedDestName(d.name); setShowDestDropdown(false); }}>
                      <i className="fa-solid fa-map-pin"></i> {d.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="tw-hidden md:tw-block tw-w-[1px] tw-h-10 tw-bg-slate-200 dark:tw-bg-white/10"></div>

            {/* Price Input */}
            <div className="search-item tw-flex-1 tw-w-full tw-relative tw-cursor-pointer hover:tw-bg-slate-100 dark:hover:tw-bg-white/5 tw-rounded-lg tw-transition-colors tw-px-5 tw-py-4" onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowDestDropdown(false); }}>
              <div className="tw-flex tw-items-center tw-gap-3">
                <i className="fa-regular fa-money-bill-1 tw-text-amber-500 dark:tw-text-[#ffd700] tw-text-lg"></i>
                <div className="tw-flex tw-flex-col">
                  <span className="tw-text-[10px] tw-font-bold tw-text-amber-600 dark:tw-text-[#ffd700] tw-uppercase tw-tracking-widest">{lang === 'AR' ? 'الميزانية' : 'PRICE'}</span>
                  <span className="tw-text-slate-900 dark:tw-text-white tw-font-medium tw-text-sm">
                    {maxPrice === 25000 && minPrice === 0 
                      ? (lang === 'AR' ? 'أي سعر متاح' : 'Any price range') 
                      : `${minPrice} - ${maxPrice} EGP`}
                  </span>
                </div>
              </div>

              {showPriceDropdown && (
                <div className="tw-absolute tw-top-full tw-left-0 tw-mt-2 tw-w-full md:tw-w-72 tw-bg-white dark:tw-bg-[#1f1f1f] tw-border tw-border-slate-200 dark:tw-border-white/10 tw-rounded-xl tw-shadow-2xl tw-p-5 tw-z-50" onClick={(e) => e.stopPropagation()}>
                  <h4 className="tw-text-sm tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">{lang === 'AR' ? 'نطاق السعر المقدر' : 'Estimated Price Range'}</h4>
                  
                  <div className="tw-flex tw-items-center tw-gap-3 tw-mb-6">
                    <div className="tw-flex-1 tw-bg-slate-50 dark:tw-bg-black/50 tw-border tw-border-slate-200 dark:tw-border-white/10 tw-rounded-lg tw-p-2 tw-flex tw-flex-col">
                      <span className="tw-text-[10px] tw-text-slate-500 dark:tw-text-slate-400 tw-uppercase">{lang === 'AR' ? 'الحد الأدنى' : 'Min'}</span>
                      <div className="tw-flex tw-items-center">
                        <input type="number" className="tw-bg-transparent tw-text-slate-900 dark:tw-text-white tw-w-full tw-outline-none tw-text-sm" value={minPrice} onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))} />
                        <span className="tw-text-xs tw-text-slate-500">EGP</span>
                      </div>
                    </div>
                    <span className="tw-text-slate-400 dark:tw-text-slate-500">-</span>
                    <div className="tw-flex-1 tw-bg-slate-50 dark:tw-bg-black/50 tw-border tw-border-slate-200 dark:tw-border-white/10 tw-rounded-lg tw-p-2 tw-flex tw-flex-col">
                      <span className="tw-text-[10px] tw-text-slate-500 dark:tw-text-slate-400 tw-uppercase">{lang === 'AR' ? 'الحد الأقصى' : 'Max'}</span>
                      <div className="tw-flex tw-items-center">
                        <input type="number" className="tw-bg-transparent tw-text-slate-900 dark:tw-text-white tw-w-full tw-outline-none tw-text-sm" value={maxPrice} onChange={(e) => setMaxPrice(Math.max(0, parseInt(e.target.value) || 25000))} />
                        <span className="tw-text-xs tw-text-slate-500">EGP</span>
                      </div>
                    </div>
                  </div>

                  <input type="range" min="0" max="25000" step="500" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="tw-w-full tw-accent-amber-500 dark:tw-accent-[#ffd700] tw-mb-2" />
                  <div className="tw-flex tw-justify-between tw-text-xs tw-text-slate-500 tw-mb-6">
                    <span>0 EGP</span>
                    <span>12.5k EGP</span>
                    <span>25k+ EGP</span>
                  </div>

                  <div className="tw-flex tw-gap-2">
                    <button className="tw-flex-1 tw-py-2 tw-rounded-md tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-100 dark:hover:tw-bg-white/10 tw-transition-colors tw-text-sm tw-font-medium" onClick={() => { setMinPrice(0); setMaxPrice(25000); setShowPriceDropdown(false); }}>
                      {lang === 'AR' ? 'إعادة ضبط' : 'Reset'}
                    </button>
                    <button className="tw-flex-1 tw-py-2 tw-rounded-md tw-bg-amber-500 dark:tw-bg-[#ffd700] hover:tw-bg-amber-600 dark:hover:tw-bg-[#e5c100] tw-text-black tw-transition-colors tw-text-sm tw-font-bold" onClick={() => setShowPriceDropdown(false)}>
                      {lang === 'AR' ? 'تطبيق الفلتر' : 'Apply Filter'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Button */}
            <button 
              className="tw-w-full md:tw-w-auto tw-mt-2 md:tw-mt-0 tw-bg-amber-500 dark:tw-bg-[#ffd700] hover:tw-bg-amber-600 dark:hover:tw-bg-[#e5c100] tw-text-black tw-px-10 tw-py-4 tw-rounded-lg tw-font-bold tw-text-sm tw-tracking-wide tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-colors tw-shadow-lg"
              onClick={() => { setShowDestDropdown(false); setShowPriceDropdown(false); document.getElementById('recommended-section')?.scrollIntoView({ behavior: 'smooth' }); }}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
              {lang === 'AR' ? 'بحث' : 'SEARCH'}
            </button>
          </div>

          {/* Category Pills */}
          <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-3 tw-mt-8 tw-relative tw-z-10">
            <button 
              className={`tw-px-6 tw-py-2.5 tw-rounded-full tw-text-sm tw-font-bold tw-transition-colors ${activeTab === 'all' ? 'tw-bg-amber-500 dark:tw-bg-[#ffd700] tw-text-black tw-shadow-md' : 'tw-bg-white/80 dark:tw-bg-[#1a1a1a]/80 tw-backdrop-blur-md tw-text-slate-700 dark:tw-text-slate-300 hover:tw-bg-white dark:hover:tw-bg-white/10 tw-border tw-border-slate-200 dark:tw-border-white/10'}`}
              onClick={() => setActiveTab('all')}
            >
              {lang === 'AR' ? 'كل التجارب' : 'All Experiences'}
            </button>
            <button 
              className={`tw-px-6 tw-py-2.5 tw-rounded-full tw-text-sm tw-font-bold tw-transition-colors ${activeTab === 'trip' ? 'tw-bg-amber-500 dark:tw-bg-[#ffd700] tw-text-black tw-shadow-md' : 'tw-bg-white/80 dark:tw-bg-[#1a1a1a]/80 tw-backdrop-blur-md tw-text-slate-700 dark:tw-text-slate-300 hover:tw-bg-white dark:hover:tw-bg-white/10 tw-border tw-border-slate-200 dark:tw-border-white/10'}`}
              onClick={() => setActiveTab('trip')}
            >
              {lang === 'AR' ? 'الرحلات السياحية' : 'Trips'}
            </button>
            <button 
              className={`tw-px-6 tw-py-2.5 tw-rounded-full tw-text-sm tw-font-bold tw-transition-colors ${activeTab === 'dayuse' ? 'tw-bg-amber-500 dark:tw-bg-[#ffd700] tw-text-black tw-shadow-md' : 'tw-bg-white/80 dark:tw-bg-[#1a1a1a]/80 tw-backdrop-blur-md tw-text-slate-700 dark:tw-text-slate-300 hover:tw-bg-white dark:hover:tw-bg-white/10 tw-border tw-border-slate-200 dark:tw-border-white/10'}`}
              onClick={() => setActiveTab('dayuse')}
            >
              {lang === 'AR' ? 'داي يوز استجمام' : 'Dayuse'}
            </button>
          </div>
        </div>
      </header>

      {(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const chainStartDateStr = urlParams.get('chainStartDate');
        if (!chainStartDateStr) return null;
        
        return (
          <div className="tw-max-w-4xl tw-mx-auto tw-w-full tw-px-4 tw-mt-8">
            <div className="tw-bg-gradient-to-r tw-from-emerald-500/20 tw-to-amber-500/10 tw-backdrop-blur-md tw-border tw-border-emerald-500/30 tw-rounded-xl tw-p-6 tw-flex tw-flex-col sm:tw-flex-row tw-items-center tw-justify-between tw-gap-4 tw-shadow-lg">
              <div className="tw-flex tw-items-center tw-gap-4">
                <div className="tw-w-12 tw-h-12 tw-rounded-full tw-bg-emerald-500/20 tw-flex tw-items-center tw-justify-center tw-text-emerald-500 tw-text-xl tw-shadow-inner">
                  <i className="fa-solid fa-route tw-animate-pulse"></i>
                </div>
                <div className="tw-flex tw-flex-col">
                  <h4 className="tw-text-emerald-400 tw-text-sm tw-font-bold">
                    {lang === 'AR' ? 'وضع سلسلة الرحلات المتصلة نشط 🔗' : 'Trip Chaining Mode Active 🔗'}
                  </h4>
                  <p className="tw-text-slate-300 tw-text-xs tw-mt-1">
                    {lang === 'AR'
                      ? `نعرض فقط الرحلات والـ Dayuses المتاحة للبدء في أو بعد: ${new Date(chainStartDateStr).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', year: 'numeric' })}`
                      : `Showing packages and dayuse tours available to start on or after: ${new Date(chainStartDateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  window.location.href = '/experiences';
                }}
                className="hover:tw-bg-slate-800 tw-text-xs tw-font-bold tw-px-5 tw-py-2.5 tw-rounded-lg tw-transition-all tw-border-none tw-cursor-pointer tw-shadow-md tw-flex tw-items-center tw-gap-2"
                style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
              >
                {lang === 'AR' ? 'إلغاء وضع السلسلة' : 'Exit Chain Mode'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Main Content: City Sections */}
      <main id="recommended-section" className="tw-flex-grow tw-container tw-mx-auto tw-px-4 tw-py-16 tw-max-w-[1400px]">
        {loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-py-32">
            <i className="fa-solid fa-circle-notch fa-spin tw-text-5xl tw-text-[#ffd700]"></i>
          </div>
        ) : displayedExperiences.length === 0 ? (
          <div className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-slate-200 dark:tw-border-white/5 tw-rounded-2xl tw-p-16 tw-text-center">
             <i className="fa-solid fa-plane-slash tw-text-6xl tw-text-slate-400 dark:tw-text-slate-700 tw-mb-6"></i>
             <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">{lang === 'AR' ? 'لا توجد تجارب مطابقة لبحثك' : 'No experiences match your search'}</h3>
             <p className="tw-text-slate-500 dark:tw-text-slate-400">{lang === 'AR' ? 'جرب تغيير الفلاتر أو البحث عن وجهة مختلفة.' : 'Try adjusting your filters or searching for a different destination.'}</p>
          </div>
        ) : (
          !selectedDestination && activeTab === 'all' && minPrice === 0 && maxPrice === 25000 ? (
            <div className="tw-flex tw-flex-col tw-gap-16">
              
              {/* Go to Dahab Section */}
              {(() => {
                const dahabExps = displayedExperiences.filter(exp => {
                  const destName = exp.destination?.name?.toLowerCase() || 
                    destinations.find(d => d._id === (exp.destination?._id || exp.destination))?.name?.toLowerCase() || '';
                  return destName === 'dahab';
                });
                if (dahabExps.length === 0) return null;

                return (
                  <div className="tw-flex tw-flex-col">
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-8">
                      <h2 className="tw-flex tw-items-center tw-gap-3 tw-text-lg md:tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-tracking-widest tw-uppercase">
                        <i className="fa-solid fa-wand-magic-sparkles tw-text-amber-500 dark:tw-text-[#ffd700]"></i>
                        {lang === 'AR' ? 'اذهب إلى دهب' : 'GO TO DAHAB'}
                      </h2>
                      {dahabExps.length > 0 && (
                        <div className="tw-flex tw-gap-2">
                          <button 
                            onClick={() => scrollCarousel(dahabRef, 'left')}
                            className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-white dark:hover:tw-text-white hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-all tw-cursor-pointer tw-shadow-sm"
                          >
                            <i className={`fa-solid ${lang === 'AR' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
                          </button>
                          <button 
                            onClick={() => scrollCarousel(dahabRef, 'right')}
                            className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-white dark:hover:tw-text-white hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-all tw-cursor-pointer tw-shadow-sm"
                          >
                            <i className={`fa-solid ${lang === 'AR' ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
                          </button>
                        </div>
                      )}
                    </div>
                    <div 
                      ref={dahabRef}
                      className="tw-flex tw-overflow-x-auto tw-snap-x tw-snap-mandatory tw-gap-6 tw-pb-8 tw-hide-scrollbar"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {dahabExps.map(exp => <ExperienceCard key={exp._id} exp={exp} destinations={destinations} wishlistIds={wishlistIds} handleCardClick={handleCardClick} handleWishlistToggle={handleWishlistToggle} lang={lang} />)}
                    </div>
                  </div>
                );
              })()}

              {/* Explore Cairo Section */}
              {(() => {
                const cairoExps = displayedExperiences.filter(exp => {
                  const destName = exp.destination?.name?.toLowerCase() || 
                    destinations.find(d => d._id === (exp.destination?._id || exp.destination))?.name?.toLowerCase() || '';
                  return destName === 'cairo';
                });
                if (cairoExps.length === 0) return null;

                return (
                  <div className="tw-flex tw-flex-col">
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-8">
                      <h2 className="tw-flex tw-items-center tw-gap-3 tw-text-lg md:tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-tracking-widest tw-uppercase">
                        <i className="fa-solid fa-wand-magic-sparkles tw-text-amber-500 dark:tw-text-[#ffd700]"></i>
                        {lang === 'AR' ? 'استكشف القاهرة' : 'EXPLORE CAIRO'}
                      </h2>
                      {cairoExps.length > 0 && (
                        <div className="tw-flex tw-gap-2">
                          <button 
                            onClick={() => scrollCarousel(cairoRef, 'left')}
                            className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-white dark:hover:tw-text-white hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-all tw-cursor-pointer tw-shadow-sm"
                          >
                            <i className={`fa-solid ${lang === 'AR' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
                          </button>
                          <button 
                            onClick={() => scrollCarousel(cairoRef, 'right')}
                            className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-white dark:hover:tw-text-white hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-all tw-cursor-pointer tw-shadow-sm"
                          >
                            <i className={`fa-solid ${lang === 'AR' ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
                          </button>
                        </div>
                      )}
                    </div>
                    <div 
                      ref={cairoRef}
                      className="tw-flex tw-overflow-x-auto tw-snap-x tw-snap-mandatory tw-gap-6 tw-pb-8 tw-hide-scrollbar"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {cairoExps.map(exp => <ExperienceCard key={exp._id} exp={exp} destinations={destinations} wishlistIds={wishlistIds} handleCardClick={handleCardClick} handleWishlistToggle={handleWishlistToggle} lang={lang} />)}
                    </div>
                  </div>
                );
              })()}

              {/* Discover More Section */}
              {(() => {
                const otherExps = displayedExperiences.filter(exp => {
                  const destName = exp.destination?.name?.toLowerCase() || 
                    destinations.find(d => d._id === (exp.destination?._id || exp.destination))?.name?.toLowerCase() || '';
                  return destName !== 'dahab' && destName !== 'cairo';
                });
                if (otherExps.length === 0) return null;

                return (
                  <div className="tw-flex tw-flex-col">
                    <div className="tw-flex tw-justify-between tw-items-center tw-mb-8">
                      <h2 className="tw-flex tw-items-center tw-gap-3 tw-text-lg md:tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-tracking-widest tw-uppercase">
                        <i className="fa-solid fa-wand-magic-sparkles tw-text-amber-500 dark:tw-text-[#ffd700]"></i>
                        {lang === 'AR' ? 'اكتشف المزيد' : 'DISCOVER MORE'}
                      </h2>
                      {otherExps.length > 0 && (
                        <div className="tw-flex tw-gap-2">
                          <button 
                            onClick={() => scrollCarousel(otherRef, 'left')}
                            className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-white dark:hover:tw-text-white hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-all tw-cursor-pointer tw-shadow-sm"
                          >
                            <i className={`fa-solid ${lang === 'AR' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i>
                          </button>
                          <button 
                            onClick={() => scrollCarousel(otherRef, 'right')}
                            className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-white dark:tw-bg-slate-900 tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-white dark:hover:tw-text-white hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-all tw-cursor-pointer tw-shadow-sm"
                          >
                            <i className={`fa-solid ${lang === 'AR' ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
                          </button>
                        </div>
                      )}
                    </div>
                    <div 
                      ref={otherRef}
                      className="tw-flex tw-overflow-x-auto tw-snap-x tw-snap-mandatory tw-gap-6 tw-pb-8 tw-hide-scrollbar"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {otherExps.map(exp => <ExperienceCard key={exp._id} exp={exp} destinations={destinations} wishlistIds={wishlistIds} handleCardClick={handleCardClick} handleWishlistToggle={handleWishlistToggle} lang={lang} />)}
                    </div>
                  </div>
                );
              })()}

            </div>
          ) : (
            /* Search Results Grid */
            <div className="tw-flex tw-flex-col">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-8">
                <h2 className="tw-flex tw-items-center tw-gap-3 tw-text-lg md:tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-tracking-widest tw-uppercase">
                  <i className="fa-solid fa-wand-magic-sparkles tw-text-amber-500 dark:tw-text-[#ffd700]"></i>
                  {lang === 'AR' ? 'نتائج البحث' : 'SEARCH RESULTS'}
                </h2>
              </div>
              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-gap-6 tw-mb-16">
                {displayedExperiences.map((exp) => (
                  <ExperienceCard key={exp._id} exp={exp} destinations={destinations} wishlistIds={wishlistIds} handleCardClick={handleCardClick} handleWishlistToggle={handleWishlistToggle} lang={lang} />
                ))}
              </div>
            </div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Experiences;
