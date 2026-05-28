import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setChatOpen } from '../store/authSlice';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = ({ isScrolled }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { lang, toggleLanguage } = useContext(LanguageContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className={`tw-fixed tw-top-0 tw-w-full tw-z-[1000] tw-transition-all tw-duration-300 ${isScrolled ? 'tw-bg-white/95 dark:tw-bg-[#0a0b0d]/95 tw-backdrop-blur-md tw-shadow-md dark:tw-shadow-2xl' : 'tw-bg-transparent'} tw-border-b tw-border-slate-200/50 dark:tw-border-slate-800/50`}>
      <div className="tw-container tw-mx-auto tw-px-6 md:tw-px-10 tw-py-5 tw-flex tw-items-center tw-justify-between">
        
        {/* Left: Brand Logo */}
        <div 
          className="tw-flex tw-items-center tw-cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <span className="tw-text-2xl tw-font-serif tw-font-bold tw-tracking-wide tw-text-rose-200">
            Clear<span className="tw-text-rose-300">Path</span>
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="tw-hidden md:tw-flex tw-items-center tw-gap-8">
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
        <div className="tw-flex tw-items-center tw-gap-3 md:tw-gap-4 tw-relative">
          
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
              onClick={toggleLanguage}
              className="tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-px-3 tw-h-9 tw-rounded-full tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white/50 dark:tw-bg-transparent tw-text-slate-600 dark:tw-text-slate-300 hover:tw-text-amber-500 dark:hover:tw-text-amber-500 hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-transition-colors tw-text-xs tw-font-bold"
              title={lang === 'AR' ? 'تغيير اللغة' : 'Change Language'}
            >
              <i className="fa-solid fa-globe"></i>
              <span>{lang === 'AR' ? 'EN' : 'AR'}</span>
            </button>
          </div>

          {/* User Button */}
          <div 
            className="tw-flex tw-items-center tw-gap-3 tw-cursor-pointer tw-group tw-border tw-border-slate-300 dark:tw-border-slate-700 tw-bg-white/50 dark:tw-bg-transparent tw-rounded-full tw-pl-4 tw-pr-1 tw-py-1 hover:tw-border-slate-400 dark:hover:tw-border-slate-500 tw-transition-colors"
            onClick={() => {
              if (isAuthenticated) {
                setIsDropdownOpen(!isDropdownOpen);
              } else {
                navigate('/login');
              }
            }}
          >
            <span className="tw-hidden md:tw-block tw-text-sm tw-font-semibold tw-text-slate-700 dark:tw-text-slate-200 group-hover:tw-text-slate-900 dark:group-hover:tw-text-white tw-transition-colors">
              {isAuthenticated ? (currentUser?.name || 'User') : (lang === 'AR' ? 'إدارة الحساب' : 'Manage Account')}
            </span>
            <div className="tw-w-10 tw-h-10 tw-rounded-full tw-bg-[#e81c4c] tw-flex tw-items-center tw-justify-center tw-text-white tw-font-bold tw-shadow-md group-hover:tw-scale-105 tw-transition-transform">
              {isAuthenticated ? (currentUser?.name?.[0] || 'U').toUpperCase() : <i className="fa-solid fa-user"></i>}
            </div>
          </div>

          {/* Dropdown Menu */}
          {isAuthenticated && isDropdownOpen && (
            <div className="tw-absolute tw-top-[calc(100%+10px)] tw-right-0 tw-w-64 tw-bg-white dark:tw-bg-[#1a1d24] tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-xl tw-shadow-2xl tw-py-2 tw-z-50 tw-animate-in tw-fade-in tw-slide-in-from-top-2">
              <div className="tw-px-4 tw-py-3 tw-border-b tw-border-slate-100 dark:tw-border-slate-800/50">
                <p className="tw-text-sm tw-font-bold tw-text-slate-900 dark:tw-text-white">{currentUser?.name || 'User'}</p>
                <p className="tw-text-xs tw-text-slate-500 dark:tw-text-slate-400 tw-truncate">{currentUser?.email || ''}</p>
              </div>
              
              <div className="tw-py-2">
                {(currentUser?.role === 'admin' || currentUser?.role === 'supervisor') && (
                  <button onClick={() => { setIsDropdownOpen(false); navigate(currentUser.role === 'admin' ? '/admin' : '/supervisor'); }} className="tw-w-full tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800 hover:tw-text-slate-900 dark:hover:tw-text-white tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                    <i className="fa-solid fa-user-shield tw-w-5"></i> Admin Dashboard
                  </button>
                )}
                <button onClick={() => { setIsDropdownOpen(false); navigate('/profile'); }} className="tw-w-full tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800 hover:tw-text-slate-900 dark:hover:tw-text-white tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                  <i className="fa-regular fa-circle-user tw-w-5"></i> My Profile
                </button>
                <button onClick={() => { setIsDropdownOpen(false); navigate('/my-bookings'); }} className="tw-w-full tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800 hover:tw-text-slate-900 dark:hover:tw-text-white tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                  <i className="fa-solid fa-briefcase tw-w-5"></i> Bookings & Trips
                </button>
                <button onClick={() => setIsDropdownOpen(false)} className="tw-w-full tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800 hover:tw-text-slate-900 dark:hover:tw-text-white tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                  <i className="fa-solid fa-star tw-w-5"></i> My Reviews
                </button>
                <button onClick={() => { setIsDropdownOpen(false); navigate('/wishlist'); }} className="tw-w-full tw-text-left tw-px-4 tw-py-2.5 tw-text-sm tw-text-slate-600 dark:tw-text-slate-300 hover:tw-bg-slate-50 dark:hover:tw-bg-slate-800 hover:tw-text-slate-900 dark:hover:tw-text-white tw-flex tw-items-center tw-gap-3 tw-transition-colors">
                  <i className="fa-solid fa-heart tw-w-5"></i> Wish List
                </button>
              </div>

              <div className="tw-px-4 tw-py-2 tw-border-t tw-border-slate-100 dark:tw-border-slate-800/50">
                <button 
                  onClick={() => { setIsDropdownOpen(false); handleLogout(); }}
                  className="tw-w-full tw-flex tw-items-center tw-gap-3 tw-justify-center tw-py-2 tw-border tw-border-rose-500/50 tw-rounded-full tw-text-rose-500 hover:tw-bg-rose-500/10 tw-transition-colors tw-text-sm tw-font-semibold"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket tw-rotate-180"></i> Logout
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
