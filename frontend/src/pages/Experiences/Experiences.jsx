import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { addToWishlist, getTrips, getDestinations } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Experiences.css';

const Experiences = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  
  // Airbnb-style Search States
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedDestName, setSelectedDestName] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);

  const { lang, setLang } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    // Ensure body overflow is auto so user can scroll
    document.body.style.overflow = 'auto';

    // Click outside listener to close dropdowns
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-item')) {
        setShowDestDropdown(false);
        setShowPriceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchExperiences();
    fetchDestinationsData();
  }, []); // Fetch all experiences once on mount

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
      // Fetch all packages/experiences in one request
      const data = await getTrips({});
      if (data && data.data) {
        setExperiences(data.data);
      } else {
        setExperiences([]);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error.message);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/package-details/${id}`);
  };

  const handleWishlistToggle = async (e, id) => {
    e.stopPropagation(); // Prevent opening the package details
    
    // Optimistic UI update
    setWishlistIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    try {
      await addToWishlist(id);
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
    }
  };

  const displayedExperiences = experiences.filter((exp) => {
    // 1. Tab type filter
    if (activeTab === 'dayuse' && exp.duration_days !== 1) return false;
    if (activeTab === 'trip' && exp.duration_days <= 1) return false;
    
    // 2. Destination filter
    if (selectedDestination) {
      const expDestId = exp.destination?._id || exp.destination?.id || exp.destination;
      if (expDestId !== selectedDestination) return false;
    }
    
    // 3. Price filter
    const price = exp.calculatedPrice || exp.base_price || 0;
    if (price < minPrice || price > maxPrice) return false;
    
    return true;
  });

  return (
    <div className={`experiences-page ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} isScrolled={true} />

      <div className="experiences-header">
        <h1>
          {lang === 'AR' ? <>اكتشف <span>مصر</span></> : <>Discover <span className="egypt-flag-text">Egypt</span></>}
        </h1>
        <p style={{ marginBottom: '35px' }}>
          {lang === 'AR' 
            ? 'من عجائب الفراعنة القديمة إلى أيام الاسترخاء والراحة على ساحل البحر الأحمر، اعثر على تجربتك المصرية المثالية معنا.' 
            : 'From the ancient wonders of the pharaohs to relaxing days on the Red Sea coast, find your perfect Egyptian experience.'}
        </p>

        {/* 🔍 Airbnb-Style Floating Search Bar */}
        <div className="airbnb-search-bar-container">
          <div className="search-filter-bar">
            {/* Destination Selection Section */}
            <div className="search-item" onClick={() => { setShowDestDropdown(!showDestDropdown); setShowPriceDropdown(false); }}>
              <div className="search-item-icon"><i className="fa-solid fa-location-dot"></i></div>
              <div className="search-item-text">
                <span className="search-label">{lang === 'AR' ? 'الوجهة' : 'Where'}</span>
                <span className="search-val">{selectedDestName || (lang === 'AR' ? 'ابحث عن وجهة' : 'Search destinations')}</span>
              </div>
              {showDestDropdown && (
                <div className="search-dropdown destination-dropdown" onClick={(e) => e.stopPropagation()}>
                  <div className="dropdown-item-header">
                    {lang === 'AR' ? 'الوجهات المتاحة لدينا' : 'Our Available Destinations'}
                  </div>
                  <div className="dropdown-item" onClick={() => { setSelectedDestination(''); setSelectedDestName(''); setShowDestDropdown(false); }}>
                    <i className="fa-solid fa-globe"></i> {lang === 'AR' ? 'كل الوجهات في مصر' : 'All Destinations in Egypt'}
                  </div>
                  {destinations.map(d => (
                    <div key={d._id || d.id} className="dropdown-item" onClick={() => { setSelectedDestination(d._id || d.id); setSelectedDestName(d.name); setShowDestDropdown(false); }}>
                      <i className="fa-solid fa-map-pin"></i> {d.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="search-divider"></div>

            {/* Price Selection Section */}
            <div className="search-item" onClick={() => { setShowPriceDropdown(!showPriceDropdown); setShowDestDropdown(false); }}>
              <div className="search-item-icon"><i className="fa-solid fa-money-bill-wave"></i></div>
              <div className="search-item-text">
                <span className="search-label">{lang === 'AR' ? 'الميزانية' : 'Price'}</span>
                <span className="search-val">
                  {maxPrice === 25000 && minPrice === 0 
                    ? (lang === 'AR' ? 'أي سعر متاح' : 'Any price range') 
                    : `${minPrice} - ${maxPrice} EGP`}
                </span>
              </div>
              {showPriceDropdown && (
                <div className="search-dropdown price-dropdown" onClick={(e) => e.stopPropagation()}>
                  <h4>{lang === 'AR' ? 'نطاق السعر المقدر' : 'Estimated Price Range'}</h4>
                  
                  <div className="price-inputs-container">
                    <div className="price-input-box">
                      <span className="price-input-label">{lang === 'AR' ? 'الحد الأدنى' : 'Min'}</span>
                      <div className="price-input-wrapper">
                        <input 
                          type="number" 
                          value={minPrice} 
                          onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        />
                        <span className="currency-unit">EGP</span>
                      </div>
                    </div>
                    <div className="price-input-divider">-</div>
                    <div className="price-input-box">
                      <span className="price-input-label">{lang === 'AR' ? 'الحد الأقصى' : 'Max'}</span>
                      <div className="price-input-wrapper">
                        <input 
                          type="number" 
                          value={maxPrice} 
                          onChange={(e) => setMaxPrice(Math.max(0, parseInt(e.target.value) || 25000))}
                        />
                        <span className="currency-unit">EGP</span>
                      </div>
                    </div>
                  </div>

                  <input 
                    type="range" 
                    min="0" 
                    max="25000" 
                    step="500"
                    value={maxPrice}
                    className="price-range-slider"
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  />
                  <div className="price-range-labels">
                    <span>0 EGP</span>
                    <span>12.5k EGP</span>
                    <span>25k+ EGP</span>
                  </div>

                  <div className="price-dropdown-footer">
                    <button className="price-clear-btn" onClick={() => { setMinPrice(0); setMaxPrice(25000); setShowPriceDropdown(false); }}>
                      {lang === 'AR' ? 'إعادة ضبط' : 'Reset'}
                    </button>
                    <button className="price-apply-btn" onClick={() => setShowPriceDropdown(false)}>
                      {lang === 'AR' ? 'تطبيق الفلتر' : 'Apply Filter'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Circular Search Icon Button */}
            <button className="search-action-btn" onClick={() => { setShowDestDropdown(false); setShowPriceDropdown(false); }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        
        <div className="experiences-tabs" style={{ marginTop: '25px' }}>
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {lang === 'AR' ? 'كل التجارب' : 'All Experiences'}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trip' ? 'active' : ''}`}
            onClick={() => setActiveTab('trip')}
          >
            {lang === 'AR' ? 'الرحلات السياحية' : 'Trips'}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'dayuse' ? 'active' : ''}`}
            onClick={() => setActiveTab('dayuse')}
          >
            {lang === 'AR' ? 'داي يوز استجمام' : 'Dayuse'}
          </button>
        </div>
      </div>

      <div className="experiences-container">
        {loading ? (
          <div className="loading-state">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <h2>{lang === 'AR' ? 'جاري تحميل التجارب المتاحة...' : 'Loading experiences...'}</h2>
          </div>
        ) : displayedExperiences.length > 0 ? (
          <div className="experiences-grid">
            {displayedExperiences.map((exp) => {
              const isDayuse = exp.duration_days === 1;
              const typeLabel = isDayuse 
                ? (lang === 'AR' ? 'داي يوز' : 'Dayuse')
                : (lang === 'AR' ? 'رحلة' : 'Trip');
              
              return (
                <div key={exp._id} className="exp-card" onClick={() => handleCardClick(exp._id)}>
                  <div className={`exp-badge ${isDayuse ? 'dayuse' : 'trip'}`}>
                    {typeLabel}
                  </div>
                  
                  <button 
                    className={`wishlist-btn ${wishlistIds.has(exp._id) ? 'active' : ''}`}
                    onClick={(e) => handleWishlistToggle(e, exp._id)}
                    title={lang === 'AR' ? 'إضافة إلى المفضلة' : 'Add to Wishlist'}
                  >
                    <i className={`${wishlistIds.has(exp._id) ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                  </button>
 
                  <div className="exp-image">
                    <img src={exp.images?.[0] || "/img/cairo_pyramids_1775971845389.png"} alt={exp.name} />
                  </div>
                  <div className="exp-content">
                    <h3 className="exp-title">{exp.name}</h3>
                    <div className="exp-location" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <i className="fa-solid fa-location-dot"></i> 
                      {exp.destination?.name || (lang === 'AR' ? 'وجهات متعددة' : 'Multiple Locations')}
                    </div>
                    <p className="exp-desc">{exp.description || (lang === 'AR' ? 'استمتع بجمال وتاريخ مصر العريق من خلال جولاتنا السياحية المصممة باحتراف.' : 'Experience the beauty and history of Egypt with our expertly guided tours.')}</p>
                    
                    <div className="exp-footer">
                      <div className="exp-price">
                        {exp.calculatedPrice || exp.base_price || 0} EGP <span>{lang === 'AR' ? '/ للفرد' : '/ person'}</span>
                      </div>
                      <div className="exp-duration" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <i className="fa-regular fa-clock"></i> 
                        {exp.duration_days} {exp.duration_days === 1 ? (lang === 'AR' ? 'يوم' : 'Day') : (lang === 'AR' ? 'أيام' : 'Days')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fa-solid fa-box-open"></i>
            <h3>{lang === 'AR' ? 'لا توجد تجارب متاحة حالياً' : 'No Experiences Found'}</h3>
            <p>
              {lang === 'AR' 
                ? `لم نتمكن من العثور على أي تجارب ${activeTab !== 'all' ? (activeTab === 'trip' ? 'رحلات' : 'داي يوز') : ''} حالياً. يرجى مراجعة الموقع لاحقاً!` 
                : `We couldn't find any ${activeTab !== 'all' ? activeTab : ''} experiences right now. Please check back later!`}
            </p>
          </div>
        )}
      </div>

      <Footer isHome={false} />
    </div>
  );
};

export default Experiences;
