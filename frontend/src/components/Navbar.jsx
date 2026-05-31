import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setChatOpen } from '../store/authSlice';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import { CurrencyContext } from '../context/CurrencyContext';
import { getUserProfile } from '../utils/api';

const Navbar = ({ isScrolled, dashboardMode }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { lang, toggleLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { currency, toggleCurrency } = useContext(CurrencyContext);

  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || !!localStorage.getItem('token'));
  const reduxUser = useSelector((state) => state.auth?.user);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [tripChain, setTripChain] = useState([]);
  const [isChainPanelOpen, setIsChainPanelOpen] = useState(false);

  const loadTripChain = () => {
    const chain = JSON.parse(localStorage.getItem('clearpath_trip_chain') || '[]');
    setTripChain(chain);
  };

  useEffect(() => {
    loadTripChain();
    window.addEventListener('tripChainUpdated', loadTripChain);
    return () => window.removeEventListener('tripChainUpdated', loadTripChain);
  }, []);

  const handleRemoveFromChain = (index) => {
    const newChain = [...tripChain];
    newChain.splice(index, 1);
    localStorage.setItem('clearpath_trip_chain', JSON.stringify(newChain));
    setTripChain(newChain);
    window.dispatchEvent(new Event('tripChainUpdated'));
  };

  const handleCheckoutChain = () => {
    setIsChainPanelOpen(false);
    navigate('/my-bookings?tab=pending');
  };

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
            {/* Glowing Trip Chain Link Icon */}
            <div className="tw-relative tw-mr-1">
              <button 
                type="button"
                onClick={() => setIsChainPanelOpen(!isChainPanelOpen)}
                className={`tw-w-9 tw-h-9 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-300 tw-relative tw-border ${
                  tripChain.length > 0 
                    ? 'tw-bg-amber-500/10 tw-border-amber-500 tw-text-amber-500 tw-shadow-[0_0_15px_rgba(245,158,11,0.65)] tw-animate-pulse' 
                    : 'tw-bg-white/50 dark:tw-bg-transparent tw-border-slate-300 dark:tw-border-slate-700 tw-text-slate-600 dark:tw-text-slate-300 hover:tw-text-amber-500 dark:hover:tw-text-amber-500 hover:tw-border-amber-500 dark:hover:tw-border-amber-500'
                }`}
                title={lang === 'AR' ? 'سلسلة الرحلة المضيئة' : 'Glowing Trip Chain'}
              >
                <i className="fa-solid fa-link tw-text-sm"></i>
                {tripChain.length > 0 && (
                  <span className="tw-absolute -tw-top-1 -tw-right-1 tw-bg-amber-500 tw-text-slate-950 tw-text-[9px] tw-font-black tw-w-4 tw-h-4 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-md">
                    {tripChain.length}
                  </span>
                )}
              </button>

              {/* Trip Chain Dropdown Panel */}
              {isChainPanelOpen && (
                <div 
                  className="tw-absolute tw-top-[calc(100%+12px)] tw-right-0 tw-w-[320px] tw-bg-[#0c0d12]/95 tw-backdrop-blur-md tw-border tw-border-amber-500/30 tw-rounded-2xl tw-shadow-[0_15px_50px_rgba(0,0,0,0.8)] tw-p-4 tw-z-[1001] tw-text-slate-200"
                  style={{ direction: lang === 'AR' ? 'rtl' : 'ltr', textAlign: lang === 'AR' ? 'right' : 'left' }}
                >
                  <div className="tw-flex tw-items-center tw-justify-between tw-pb-3 tw-border-b tw-border-slate-800/80 tw-mb-3">
                    <span className="tw-text-sm tw-font-bold tw-text-amber-500 tw-flex tw-items-center tw-gap-1.5">
                      <i className="fa-solid fa-link"></i>
                      {lang === 'AR' ? 'تجميع سلسلة الرحلة' : 'Trip Chain Builder'}
                    </span>
                    <span className="tw-text-xs tw-bg-amber-500/20 tw-text-amber-400 tw-px-2 tw-py-0.5 tw-rounded-full tw-font-black">
                      {tripChain.length} {lang === 'AR' ? 'باقات' : 'Packages'}
                    </span>
                  </div>

                  {tripChain.length === 0 ? (
                    <div className="tw-py-8 tw-text-center tw-text-slate-500 tw-text-xs">
                      <i className="fa-regular fa-folder-open tw-text-2xl tw-mb-2 tw-block tw-text-slate-700"></i>
                      {lang === 'AR' ? 'سلسلة الرحلة فارغة حالياً' : 'Your trip chain is currently empty.'}
                    </div>
                  ) : (
                    <>
                      <div className="tw-max-h-[220px] tw-overflow-y-auto tw-flex tw-flex-col tw-gap-2.5 tw-pr-1">
                        {tripChain.map((item, idx) => (
                          <div key={idx} className="tw-flex tw-gap-3 tw-bg-slate-900/50 tw-p-2.5 tw-rounded-xl tw-border tw-border-slate-800/80 tw-relative tw-group">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="tw-w-12 tw-h-12 tw-rounded-lg tw-object-cover tw-border tw-border-slate-800"
                            />
                            <div className="tw-flex-1 tw-min-w-0">
                              <h4 className="tw-text-xs tw-font-bold tw-text-white tw-truncate tw-mb-0.5">{item.name}</h4>
                              <p className="tw-text-[10px] tw-text-slate-400 tw-mb-1">
                                {lang === 'AR' ? `${item.guestCount} مسافرين` : `${item.guestCount} travelers`}
                              </p>
                              <span className="tw-text-xs tw-font-extrabold tw-text-amber-500">
                                {item.price.toLocaleString()} EGP
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => handleRemoveFromChain(idx)}
                              className="tw-absolute tw-top-2.5 tw-right-2.5 tw-w-6 tw-h-6 tw-rounded-lg tw-bg-red-500/10 hover:tw-bg-red-500 tw-text-red-400 hover:tw-text-white tw-flex tw-items-center tw-justify-center tw-transition-colors tw-border-none"
                            >
                              <i className="fa-solid fa-trash-can tw-text-[11px]"></i>
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="tw-mt-4 tw-pt-3 tw-border-t tw-border-slate-800/80">
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-3.5">
                          <span className="tw-text-xs tw-text-slate-400 tw-font-bold">
                            {lang === 'AR' ? 'الإجمالي الكلي للسلسلة:' : 'Total Chain Cost:'}
                          </span>
                          <span className="tw-text-sm tw-font-black tw-text-amber-500">
                            {tripChain.reduce((sum, item) => sum + item.price, 0).toLocaleString()} EGP
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={handleCheckoutChain}
                          className="tw-w-full tw-bg-gradient-to-r tw-from-amber-500 tw-to-amber-600 hover:tw-from-amber-600 hover:tw-to-amber-700 tw-text-slate-950 tw-font-bold tw-text-xs tw-py-2.5 tw-px-4 tw-rounded-xl tw-transition-all tw-shadow-[0_4px_15px_rgba(245,158,11,0.2)] tw-border-none"
                        >
                          {lang === 'AR' ? 'تأكيد السلسلة والدفع 💳' : 'Proceed to Checkout & Pay'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={toggleLanguage}
              className="tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-px-3 tw-h-9 tw-rounded-full tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white/50 dark:tw-bg-transparent tw-text-slate-600 dark:tw-text-slate-300 hover:tw-text-amber-500 dark:hover:tw-text-amber-500 hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-colors tw-text-xs tw-font-bold"
              title={lang === 'AR' ? 'تغيير اللغة' : 'Change Language'}
            >
              <i className="fa-solid fa-globe"></i>
              <span>{lang === 'AR' ? 'EN' : 'AR'}</span>
            </button>
          </div>

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

      </div>
    </nav>
  );
};

export default Navbar;
