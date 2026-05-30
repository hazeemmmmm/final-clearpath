import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setChatOpen } from '../store/authSlice';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { getUserProfile, createBooking } from '../utils/api';

const Navbar = ({ isScrolled, dashboardMode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { lang, toggleLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { currency, toggleCurrency, formatPrice } = useContext(CurrencyContext);

  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || !!localStorage.getItem('token'));
  const reduxUser = useSelector((state) => state.auth?.user);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const syncUser = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    } else if (reduxUser) {
      setCurrentUser(reduxUser);
    }
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  useEffect(() => {
    const fetchRealUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await getUserProfile();
          const userData = response.user || response.data?.user || response.data || response;
          if (userData && (userData.firstName || userData.name || userData.username)) {
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (e) {
          console.error('Navbar failed to fetch user profile:', e);
        }
      }
    };
    fetchRealUser();
  }, [isAuthenticated]);

  const [tripChain, setTripChain] = useState([]);
  const [isChainOpen, setIsChainOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const loadTripChain = () => {
    const chainStr = localStorage.getItem('clearpath_trip_chain');
    if (chainStr) {
      try {
        setTripChain(JSON.parse(chainStr));
      } catch (e) {
        console.error('Failed to parse trip chain from localStorage:', e);
      }
    } else {
      setTripChain([]);
    }
  };

  useEffect(() => {
    loadTripChain();
    window.addEventListener('cartUpdate', loadTripChain);
    return () => window.removeEventListener('cartUpdate', loadTripChain);
  }, []);

  const handleDeleteChainItem = (idxToDelete) => {
    const updated = tripChain.filter((_, idx) => idx !== idxToDelete);
    setTripChain(updated);
    localStorage.setItem('clearpath_trip_chain', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const handleChainCheckout = async () => {
    if (!isAuthenticated) {
      alert(lang === 'AR' ? 'يرجى تسجيل الدخول أولاً لإتمام الحجز.' : 'Please log in first to complete booking.');
      navigate('/login');
      setIsChainOpen(false);
      return;
    }

    if (tripChain.length === 0) return;

    setCheckoutLoading(true);
    try {
      const createdBookingIds = [];
      for (const item of tripChain) {
        let payload;
        if (item.isCustomizing && item.customTripId) {
          payload = { customTrip: item.customTripId, numberOfGuests: item.guestCount, selectedAddons: item.selectedAddons };
        } else {
          payload = { experienceId: item.id, numberOfGuests: item.guestCount, selectedAddons: item.selectedAddons };
        }
        
        const res = await createBooking(payload);
        const booking = res.data || res.booking || res;
        if (booking && booking._id) {
          createdBookingIds.push(booking._id);
        }
      }

      if (createdBookingIds.length > 0) {
        localStorage.removeItem('clearpath_trip_chain');
        window.dispatchEvent(new Event('cartUpdate'));
        setIsChainOpen(false);

        alert(lang === 'AR' 
          ? 'تم إنشاء حجوزات السلسلة بنجاح! سيتم توجيهك الآن لإتمام الدفع.' 
          : 'Trip Chain bookings created successfully! Redirecting you to complete payment.');
        
        localStorage.setItem('currentBookingId', createdBookingIds[createdBookingIds.length - 1]);
        navigate('/my-bookings');
      } else {
        throw new Error('Could not create bookings.');
      }
    } catch (err) {
      console.error('Checkout failed', err);
      alert(lang === 'AR' 
        ? 'حدث خطأ أثناء حجز السلسلة. يرجى المحاولة لاحقاً.' 
        : 'Error creating chain bookings. Please try again later.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navBgClass = dashboardMode
    ? 'tw-bg-transparent tw-border-none dark'
    : isScrolled
      ? 'tw-bg-white/95 dark:tw-bg-[#0a0b0d]/95 tw-backdrop-blur-md tw-shadow-sm dark:tw-shadow-2xl tw-border-b tw-border-slate-200/50 dark:tw-border-slate-800/50'
      : 'tw-bg-transparent tw-border-b tw-border-slate-200/50 dark:tw-border-slate-800/50';

  return (
    <nav className={`tw-fixed tw-top-0 tw-w-full tw-z-[1000] tw-transition-all tw-duration-300 ${navBgClass}`}>
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full tw-px-4 md:tw-px-6 lg:tw-px-8 tw-py-5 tw-flex tw-items-center tw-justify-between">
        
        {/* Left: Brand Logo */}
        <div 
          className="tw-flex tw-items-center tw-cursor-pointer" 
          onClick={() => navigate('/')}
        >
          {/* Brand Logo - Native transparent images */}
          <div className="tw-relative tw-w-[180px] md:tw-w-[240px] lg:tw-w-[280px] tw-h-16 md:tw-h-20 tw-flex tw-items-center tw-justify-start">
            {/* Light Mode Logo */}
            <img 
              src="/logo-light.png" 
              alt="ClearPath Logo" 
              className="tw-absolute tw-w-full tw-h-full tw-object-contain tw-scale-[1.5] md:tw-scale-[1.7] tw-origin-left tw-transition-opacity tw-duration-300 dark:tw-opacity-0"
            />
            {/* Dark Mode Logo */}
            <img 
              src="/logo-dark.png" 
              alt="ClearPath Logo" 
              className="tw-absolute tw-w-full tw-h-full tw-object-contain tw-scale-[1.5] md:tw-scale-[1.7] tw-origin-left tw-transition-opacity tw-duration-300 tw-opacity-0 dark:tw-opacity-100"
            />
          </div>
        </div>

        {/* Center: Navigation Links */}
        <div className="tw-hidden md:tw-flex tw-items-center tw-gap-4 lg:tw-gap-8">
          <Link to="/experiences" className="tw-text-sm tw-font-semibold tw-text-slate-800 dark:tw-text-slate-200 hover:tw-text-amber-600 dark:hover:tw-text-amber-500 tw-transition-colors tw-border-b-2 tw-border-amber-500 tw-pb-1">
            {lang === 'AR' ? 'الباقات' : 'Packages'}
          </Link>
          <Link to="/my-bookings" className="tw-text-sm tw-font-semibold tw-text-slate-800 dark:tw-text-slate-200 hover:tw-text-amber-600 dark:hover:tw-text-amber-500 tw-transition-colors tw-pb-1 tw-border-b-2 tw-border-transparent hover:tw-border-amber-500/50">
            {lang === 'AR' ? 'حجوزاتي' : 'My Bookings'}
          </Link>
          <Link to="/wishlist" className="tw-text-sm tw-font-semibold tw-text-slate-800 dark:tw-text-slate-200 hover:tw-text-amber-600 dark:hover:tw-text-amber-500 tw-transition-colors tw-pb-1 tw-border-b-2 tw-border-transparent hover:tw-border-amber-500/50">
            {lang === 'AR' ? 'المفضلة' : 'Wishlist'}
          </Link>
          <span 
            onClick={() => dispatch(setChatOpen(true))}
            className="tw-text-sm tw-font-semibold tw-text-slate-800 dark:tw-text-slate-200 hover:tw-text-amber-600 dark:hover:tw-text-amber-500 tw-transition-colors tw-cursor-pointer tw-pb-1 tw-border-b-2 tw-border-transparent hover:tw-border-amber-500/50"
          >
            {lang === 'AR' ? 'الدعم' : 'Support'}
          </span>
        </div>

        {/* Right: Actions & Manage Account */}
        <div className="tw-flex tw-items-center tw-gap-3 md:tw-gap-4 tw-relative tw-flex-shrink-0">
          
          {/* Toggles */}
          <div className="tw-flex tw-items-center tw-gap-2 tw-mr-2">
            <button 
              onClick={toggleTheme}
              className="tw-w-9 tw-h-9 tw-rounded-full tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white/50 dark:tw-bg-transparent tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-text-amber-500 dark:hover:tw-text-amber-500 hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-colors"
              title={lang === 'AR' ? 'تبديل المظهر' : 'Toggle Theme'}
            >
              <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>

            <button 
              onClick={() => toggleCurrency(currency === 'EGP' ? 'USD' : 'EGP')}
              className="tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-px-3 tw-h-9 tw-rounded-full tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white/50 dark:tw-bg-transparent tw-text-slate-600 dark:tw-text-slate-300 hover:tw-text-amber-500 dark:hover:tw-text-amber-500 hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-colors tw-text-xs tw-font-bold"
              title="Toggle Currency"
            >
              <i className="fa-solid fa-coins"></i>
              <span>{currency}</span>
            </button>
            <button 
              onClick={toggleLanguage}
              className="tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-px-3 tw-h-9 tw-rounded-full tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white/50 dark:tw-bg-transparent tw-text-slate-600 dark:tw-text-slate-300 hover:tw-text-amber-500 dark:hover:tw-text-amber-500 hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-colors tw-text-xs tw-font-bold"
              title={lang === 'AR' ? 'تغيير اللغة' : 'Change Language'}
            >
              <i className="fa-solid fa-globe"></i>
              <span>{lang === 'AR' ? 'EN' : 'AR'}</span>
            </button>
          </div>

          {/* Glowing Trip Chain / Cart Button */}
          <button 
            type="button"
            onClick={() => setIsChainOpen(!isChainOpen)}
            className="tw-relative tw-w-9 tw-h-9 tw-rounded-full tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white/50 dark:tw-bg-transparent tw-flex tw-items-center tw-justify-center tw-text-slate-600 dark:tw-text-slate-300 hover:tw-text-amber-500 dark:hover:tw-text-amber-500 hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-colors tw-cursor-pointer"
            title={lang === 'AR' ? 'سلسلة الرحلات' : 'My Trip Chain'}
          >
            <i className="fa-solid fa-link"></i>
            {tripChain.length > 0 && (
              <span className="tw-absolute -tw-top-1.5 -tw-right-1.5 tw-w-5 tw-h-5 tw-bg-amber-500 tw-text-black tw-text-[10px] tw-font-extrabold tw-rounded-full tw-flex tw-items-center tw-justify-center tw-animate-pulse tw-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                {tripChain.length}
              </span>
            )}
          </button>

          {/* User Button / Auth Links */}
          {isAuthenticated ? (
            <div 
              className="tw-flex tw-items-center tw-gap-3 tw-cursor-pointer tw-group tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white/50 dark:tw-bg-transparent tw-rounded-full tw-pl-4 tw-pr-1 tw-py-1 hover:tw-border-slate-400 dark:hover:tw-border-slate-500 tw-transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="tw-hidden lg:tw-block tw-text-sm tw-font-semibold tw-text-slate-700 dark:tw-text-slate-200 group-hover:tw-text-slate-900 dark:group-hover:tw-text-white tw-transition-colors tw-truncate tw-max-w-[80px] lg:tw-max-w-[120px]">
                {currentUser?.username || currentUser?.firstName || currentUser?.name || 'User'}
              </span>
              <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-gradient-to-br tw-from-amber-400 tw-to-amber-600 tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-shadow-md group-hover:tw-scale-105 tw-transition-transform">
                {(currentUser?.username?.[0] || currentUser?.firstName?.[0] || currentUser?.name?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="tw-flex tw-items-center tw-gap-2 md:tw-gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="tw-text-sm tw-font-semibold tw-text-slate-700 dark:tw-text-slate-200 hover:tw-text-amber-600 dark:hover:tw-text-amber-500 tw-transition-colors"
              >
                {lang === 'AR' ? 'دخول' : 'Login'}
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="tw-text-sm tw-font-semibold tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-white tw-px-4 tw-py-2 tw-rounded-full tw-transition-colors tw-shadow-sm"
              >
                {lang === 'AR' ? 'حساب جديد' : 'Register'}
              </button>
            </div>
          )}

          {/* Dropdown Menu */}
          {isAuthenticated && isDropdownOpen && (
            <div className="tw-absolute tw-top-[calc(100%+10px)] tw-right-0 md:tw-right-0 tw-w-64 tw-bg-white dark:tw-bg-[#15171a] tw-border tw-border-slate-200 dark:tw-border-slate-800/80 tw-rounded-2xl tw-shadow-[0_10px_40px_-15px_rgba(0,0,0,0.2)] dark:tw-shadow-2xl tw-py-2 tw-z-50 tw-animate-in tw-fade-in tw-zoom-in-95 tw-slide-in-from-top-2 tw-origin-top-right">
              <div className="tw-px-5 tw-py-4 tw-border-b tw-border-slate-100 dark:tw-border-slate-800/50 tw-bg-gradient-to-b tw-from-slate-50/80 tw-to-white dark:tw-from-[#1a1d24] dark:tw-to-[#15171a] tw-rounded-t-2xl">
                <p className="tw-text-sm tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-0.5 tw-truncate">{currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : (currentUser?.username || currentUser?.name || 'User')}</p>
                <p className="tw-text-xs tw-text-slate-500 dark:tw-text-slate-400 tw-truncate">{currentUser?.email || ''}</p>
              </div>
              
              <div className="tw-py-2 tw-px-2 tw-flex tw-flex-col tw-gap-1">
                {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && (
                  <button onClick={() => { setIsDropdownOpen(false); navigate(currentUser.role === 'admin' ? '/admin' : '/supervisor'); }} className="tw-w-full tw-bg-transparent tw-border-none tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800/80 hover:tw-text-amber-600 dark:hover:tw-text-white tw-rounded-xl tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                    <i className="fa-solid fa-user-shield tw-w-5 tw-text-center"></i> {lang === 'AR' ? 'لوحة التحكم' : 'Dashboard'}
                  </button>
                )}
                <button onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }} className="tw-w-full tw-bg-transparent tw-border-none tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800/80 hover:tw-text-amber-600 dark:hover:tw-text-white tw-rounded-xl tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                  <i className="fa-regular fa-circle-user tw-w-5 tw-text-center"></i> {lang === 'AR' ? 'الملف الشخصي' : 'My Profile'}
                </button>
                <button onClick={() => { setIsDropdownOpen(false); navigate('/my-bookings'); }} className="tw-w-full tw-bg-transparent tw-border-none tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800/80 hover:tw-text-amber-600 dark:hover:tw-text-white tw-rounded-xl tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                  <i className="fa-solid fa-briefcase tw-w-5 tw-text-center"></i> {lang === 'AR' ? 'حجوزاتي ورحلاتي' : 'My Bookings & Trips'}
                </button>
                <button onClick={() => { setIsDropdownOpen(false); navigate('/wishlist'); }} className="tw-w-full tw-bg-transparent tw-border-none tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800/80 hover:tw-text-amber-600 dark:hover:tw-text-white tw-rounded-xl tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                  <i className="fa-solid fa-heart tw-w-5 tw-text-center"></i> {lang === 'AR' ? 'المفضلة' : 'Wishlist'}
                </button>
              </div>

              <div className="tw-px-4 tw-py-3 tw-border-t tw-border-slate-100 dark:tw-border-slate-800/50">
                <button 
                  onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                  className="tw-w-full tw-bg-transparent tw-border-none tw-flex tw-items-center tw-gap-3 tw-justify-center tw-py-2.5 tw-rounded-xl tw-text-rose-500 hover:tw-bg-rose-50 dark:hover:tw-bg-rose-500/10 tw-transition-colors tw-text-sm tw-font-semibold"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket tw-rotate-180"></i> {lang === 'AR' ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trip Chain Drawer Dropdown Panel */}
        {isChainOpen && (
          <div className={`tw-absolute tw-top-[calc(100%+10px)] ${lang === 'AR' ? 'tw-left-4' : 'tw-right-4'} tw-w-80 md:tw-w-96 tw-bg-white dark:tw-bg-[#111215] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-shadow-2xl tw-py-4 tw-px-5 tw-z-[9999] tw-animate-in tw-fade-in tw-slide-in-from-top-3`}>
            
            {/* Header */}
            <div className="tw-flex tw-items-center tw-justify-between tw-pb-3 tw-border-b tw-border-slate-100 dark:tw-border-slate-800">
              <h4 className="tw-text-base tw-font-bold tw-text-slate-900 dark:tw-text-white tw-flex tw-items-center tw-gap-2">
                <i className="fa-solid fa-route tw-text-amber-500"></i>
                {lang === 'AR' ? 'مسار سلسلة الرحلات' : 'My Trip Chain'}
              </h4>
              <button 
                onClick={() => setIsChainOpen(false)}
                className="tw-bg-transparent tw-border-none tw-text-slate-400 hover:tw-text-slate-600 dark:hover:tw-text-slate-200 tw-cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Items List */}
            <div className="tw-py-3 tw-flex tw-flex-col tw-gap-4 tw-max-h-72 tw-overflow-y-auto tw-pr-1">
              {tripChain.length === 0 ? (
                <div className="tw-text-center tw-py-6 tw-text-slate-400 dark:tw-text-slate-500">
                  <i className="fa-solid fa-link-slash tw-text-3xl tw-mb-2"></i>
                  <p className="tw-text-xs">{lang === 'AR' ? 'سلسلتك فارغة حالياً. أضف باقات لبناء سلسلة رحلات متكاملة!' : 'Your trip chain is currently empty. Add packages to build your journey!'}</p>
                </div>
              ) : (
                tripChain.map((item, idx) => (
                  <div key={idx} className="tw-flex tw-gap-3 tw-pb-3 tw-border-b tw-border-slate-50/50 dark:tw-border-slate-800/40 last:tw-border-none">
                    {/* Image */}
                    <img 
                      src={item.image || '/logo-dark.png'} 
                      alt={item.name} 
                      className="tw-w-16 tw-h-16 tw-object-cover tw-rounded-lg tw-border tw-border-slate-100 dark:tw-border-slate-800"
                    />
                    {/* Details */}
                    <div className="tw-flex-1 tw-flex tw-flex-col tw-justify-between">
                      <div>
                        <h5 className="tw-text-xs tw-font-bold tw-text-slate-800 dark:tw-text-white tw-line-clamp-1 tw-mb-0.5">{item.name}</h5>
                        <span className="tw-text-[10px] tw-text-slate-500 dark:tw-text-slate-400">
                          {item.guestCount} {item.guestCount === 1 ? (lang === 'AR' ? 'مسافر' : 'Guest') : (lang === 'AR' ? 'مسافرين' : 'Guests')}
                          {item.isCustomizing && ` | ${lang === 'AR' ? 'خطة مخصصة' : 'Customized'}`}
                        </span>
                      </div>
                      <span className="tw-text-xs tw-font-extrabold tw-text-amber-500">
                        {formatPrice ? formatPrice(item.totalPrice) : `${item.totalPrice} EGP`}
                      </span>
                    </div>
                    {/* Delete */}
                    <button 
                      onClick={() => handleDeleteChainItem(idx)}
                      className="tw-bg-transparent tw-border-none tw-text-rose-500 hover:tw-text-rose-600 dark:hover:tw-text-rose-400 tw-cursor-pointer tw-h-fit tw-p-1 tw-mt-1"
                      title={lang === 'AR' ? 'حذف من السلسلة' : 'Remove from chain'}
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Total & Checkout */}
            {tripChain.length > 0 && (
              <div className="tw-pt-3 tw-border-t tw-border-slate-100 dark:tw-border-slate-800 tw-flex tw-flex-col tw-gap-3">
                <div className="tw-flex tw-justify-between tw-items-center">
                  <span className="tw-text-xs tw-font-semibold tw-text-slate-500 dark:tw-text-slate-400">{lang === 'AR' ? 'المجموع الكلي للسلسلة' : 'Trip Chain Total'}</span>
                  <span className="tw-text-base tw-font-extrabold tw-text-amber-500">
                    {formatPrice 
                      ? formatPrice(tripChain.reduce((sum, item) => sum + item.totalPrice, 0)) 
                      : `${tripChain.reduce((sum, item) => sum + item.totalPrice, 0)} EGP`}
                  </span>
                </div>

                <button
                  onClick={handleChainCheckout}
                  disabled={checkoutLoading}
                  className="tw-w-full tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-black tw-font-extrabold tw-py-2.5 tw-px-4 tw-rounded-xl tw-transition-colors tw-shadow-md tw-flex tw-items-center tw-justify-center tw-gap-2 tw-border-none tw-cursor-pointer tw-text-sm"
                >
                  {checkoutLoading ? (
                    <><i className="fa-solid fa-circle-notch fa-spin"></i> {lang === 'AR' ? 'جاري إتمام الحجز...' : 'Creating bookings...'}</>
                  ) : (
                    <><i className="fa-solid fa-wallet"></i> {lang === 'AR' ? 'تأكيد السلسلة والدفع' : 'Proceed to Checkout & Pay'}</>
                  )}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
