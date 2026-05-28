import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { addToWishlist, getTrips, getDestinations } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Trips.css';

// ── TripCard Component with Image Carousel ──
const TripCard = ({ trip, lang, wishlistIds, handleCardClick, handleWishlistToggle, destinations }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const images = Array.isArray(trip.images) && trip.images.length > 0
    ? trip.images
    : [trip.image || '/img/default-trip.jpg'];

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex(prev => (prev + 1) % images.length);
  };

  const id = trip._id || trip.id;

  return (
    <div className="exp-card" onClick={() => handleCardClick(id)}>
      <div className="exp-badge trip">
        {lang === 'AR' ? 'رحلة' : 'Trip'}
      </div>

      <div className="card-tags-overlay" style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {id.charCodeAt(0) % 2 === 0 && (
          <span style={{ background: 'rgba(34, 197, 94, 0.9)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
            <i className="fa-solid fa-fire"></i> {lang === 'AR' ? '#الأكثر_مبيعاً' : '#Best_Seller'}
          </span>
        )}
        {id.charCodeAt(id.length - 1) % 2 !== 0 && (
          <span style={{ background: 'rgba(59, 130, 246, 0.9)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
            <i className="fa-solid fa-child-reaching"></i> {lang === 'AR' ? '#عائلي' : '#Family_Friendly'}
          </span>
        )}
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
        <img src={images[currentImgIndex]} alt={trip.name || trip.title} className="carousel-img-slide" />
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
        <h3 className="exp-title">{trip.name || trip.title}</h3>
        <div className="exp-location" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <i className="fa-solid fa-location-dot"></i>
          {trip.destination?.name ||
            destinations.find(d => d._id === (trip.destination?._id || trip.destination))?.name ||
            (lang === 'AR' ? 'وجهات متعددة' : 'Multiple Locations')}
        </div>
        <p className="exp-desc">
          {trip.description ||
            (lang === 'AR'
              ? 'استمتع بجمال وتاريخ مصر العريق من خلال جولاتنا السياحية المصممة باحتراف.'
              : 'Experience the beauty and history of Egypt with our expertly guided tours.')}
        </p>

        <div className="exp-footer">
          <div className="exp-price">
            {trip.calculatedPrice || trip.base_price || trip.price || 0} EGP{' '}
            <span>{lang === 'AR' ? '/ للفرد' : '/ person'}</span>
          </div>
          <div className="exp-duration" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <i className="fa-regular fa-clock"></i>
            {trip.duration_days} {trip.duration_days === 1
              ? (lang === 'AR' ? 'يوم' : 'Day')
              : (lang === 'AR' ? 'أيام' : 'Days')}
          </div>
        </div>
      </div>
    </div>
  );
};

const Trips = () => {
  const { lang } = useContext(LanguageContext);
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
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
  const [selectedQuickFilter, setSelectedQuickFilter] = useState('');

  // Carousel refs per destination
  const carouselRefs = useRef({});
  const getCarouselRef = (destName) => {
    if (!carouselRefs.current[destName]) {
      carouselRefs.current[destName] = React.createRef();
    }
    return carouselRefs.current[destName];
  };
  const handleScroll = (ref, direction) => {
    if (ref.current) {
      const cardWidth = ref.current.querySelector('.exp-card')?.offsetWidth || 344;
      const scrollAmount = (cardWidth + 24) * 3;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
        const [tripsRes, destRes] = await Promise.all([getTrips({}), getDestinations()]);
        const tripsList = tripsRes?.data || tripsRes || [];
        // Filter to only multi-day trips (not dayuse)
        const filtered = Array.isArray(tripsList)
          ? tripsList.filter(t => !t.duration_days || t.duration_days > 1)
          : [];
        setTrips(filtered);

        const destList = destRes?.destinations || destRes?.data?.destinations || destRes?.data || destRes || [];
        setDestinations(Array.isArray(destList) ? destList : []);
      } catch (err) {
        console.error('Error loading trips:', err);
        setTrips([]);
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

  const displayed = trips.filter(trip => {
    if (selectedDestination) {
      const destId = trip.destination?._id || trip.destination?.id || trip.destination;
      if (destId !== selectedDestination) return false;
    }
    const price = trip.calculatedPrice || trip.base_price || trip.price || 0;
    if (price < minPrice || price > maxPrice) return false;
    
    if (selectedQuickFilter) {
      const text = ((trip.description || '') + ' ' + (trip.name || trip.title || '')).toLowerCase();
      const idCode = (trip._id || trip.id || '1').charCodeAt(0);
      
      if (selectedQuickFilter === 'relaxation' && !text.includes('relax') && !text.includes('beach') && idCode % 3 !== 0) return false;
      if (selectedQuickFilter === 'adventure' && !text.includes('adventur') && !text.includes('hike') && idCode % 3 !== 1) return false;
      if (selectedQuickFilter === 'cultural' && !text.includes('cultur') && !text.includes('histor') && idCode % 3 !== 2) return false;
    }
    
    return true;
  });

  return (
    <div className={`experiences-page ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} isScrolled={true} />

      <div className="experiences-header">
        <h1>
          {lang === 'AR'
            ? <>الرحلات <span className="egypt-flag-text">المصرية</span></>
            : <>Egyptian <span className="egypt-flag-text">Trips</span></>}
        </h1>
        <p style={{ marginBottom: '35px' }}>
          {lang === 'AR'
            ? 'من الأهرامات العظيمة إلى وادي الملوك الأثري، اكتشف كنوز مصر معنا.'
            : 'From the Great Pyramids to the Valley of the Kings, discover Egypt\'s timeless treasures.'}
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

        {/* Quick Filters */}
        <div className="quick-filters-container" style={{ display: 'flex', gap: '15px', justifyContent: 'center', margin: '20px auto 40px', maxWidth: '850px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', icon: 'fa-globe', labelAR: 'الكل', labelEN: 'All' },
            { id: 'relaxation', icon: 'fa-spa', labelAR: 'استرخاء', labelEN: 'Relaxation' },
            { id: 'adventure', icon: 'fa-person-hiking', labelAR: 'مغامرة', labelEN: 'Adventure' },
            { id: 'cultural', icon: 'fa-landmark', labelAR: 'ثقافي', labelEN: 'Cultural' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedQuickFilter(filter.id === 'all' ? '' : filter.id)}
              style={{
                background: selectedQuickFilter === filter.id || (!selectedQuickFilter && filter.id === 'all') ? 'linear-gradient(135deg, #d4af37, #f3e5ab)' : 'rgba(255,255,255,0.05)',
                color: selectedQuickFilter === filter.id || (!selectedQuickFilter && filter.id === 'all') ? '#000' : '#fff',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '30px',
                padding: '10px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
                boxShadow: selectedQuickFilter === filter.id || (!selectedQuickFilter && filter.id === 'all') ? '0 4px 15px rgba(212,175,55,0.4)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              <i className={`fa-solid ${filter.icon}`}></i>
              {lang === 'AR' ? filter.labelAR : filter.labelEN}
            </button>
          ))}
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
          // ── No filter active → show destination sections ──
          !selectedDestination && minPrice === 0 && maxPrice === 25000 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
              {/* Group by destination */}
              {destinations
                .filter(dest => displayed.some(t => {
                  const dId = t.destination?._id || t.destination?.id || t.destination;
                  return dId === (dest._id || dest.id);
                }))
                .map(dest => {
                  const destId = dest._id || dest.id;
                  const destTrips = displayed.filter(t => {
                    const dId = t.destination?._id || t.destination?.id || t.destination;
                    return dId === destId;
                  });
                  if (destTrips.length === 0) return null;
                  const ref = getCarouselRef(dest.name);
                  const label = lang === 'AR' ? `رحلات ${dest.name}` : `GO TO ${dest.name.toUpperCase()}`;
                  return (
                    <div key={destId} className="airbnb-dest-section">
                      <h2 className="dest-section-title">
                        <span>{label}</span>
                        {destTrips.length > 3 && (
                          <div className="carousel-arrows-container">
                            <button onClick={() => handleScroll(ref, 'left')} className="carousel-arrow-btn">
                              <i className="fa-solid fa-chevron-left" style={{ fontSize: '0.8rem' }}></i>
                            </button>
                            <button onClick={() => handleScroll(ref, 'right')} className="carousel-arrow-btn">
                              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.8rem' }}></i>
                            </button>
                          </div>
                        )}
                      </h2>
                      {/* eslint-disable-next-line react-hooks/refs */}
                      <div className="airbnb-carousel" ref={ref}>
                        {destTrips.map(trip => (
                          <TripCard
                            key={trip._id || trip.id}
                            trip={trip}
                            lang={lang}
                            wishlistIds={wishlistIds}
                            handleCardClick={handleCardClick}
                            handleWishlistToggle={handleWishlistToggle}
                            destinations={destinations}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            // ── Filter active → flat grid ──
            <div className="experiences-grid">
              {displayed.map(trip => (
                <TripCard
                  key={trip._id || trip.id}
                  trip={trip}
                  lang={lang}
                  wishlistIds={wishlistIds}
                  handleCardClick={handleCardClick}
                  handleWishlistToggle={handleWishlistToggle}
                  destinations={destinations}
                />
              ))}
            </div>
          )
        ) : (
          <div className="empty-state">
            <i className="fa-solid fa-box-open"></i>
            <h3>{lang === 'AR' ? 'لا توجد رحلات متاحة حالياً' : 'No Trips Found'}</h3>
            <p>
              {lang === 'AR'
                ? 'لم نتمكن من العثور على أي رحلات متاحة. يرجى مراجعة الموقع لاحقاً!'
                : 'We couldn\'t find any trips right now. Please check back later!'}
            </p>
          </div>
        )}
      </div>

      <Footer isHome={false} />
    </div>
  );
};

export default Trips;
