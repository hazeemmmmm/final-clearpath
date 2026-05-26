import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getTrips, getAllUsersAdmin } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Trips.css';

const Trips = () => {
  const { lang } = useContext(LanguageContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usersMap, setUsersMap] = useState({});

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (e, trip) => {
      e.stopPropagation(); // prevent card click (navigation)
      const query = encodeURIComponent(trip.title || 'Egypt');
      // Create an array of 10 images from pollinations API using the title as prompt
      const baseSeed = trip.id ? String(trip.id).charCodeAt(0) : Math.floor(Math.random() * 100);
      const images = Array.from({ length: 10 }).map((_, i) => 
          `https://image.pollinations.ai/prompt/${query}%20tourism%20landmark%20beautiful%20photography?width=800&height=600&nologo=true&seed=${baseSeed + i * 15}`
      );
      setGalleryImages(images);
      setCurrentImageIndex(0);
      setIsGalleryOpen(true);
  };
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await getTrips();
        setTrips(response.data);
        // try to fetch users map to resolve supervisor ids
        try {
          const usersRes = await getAllUsersAdmin();
          const usersList = usersRes.data || usersRes.users || usersRes;
          const map = {};
          if (Array.isArray(usersList)) usersList.forEach(u => { if (u && u._id) map[u._id] = u; });
          setUsersMap(map);
        } catch (uerr) {
          // ignore users fetch errors — supervisor may already be populated
          console.debug('Could not fetch users list for supervisor lookup', uerr);
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
        setError('Failed to load trips. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  return (
    <div className={`trips-container ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} isScrolled={isScrolled} />

      <div className="page-header hero-banner">
        <div className="header-content">
            <h1>{lang === 'AR' ? <>الرحلات <span className="egypt-flag-text">المصرية</span></> : <>Egyptian <span className="egypt-flag-text">Trips</span></>}</h1>
            <p>{lang === 'AR' ? 'من الأهرامات العظيمة إلى وادي الملوك الأثري' : 'From the Great Pyramids to the Valley of the Kings'}</p>
        </div>
      </div>

      <main className="content">
        <div className="toolbar">
            <div className="filter-group">
                <button type="button" className="btn-outline active">{lang === 'AR' ? 'كل الرحلات' : 'All Trips'}</button>
                <button type="button" className="btn-outline">{lang === 'AR' ? 'تاريخية' : 'Historical'}</button>
                <button type="button" className="btn-outline">{lang === 'AR' ? 'مغامرات' : 'Adventure'}</button>
            </div>
        </div>

        <div className="packages-grid">
            {loading ? (
              <p>{lang === 'AR' ? 'جاري تحميل الباقات السياحية من الخادم...' : 'Loading packages from the API...'}</p>
            ) : error ? (
              <p className="error">{lang === 'AR' ? 'فشل تحميل الباقات. يرجى المحاولة لاحقاً.' : error}</p>
            ) : trips.length > 0 ? (
              trips.map((trip) => (
                <div key={trip.id || trip._id} className="card card--link" onClick={() => navigate(`/package-details/${trip.id || trip._id}`)}>
                    <div className="img-box" onClick={(e) => handleImageClick(e, trip)}>
                        <img src={trip.image || trip.images?.[0] || '/img/default-trip.jpg'} alt={trip.title || trip.name} />
                    </div>
                    <div className="info">
                        <h4>{trip.title || trip.name}</h4>
                        {(() => {
                          const sup = trip.supervisor || trip.supervisior || null;
                          let name = '';
                          if (sup) {
                            if (typeof sup === 'object') name = `${sup.firstName || ''} ${sup.lastName || ''}`.trim();
                            else name = (usersMap[sup] && `${usersMap[sup].firstName || ''} ${usersMap[sup].lastName || ''}`.trim()) || String(sup);
                          }
                          return name ? (
                            <div className="supervisor-badge small">
                              <span className="supervisor-avatar">{(name||'U').charAt(0).toUpperCase()}</span>
                              <span className="supervisor-name">{name}</span>
                            </div>
                          ) : null;
                        })()}
                        <p>{trip.price || trip.base_price || 0} EGP {lang === 'AR' ? '/ للفرد' : '/ person'}</p>
                    </div>
                </div>
              ))
            ) : (
              <p>{lang === 'AR' ? 'لا توجد رحلات متاحة في الوقت الحالي.' : 'No trips available at the moment.'}</p>
            )}
        </div>
      </main>

      {isGalleryOpen && (
          <div className="gallery-modal" onClick={() => setIsGalleryOpen(false)}>
              <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
                  <button className="gallery-close" onClick={() => setIsGalleryOpen(false)}>&times;</button>
                  <div className="gallery-image-container">
                      <img src={galleryImages[currentImageIndex]} alt="Gallery View" />
                      <button className="gallery-prev" onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1))}>&#10094;</button>
                      <button className="gallery-next" onClick={() => setCurrentImageIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0))}>&#10095;</button>
                  </div>
                  <div className="gallery-thumbnails">
                      {galleryImages.map((img, idx) => (
                          <img 
                              key={idx} 
                              src={img} 
                              alt={`Thumbnail ${idx}`} 
                              className={idx === currentImageIndex ? 'active' : ''}
                              onClick={() => setCurrentImageIndex(idx)}
                          />
                      ))}
                  </div>
              </div>
          </div>
      )}

      <Footer />
    </div>
  );
};

export default Trips;
