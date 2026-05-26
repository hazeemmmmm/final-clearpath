import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, toggleChat } from '../store/authSlice';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

const Navbar = ({ isScrolled }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);
  const { lang, toggleLanguage } = React.useContext(LanguageContext);

  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || !!localStorage.getItem('token'));
  const reduxUser = useSelector((state) => state.auth?.user);
  const [currentUser, setCurrentUser] = useState(null);

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
    syncUser();
  }, [reduxUser, showProfileMenu]);

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && !currentUser?.firstName) {
        try {
          const { getUserProfile } = await import('../utils/api');
          const res = await getUserProfile();
          const userData = res.user || res.data?.user || res.data || res;
          if (userData) {
            setCurrentUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (err) {
          console.error("Failed to fetch user in Navbar", err);
        }
      }
    };
    fetchUser();
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-profile-dropdown-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleToggleLang = () => {
    toggleLanguage();
    setShowLangMenu(false);
  };

  const handleOpenAuth = (type) => {
    navigate(`/${type}`);
  };

  const handleChatClick = (e) => {
    e.preventDefault();
    dispatch(toggleChat());
  };

  const activeUser = currentUser || reduxUser;
  const userInitial = activeUser?.firstName ? activeUser.firstName.charAt(0).toUpperCase() : 'U';
  const fullName = activeUser ? `${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim() : (lang === 'AR' ? 'مستخدم' : 'User');

  return (
    <nav id="navbar" className={isScrolled ? 'shrink' : ''}>
      <div className="nav-container">
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon"><i className="fa-solid fa-map-marked-alt"></i></span> Clear<span>Path</span>
        </div>

        <div className="nav-links">
          <Link to="/">{lang === 'AR' ? '🏠 الرئيسية' : '🏠 Home'}</Link>
          <Link to="/experiences">
            <span className="compass-icon">🧭</span> {lang === 'AR' ? 'التجارب' : 'Experiences'}
          </Link>
          <Link to="/wishlist"><i className="fa-solid fa-heart"></i> {lang === 'AR' ? 'المفضلة' : 'Wishlist'}</Link>
          <a href="#" onClick={handleChatClick} className="nav-chat-toggle-btn">
            <i className="fa-solid fa-robot nav-chatbot-icon"></i> {lang === 'AR' ? 'المساعد الذكي' : 'Assistant'}
          </a>
        </div>

        <div className="nav-actions">
          <div className="nav-toggles">
            <button className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`} onClick={toggleTheme} title="Toggle Dark Mode">
              {isDarkMode ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
            </button>

            <div className="lang-dropdown">
              <button className="dropbtn" onClick={() => setShowLangMenu(!showLangMenu)}>
                🌐 <span>{lang}</span>
              </button>
              {showLangMenu && (
                <div className="dropdown-content show">
                  <a href="#" onClick={(e) => { e.preventDefault(); handleToggleLang(); }}>English</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleToggleLang(); }}>العربية</a>
                </div>
              )}
            </div>
          </div>
          {isAuthenticated ? (
            <div className="nav-profile-dropdown-container">
              <button className="nav-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div className="nav-profile-avatar">
                  {userInitial}
                </div>
                <div className="nav-profile-info">
                  <span className="nav-profile-name">{fullName}</span>
                </div>
              </button>
              {showProfileMenu && (
                <div className="nav-profile-dropdown-content show">
                  <div className="dropdown-header">
                    <h4>{fullName}</h4>
                    <p>{activeUser?.email || ''}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  {activeUser?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setShowProfileMenu(false)}>
                      <i className="fa-solid fa-user-shield"></i> {lang === 'AR' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
                    </Link>
                  )}
                  {activeUser?.role === 'supervisor' && (
                    <Link to="/supervisor" onClick={() => setShowProfileMenu(false)}>
                      <i className="fa-solid fa-route"></i> {lang === 'AR' ? 'لوحة المشرف' : 'Supervisor Dashboard'}
                    </Link>
                  )}
                  <Link to="/profile?tab=info" onClick={() => setShowProfileMenu(false)}>
                    <i className="fa-solid fa-user-circle"></i> {lang === 'AR' ? 'حسابي' : 'My Profile'}
                  </Link>
                  <Link to="/my-bookings" onClick={() => setShowProfileMenu(false)}>
                    <i className="fa-solid fa-briefcase"></i> {lang === 'AR' ? 'الحجوزات والرحلات' : 'Bookings & Trips'}
                  </Link>
                  <Link to="/profile?tab=reviews" onClick={() => setShowProfileMenu(false)}>
                    <i className="fa-solid fa-star"></i> {lang === 'AR' ? 'التقييمات' : 'My Reviews'}
                  </Link>
                  <Link to="/wishlist" onClick={() => setShowProfileMenu(false)}>
                    <i className="fa-solid fa-heart"></i> {lang === 'AR' ? 'خياراتي المفضلة' : 'Wish List'}
                  </Link>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-logout-btn" onClick={() => { setShowProfileMenu(false); handleLogout(); }}>
                    <i className="fa-solid fa-right-from-bracket"></i> {lang === 'AR' ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={() => handleOpenAuth('login')}>{lang === 'AR' ? 'دخول' : 'Login'}</button>
              <button className="btn-register" onClick={() => handleOpenAuth('register')}>{lang === 'AR' ? 'سجل معنا' : 'Register'}</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
