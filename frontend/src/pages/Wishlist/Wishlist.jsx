import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getWishlist, removeFromWishlist } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import '../Experiences/Experiences.css'; // Reusing premium card designs
import './Wishlist.css';

const Wishlist = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('clearpath_access_token');
  const { lang, setLang } = useContext(LanguageContext);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const response = await getWishlist();
        // The backend returns an object like { message, wishlist: { user, experiences: [...] } }
        const items = response.wishlist?.experiences || response.data?.experiences || response.wishlist || response.data || [];
        setWishlistItems(Array.isArray(items) ? items : []);
      } catch (err) {
        setError('Failed to load wishlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, [token]);

  const handleRemove = async (experienceId) => {
    try {
      await removeFromWishlist(experienceId);
      setWishlistItems((prev) => prev.filter((item) => (item._id || item.id) !== experienceId));
    } catch (err) {
      setError('Failed to remove item.');
    }
  };

  const clearWishlist = async () => {
    for (const item of wishlistItems) {
      await handleRemove(item._id || item.id);
    }
  };

  return (
    <div className={`wishlist-container ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />

      <div className="page-header hero-banner wishlist-hero">
        <div className="header-content">
          <h1>
            {lang === 'AR' ? <>قائمتك <span className="egypt-flag-text">المفضلة</span></> : <>Your <span className="egypt-flag-text">Wishlist</span></>}
          </h1>
          <p>
            {lang === 'AR' 
              ? 'الرحلات السياحية وحزم اليوم الواحد المفضلة لديك — جاهزة متى شئت.' 
              : 'Saved trips and dayuse packages — ready when you are.'}
          </p>
        </div>
      </div>

      <main className="content wishlist-content">
        <div className="wishlist-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="wishlist-count">
            <span className="pill">
              <i className="fa-solid fa-heart" style={{ color: '#e61e4d' }}></i> 
              <span>{wishlistItems.length}</span> {lang === 'AR' ? 'محفوظة' : 'saved'}
            </span>
          </div>
          {wishlistItems.length > 0 && (
            <div className="wishlist-actions">
              <button type="button" className="btn-outline" onClick={clearWishlist} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="fa-regular fa-trash-can"></i> {lang === 'AR' ? 'مسح الكل' : 'Clear all'}
              </button>
            </div>
          )}
        </div>

        {!token ? (
          <div className="wishlist-empty">
            <div className="empty-card">
              <p>
                {lang === 'AR' ? 'يرجى ' : 'Please '}
                <button className="btn-pink-pill" onClick={() => navigate('/login')} style={{ padding: '6px 15px', borderRadius: '20px' }}>
                  {lang === 'AR' ? 'تسجيل الدخول' : 'log in'}
                </button>
                {lang === 'AR' ? ' لتتمكن من رؤية قائمتك المفضلة.' : ' to see your wishlist.'}
              </p>
            </div>
          </div>
        ) : loading ? (
          <p style={{ textAlign: 'center', margin: '40px' }}>{lang === 'AR' ? 'جاري تحميل قائمتك المفضلة...' : 'Loading wishlist...'}</p>
        ) : error ? (
          <p className="error" style={{ textAlign: 'center', color: '#e61e4d' }}>{error}</p>
        ) : wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-card">
              <div className="empty-icon"><i className="fa-regular fa-heart" style={{ color: '#e61e4d' }}></i></div>
              <h3>{lang === 'AR' ? 'لا توجد حزم محفوظة بعد' : 'No saved packages yet'}</h3>
              <p>
                {lang === 'AR' 
                  ? 'اذهب إلى الرحلات أو الداي يوز واضغط على رمز القلب لإضافة الحزم هنا.' 
                  : 'Go to Trips or Dayuse and tap the heart icon to add packages here.'}
              </p>
              <div className="empty-cta" style={{ marginTop: '20px' }}>
                <button className="btn-pink-pill" onClick={() => navigate('/experiences')} style={{ padding: '10px 24px', borderRadius: '30px' }}>
                  {lang === 'AR' ? 'استكشف التجارب' : 'Explore Experiences'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => {
              const isDayuse = item.duration_days === 1;
              const typeLabel = isDayuse 
                ? (lang === 'AR' ? 'داي يوز' : 'Dayuse')
                : (lang === 'AR' ? 'رحلة' : 'Trip');
              
              return (
                <div key={item._id || item.id} className="exp-card">
                  <div className={`exp-badge ${isDayuse ? 'dayuse' : 'trip'}`}>{typeLabel}</div>
                  <button 
                    className="exp-save" 
                    onClick={(e) => { e.stopPropagation(); handleRemove(item._id || item.id); }}
                    title={lang === 'AR' ? 'إزالة من المفضلة' : 'Remove from Wishlist'}
                    style={{ color: '#e61e4d', background: 'var(--bg-primary)', border: '1px solid #e61e4d', cursor: 'pointer' }}
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                  <div className="exp-image" onClick={() => navigate(`/package-details/${item._id || item.id}`)} style={{ cursor: 'pointer' }}>
                    <img src={item.images?.[0] || '/img/cairo_pyramids_1775971845389.png'} alt={item.name} />
                  </div>
                  <div className="exp-content">
                    <h3 className="exp-title" onClick={() => navigate(`/package-details/${item._id || item.id}`)} style={{ cursor: 'pointer' }}>
                      {item.name || 'Unknown Package'}
                    </h3>
                    <div className="exp-location" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <i className="fa-solid fa-location-dot"></i> 
                      {item.destination?.name || (lang === 'AR' ? 'وجهات متعددة' : 'Multiple Locations')}
                    </div>
                    <p className="exp-desc">{item.description || (lang === 'AR' ? 'حزمة سياحية مميزة تم اختيارها وتخزينها في مفضلتك الشخصية. جاهزة لك تماماً!' : 'A handpicked experience saved in your personal wishlist. Ready when you are!')}</p>
                    
                    <div className="exp-footer">
                      <div className="exp-price">
                        {item.base_price || 0} EGP <span>{lang === 'AR' ? '/ للفرد' : '/ person'}</span>
                      </div>
                      <button 
                        className="btn-remove-wishlist" 
                        onClick={(e) => { e.stopPropagation(); handleRemove(item._id || item.id); }}
                        style={{ 
                          padding: '8px 18px', 
                          fontSize: '14px', 
                          borderRadius: '20px', 
                          cursor: 'pointer', 
                          border: 'none', 
                          color: '#ffffff', 
                          background: '#e61e4d',
                          fontWeight: '700',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                        {lang === 'AR' ? 'إزالة' : 'Remove'}
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
