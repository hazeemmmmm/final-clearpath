import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getTrips } from '../../utils/api';
import './Trips.css';

const Trips = () => {
  const [lang, setLang] = useState('EN');
  const [isScrolled, setIsScrolled] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />

      <div className="page-header hero-banner">
        <div className="header-content">
            <h1>Egyptian <span className="egypt-flag-text">Trips</span></h1>
            <p>From the Great Pyramids to the Valley of the Kings</p>
        </div>
      </div>

      <main className="content">
        <div className="toolbar">
            <div className="filter-group">
                <button type="button" className="btn-outline active">All Trips</button>
                <button type="button" className="btn-outline">Historical</button>
                <button type="button" className="btn-outline">Adventure</button>
            </div>
        </div>

        <div className="packages-grid">
            {loading ? (
              <p>Loading packages from the API...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : trips.length > 0 ? (
              trips.map((trip) => (
                <div key={trip.id || trip._id} className="card card--link" onClick={() => navigate(`/package-details/${trip.id || trip._id}`)}>
                    <div className="img-box" onClick={(e) => handleImageClick(e, trip)}>
                        <img src={trip.image || '/img/default-trip.jpg'} alt={trip.title} />
                    </div>
                    <div className="info">
                        <h4>{trip.title}</h4>
                        <p>{trip.price} EGP / person</p>
                    </div>
                </div>
              ))
            ) : (
              <p>No trips available at the moment.</p>
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
