import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getWishlist, removeFromWishlist } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('clearpath_access_token');
  const { lang, setLang } = useContext(LanguageContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const response = await getWishlist();
        const items = response.wishlist?.experiences || response.data?.experiences || response.wishlist || response.data || [];
        setWishlistItems(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error("Failed to load wishlist");
        setError(lang === 'AR' ? 'حدث خطأ أثناء تحميل قائمتك المفضلة' : 'Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [token]);

  const handleRemove = async (e, experienceId) => {
    e.stopPropagation();
    try {
      await removeFromWishlist(experienceId);
      setWishlistItems((prev) => prev.filter((item) => (item._id || item.id) !== experienceId));
    } catch (err) {
      console.error("Failed to remove item");
    }
  };

  return (
    <div className={`tw-min-h-screen tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-font-sans tw-flex tw-flex-col ${lang === 'AR' ? 'tw-dir-rtl' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={true} />

      {/* Header Section matching screenshot */}
      <header className="tw-pt-40 tw-pb-16 tw-px-4 tw-text-center tw-flex tw-flex-col tw-items-center">
        <p className="tw-text-amber-600 dark:tw-text-[#ffd700] tw-text-xs md:tw-text-sm tw-font-bold tw-tracking-[0.2em] tw-uppercase tw-mb-4">
          {lang === 'AR' ? 'رحلاتك المختارة بعناية' : 'SELECTED CURATED JOURNEYS'}
        </p>
        <h1 className="tw-text-4xl md:tw-text-6xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-6 tw-tracking-wide">
          {lang === 'AR' ? 'قائمتك المفضلة' : 'YOUR WISHLIST'}
        </h1>
        <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-text-sm md:tw-text-base tw-max-w-2xl tw-mx-auto tw-leading-relaxed tw-font-medium dark:tw-font-light">
          {lang === 'AR' 
            ? 'العالم ينتظرك، ومسارك يبدأ بالتشكل هنا. استكشف مغامراتك المحفوظة، وقارن بين الملاذات الحصرية، وصمم خط سير رحلتك المثالي.' 
            : 'The world is waiting, and your path is starting to take shape. Explore your saved adventures, compare exclusive retreats, and design your ultimate bespoke itinerary.'}
        </p>
      </header>

      {/* Main Content Area */}
      <main className="tw-flex-grow tw-container tw-mx-auto tw-px-4 tw-pb-24 tw-max-w-7xl">
        {!token ? (
          <div className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-slate-200 dark:tw-border-white/5 tw-rounded-2xl tw-p-16 tw-text-center tw-max-w-2xl tw-mx-auto tw-shadow-sm dark:tw-shadow-none">
            <i className="fa-solid fa-lock tw-text-5xl tw-text-slate-400 dark:tw-text-slate-700 tw-mb-6"></i>
            <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">
              {lang === 'AR' ? 'يرجى تسجيل الدخول' : 'Authentication Required'}
            </h3>
            <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-mb-8">
              {lang === 'AR' ? 'يجب عليك تسجيل الدخول لتتمكن من استعراض قائمتك المفضلة.' : 'You need to log in to view and manage your saved curated journeys.'}
            </p>
            <button 
              onClick={() => navigate('/login')} 
              className="tw-bg-amber-500 dark:tw-bg-[#ffd700] hover:tw-bg-amber-600 dark:hover:tw-bg-[#e5c100] tw-text-black tw-font-bold tw-py-3 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors"
            >
              {lang === 'AR' ? 'تسجيل الدخول' : 'Log In'}
            </button>
          </div>
        ) : loading ? (
          <div className="tw-flex tw-justify-center tw-items-center tw-py-32">
            <i className="fa-solid fa-circle-notch fa-spin tw-text-5xl tw-text-amber-500 dark:tw-text-[#ffd700]"></i>
          </div>
        ) : error ? (
           <div className="tw-text-center tw-text-red-500 tw-py-10">{error}</div>
        ) : wishlistItems.length === 0 ? (
          <div className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-slate-200 dark:tw-border-white/5 tw-rounded-2xl tw-p-16 tw-text-center tw-max-w-2xl tw-mx-auto tw-shadow-sm dark:tw-shadow-none">
            <i className="fa-regular fa-heart tw-text-5xl tw-text-slate-400 dark:tw-text-slate-700 tw-mb-6"></i>
            <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">
              {lang === 'AR' ? 'قائمتك المفضلة فارغة' : 'Your Wishlist is Empty'}
            </h3>
            <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-mb-8">
              {lang === 'AR' 
                ? 'لم تقم بحفظ أي تجارب بعد. اكتشف وجهاتنا الحصرية وابدأ في بناء خط سير رحلتك.' 
                : 'You haven\'t saved any experiences yet. Discover our exclusive destinations and start building your itinerary.'}
            </p>
            <button 
              onClick={() => navigate('/experiences')} 
              className="tw-bg-amber-500 dark:tw-bg-[#ffd700] hover:tw-bg-amber-600 dark:hover:tw-bg-[#e5c100] tw-text-black tw-font-bold tw-py-3 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors"
            >
              {lang === 'AR' ? 'استكشف التجارب' : 'Explore Experiences'}
            </button>
          </div>
        ) : (
          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-8">
            {wishlistItems.map((item) => {
              const isDayuse = item.duration_days === 1;
              const tagText = isDayuse 
                ? (lang === 'AR' ? 'استجمام حصري' : 'PRIVATE SANCTUARY')
                : (lang === 'AR' ? 'تجربة ثقافية' : 'CULTURAL IMMERSION');
              
              const price = item.base_price || item.calculatedPrice || 0;
              const images = Array.isArray(item.images) && item.images.length > 0 ? item.images : [item.image || "/img/cairo_pyramids_1775971845389.png"];

              return (
                <div 
                  key={item._id || item.id} 
                  className="tw-bg-white dark:tw-bg-[#111111] tw-rounded-sm tw-overflow-hidden tw-border tw-border-slate-200 dark:tw-border-white/5 hover:tw-border-slate-300 dark:hover:tw-border-white/20 hover:tw-shadow-xl dark:hover:tw-shadow-2xl hover:tw-shadow-slate-200 dark:hover:tw-shadow-[#ffd700]/5 tw-transition-all tw-duration-300 tw-cursor-pointer tw-flex tw-flex-col tw-h-[550px] tw-group"
                  onClick={() => navigate(`/package-details/${item._id || item.id}`)}
                >
                  {/* Image Section */}
                  <div className="tw-relative tw-h-[280px] tw-w-full tw-overflow-hidden tw-flex-shrink-0">
                    <img 
                      src={images[0]} 
                      alt={item.name} 
                      className="tw-w-full tw-h-full tw-object-cover group-hover:tw-scale-105 tw-transition-transform tw-duration-700" 
                    />
                    
                    {/* Remove 'X' Button - matching screenshot */}
                    <button 
                      className="tw-absolute tw-top-4 tw-right-4 tw-w-8 tw-h-8 tw-rounded-md tw-flex tw-items-center tw-justify-center tw-bg-white/80 dark:tw-bg-black/40 tw-backdrop-blur-md tw-text-slate-900 dark:tw-text-white hover:tw-bg-white dark:hover:tw-bg-black/80 hover:tw-text-red-500 dark:hover:tw-text-red-500 tw-transition-colors tw-z-10 tw-shadow-sm"
                      onClick={(e) => handleRemove(e, item._id || item.id)}
                      title={lang === 'AR' ? 'إزالة' : 'Remove'}
                    >
                      <i className="fa-solid fa-xmark tw-text-sm"></i>
                    </button>
                    
                    {/* Bottom fade gradient */}
                    <div className="tw-absolute tw-inset-x-0 tw-bottom-0 tw-h-1/2 tw-bg-gradient-to-t tw-from-white dark:tw-from-[#111111] tw-to-transparent"></div>
                  </div>

                  {/* Content Section */}
                  <div className="tw-p-6 tw-flex tw-flex-col tw-flex-grow">
                    <div className="tw-text-amber-600 dark:tw-text-[#ffd700] tw-text-[9px] tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                      {tagText}
                    </div>
                    <h3 className="tw-text-2xl tw-font-serif tw-text-slate-900 dark:tw-text-white tw-mb-4 tw-leading-tight group-hover:tw-text-amber-600 dark:group-hover:tw-text-[#ffd700] tw-transition-colors tw-line-clamp-2">
                      {item.name}
                    </h3>
                    
                    {/* Icons row */}
                    <div className="tw-flex tw-items-center tw-gap-4 tw-mb-6">
                      <div className="tw-flex tw-items-center tw-gap-2 tw-text-slate-500 dark:tw-text-slate-400 tw-text-[10px] tw-font-bold tw-tracking-widest tw-uppercase">
                        <i className="fa-regular fa-clock"></i>
                        <span>{item.duration_days} {lang === 'AR' ? 'أيام' : 'DAYS'}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-2 tw-text-slate-500 dark:tw-text-slate-400 tw-text-[10px] tw-font-bold tw-tracking-widest tw-uppercase">
                        <i className="fa-regular fa-star"></i>
                        <span>{item.rating || '4.9'}</span>
                      </div>
                    </div>
                    
                    {/* Card Footer */}
                    <div className="tw-mt-auto tw-flex tw-justify-between tw-items-end tw-pt-4 tw-border-t tw-border-slate-100 dark:tw-border-white/5">
                      <div className="tw-flex tw-flex-col">
                        <span className="tw-text-slate-500 tw-text-[10px] tw-font-bold tw-tracking-widest tw-uppercase tw-mb-1">
                          {lang === 'AR' ? 'السعر من' : 'FROM'}
                        </span>
                        <span className="tw-text-amber-600 dark:tw-text-[#ffd700] tw-font-bold tw-text-xl">
                          ${price.toLocaleString()}
                        </span>
                      </div>
                      <button 
                        className="tw-bg-amber-500 dark:tw-bg-[#ffd700] hover:tw-bg-amber-600 dark:hover:tw-bg-[#e5c100] tw-text-black tw-font-bold tw-py-2.5 tw-px-6 tw-text-[10px] tw-tracking-widest tw-uppercase tw-transition-colors"
                        onClick={(e) => { e.stopPropagation(); navigate(`/package-details/${item._id || item.id}`); }}
                      >
                        {lang === 'AR' ? 'التفاصيل' : 'VIEW DETAILS'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
