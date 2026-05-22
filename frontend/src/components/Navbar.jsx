import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, toggleChat } from '../store/authSlice';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';

const Navbar = ({ isScrolled }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);
  const { lang, toggleLanguage } = React.useContext(LanguageContext);

  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || !!localStorage.getItem('token'));

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
            <button className="btn-login" onClick={handleLogout}>{lang === 'AR' ? 'خروج' : 'Logout'}</button>
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
