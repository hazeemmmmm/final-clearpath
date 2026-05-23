import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { addToWishlist, getTrips } from '../../utils/api';
import './Experiences.css';

const Experiences = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('EN');
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    // Ensure body overflow is auto so user can scroll
    document.body.style.overflow = 'auto';
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, []); // Fetch all experiences once on mount

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
        // Note: You would call removeFromWishlist(id) here if you want toggle functionality
      } else {
        newSet.add(id);
      }
      return newSet;
    });

    try {
      await addToWishlist(id);
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      // Revert on failure (or show toast: Please login)
    }
  };

  const displayedExperiences = experiences.filter((exp) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'dayuse') return exp.duration_days === 1;
    if (activeTab === 'trip') return exp.duration_days > 1;
    return true;
  });

  return (
    <div className="experiences-page">
      <Navbar lang={lang} setLang={setLang} isScrolled={true} />

      <div className="experiences-header">
        <h1><span style={{ color: '#fff' }}>Discover</span> <span className="egypt-flag-text">Egypt</span></h1>
        <p>From the ancient wonders of the pharaohs to relaxing days on the Red Sea coast, find your perfect Egyptian experience.</p>
        
        <div className="experiences-tabs">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Experiences
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trip' ? 'active' : ''}`}
            onClick={() => setActiveTab('trip')}
          >
            Trips
          </button>
          <button 
            className={`tab-btn ${activeTab === 'dayuse' ? 'active' : ''}`}
            onClick={() => setActiveTab('dayuse')}
          >
            Dayuse
          </button>
        </div>
      </div>

      <div className="experiences-container">
        {loading ? (
          <div className="loading-state">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <h2>Loading experiences...</h2>
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
                    title="Add to Wishlist"
                  >
                    <i className={`${wishlistIds.has(exp._id) ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                  </button>

                  <div className="exp-image">
                    <img src={exp.images?.[0] || "/img/cairo_pyramids_1775971845389.png"} alt={exp.name} />
                  </div>
                  <div className="exp-content">
                    <h3 className="exp-title">{exp.name}</h3>
                    <div className="exp-location">
                      <i className="fa-solid fa-location-dot"></i> 
                      {exp.destination?.name || 'Multiple Locations'}
                    </div>
                    <p className="exp-desc">{exp.description || 'Experience the beauty and history of Egypt with our expertly guided tours.'}</p>
                    
                    <div className="exp-footer">
                      <div className="exp-price">
                        ${exp.calculatedPrice || exp.base_price || 0} <span>/ person</span>
                      </div>
                      <div className="exp-duration">
                        <i className="fa-regular fa-clock"></i> 
                        {exp.duration_days} {exp.duration_days === 1 ? 'Day' : 'Days'}
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
            <h3>No Experiences Found</h3>
            <p>We couldn't find any {activeTab !== 'all' ? activeTab : ''} experiences right now. Please check back later!</p>
          </div>
        )}
      </div>

      <Footer isHome={false} />
    </div>
  );
};

export default Experiences;
