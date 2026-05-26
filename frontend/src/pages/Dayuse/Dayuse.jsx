import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { addToWishlist, getDayuse, getDestinations } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Dayuse.css';

// ── DayuseCard Component with Image Carousel ──
const DayuseCard = ({ item, lang, wishlistIds, handleCardClick, handleWishlistToggle, destinations }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [item.image || '/img/dayuse-default.jpg'];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev + 1) % images.length);
  };

  const id = item._id || item.id;

  return (
    <div className="exp-card" onClick={() => handleCardClick(id)}>
      <div className="exp-badge dayuse">
        {lang === 'AR' ? 'داي يوز' : 'Dayuse'}
      </div>

      <button
        className={`wishlist-btn ${wishlistIds.has(id) ? 'active' : ''}`}
        onClick={(e) => handleWishlistToggle(e, id)}
        title={lang === 'AR' ? 'إضافة إلى المفضلة' : 'Add to Wishlist'}
        type="button"
      >
        <i className={`${wishlistIds.has(id) ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
      </button>

      <div className="exp-image">
        <img src={images[currentImgIndex]} alt={item.name || item.title} className="carousel-img-slide" />
        {images.length > 1 && (
          <>
            <button className="carousel-nav-btn prev" onClick={handlePrevImage}>
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="carousel-nav-btn next" onClick={handleNextImage}>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
            <div className="carousel-indicators">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`indicator-dot ${idx === currentImgIndex ? 'active' : ''}`}
                ></span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="exp-content">
        <h3 className="exp-title">{item.name || item.title}</h3>
        <div className="exp-location" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <i className="fa-solid fa-location-dot"></i>
          {item.destination?.name ||
            destinations.find(d => d._id === (item.destination?._id || item.destination))?.name ||
            (lang === 'AR' ? 'وجهات متعددة' : 'Multiple Locations')}
        </div>
        <p className="exp-desc">
          {item.description ||
            (lang === 'AR'
              ? 'استمتع بيوم استجمام مثالي في أفخم المنتجعات والمسابح المصرية.'
              : 'Enjoy a perfect relaxation day at Egypt\'s finest resorts and pools.')}
        </p>

        <div className="exp-footer">
          <div className="exp-price">
            {item.calculatedPrice || item.base_price || item.price || 0} EGP{' '}
            <span>{lang === 'AR' ? '/ للفرد' : '/ person'}</span>
          </div>
          <div className="exp-duration" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <i className="fa-regular fa-clock"></i>
            {lang === 'AR' ? 'يوم واحد' : '1 Day'}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dayuse = () => {
  const { lang } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [dayuses, setDayuses] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedDestName, setSelectedDestName] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(25000);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'auto';

    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-item')) {
        setShowDestDropdown(false);
        setShowPriceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    const handleScrollEvent = () => {
      setIsSticky(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScrollEvent);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dayRes, destRes] = await Promise.all([getDayuse(), getDestinations()]);
        const list = dayRes?.data || dayRes || [];
        setDayuses(Array.isArray(list) ? list : []);

        const destList = destRes?.destinations || destRes?.data?.destinations || destRes?.data || destRes || [];
        setDestinations(Array.isArray(destList) ? destList : []);
      } catch (err) {
        console.error('Error loading dayuse:', err);
        setDayuses([]);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchAll();
  }, []);

  const handleCardClick = (id) => navigate(`/package-details/${id}`);

  const handleWishlistToggle = async (e, id) => {
    e.stopPropagation();
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    try { await addToWishlist(id); } catch (err) { console.error(err); }
  };

  const displayed = dayuses.filter(item => {
    if (selectedDestination) {
      const destId = item.destination?._id || item.destination?.id || item.destination;
      if (destId !== selectedDestination) return false;
    }
    const price = item.calculatedPrice || item.base_price || item.price || 0;
    if (price < minPrice || price > maxPrice) return false;
    return true;
  });

  return (
    <div className={`experiences-page ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} isScrolled={true} />

      <div className="experiences-header">
        <h1>
          {lang === 'AR'
            ? <><span>داي يوز</span> <span className="egypt-flag-text">استجمام</span></>
            : <>Egyptian <span className="egypt-flag-text">Dayuse</span></>}
        </h1>
        <p style={{ marginBottom: '35px' }}>
          {lang === 'AR'
            ? 'مسابح مريحة، شواطئ خلابة، وهروب مثالي من ضغوط الحياة في أفخم المنتجعات المصرية.'
            : 'Relaxing pools, beautiful beaches, and luxurious escapes at Egypt\'s finest resorts.'}
        </p>

        {/* Airbnb-Style Search Bar */}
        <div className={`airbnb-search-bar-container ${isSticky ? 'sticky' : ''}`}>
          <div className="search-filter-bar">
            {/* Destination */}
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

            {/* Price */}
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
                        <input type="number" value={minPrice} onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))} />
                        <span className="currency-unit">EGP</span>
                      </div>
                    </div>
                    <div className="price-input-divider">-</div>
                    <div className="price-input-box">
                      <span className="price-input-label">{lang === 'AR' ? 'الحد الأقصى' : 'Max'}</span>
                      <div className="price-input-wrapper">
                        <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Math.max(0, parseInt(e.target.value) || 25000))} />
                        <span className="currency-unit">EGP</span>
                      </div>
                    </div>
                  </div>
                  <input type="range" min="0" max="25000" step="500" value={maxPrice} className="price-range-slider" onChange={(e) => setMaxPrice(parseInt(e.target.value))} />
                  <div className="price-range-labels">
                    <span>0 EGP</span><span>12.5k EGP</span><span>25k+ EGP</span>
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

            <button className="search-action-btn" onClick={() => { setShowDestDropdown(false); setShowPriceDropdown(false); }}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="experiences-container">
        {loading ? (
          <div className="experiences-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-desc"></div>
                <div className="skeleton-footer">
                  <div className="skeleton-btn"></div>
                  <div className="skeleton-btn"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <div className="experiences-grid">
            {displayed.map(item => (
              <DayuseCard
                key={item._id || item.id}
                item={item}
                lang={lang}
                wishlistIds={wishlistIds}
                handleCardClick={handleCardClick}
                handleWishlistToggle={handleWishlistToggle}
                destinations={destinations}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fa-solid fa-box-open"></i>
            <h3>{lang === 'AR' ? 'لا توجد عروض داي يوز متاحة حالياً' : 'No Dayuse Packages Found'}</h3>
            <p>
              {lang === 'AR'
                ? 'لم نتمكن من العثور على أي عروض داي يوز متاحة. يرجى مراجعة الموقع لاحقاً!'
                : 'We couldn\'t find any dayuse packages right now. Please check back later!'}
            </p>
          </div>
        )}
      </div>

      <Footer isHome={false} />
    </div>
  );
};

export default Dayuse;
