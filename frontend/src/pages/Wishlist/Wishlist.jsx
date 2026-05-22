import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getWishlist, removeFromWishlist } from '../../utils/api';
import '../Experiences/Experiences.css'; // Reusing premium card designs
import './Wishlist.css';

const Wishlist = () => {
  const [lang, setLang] = useState('EN');
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token);

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
          <h1>Your <span className="egypt-flag-text">Wishlist</span></h1>
          <p>Saved trips and dayuse packages — ready when you are.</p>
        </div>
      </div>

      <main className="content wishlist-content">
        <div className="wishlist-toolbar">
          <div className="wishlist-count">
            <span className="pill"><i className="fa-solid fa-heart"></i> <span>{wishlistItems.length}</span> saved</span>
          </div>
          <div className="wishlist-actions">
            <button type="button" className="btn-outline" onClick={clearWishlist}>
              <i className="fa-regular fa-trash-can"></i> Clear all
            </button>
          </div>
        </div>

        {!token ? (
          <div className="wishlist-empty">
            <div className="empty-card">
              <p>Please <button className="btn-pink-pill" onClick={() => navigate('/login')}>log in</button> to see your wishlist.</p>
            </div>
          </div>
        ) : loading ? (
          <p>Loading wishlist...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="empty-card">
              <div className="empty-icon"><i className="fa-regular fa-heart"></i></div>
              <h3>No saved packages yet</h3>
              <p>Go to Trips or Dayuse and tap <strong>Save</strong> to add packages here.</p>
              <div className="empty-cta">
                <button className="btn-pink-pill" onClick={() => navigate('/experiences')}>Explore Experiences</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item._id || item.id} className="exp-card">
                <div className="exp-badge">{item.type || 'trip'}</div>
                <button 
                  className="exp-save" 
                  onClick={(e) => { e.stopPropagation(); handleRemove(item._id || item.id); }}
                  title="Remove from Wishlist"
                  style={{ color: '#e61e4d', background: 'var(--bg-primary)', border: '1px solid #e61e4d' }}
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
                  <div className="exp-location">
                    <i className="fa-solid fa-location-dot"></i> 
                    {item.destination?.name || 'Multiple Locations'}
                  </div>
                  <p className="exp-desc">{item.description || 'A handpicked experience saved in your personal wishlist. Ready when you are!'}</p>
                  
                  <div className="exp-footer">
                    <div className="exp-price">
                      ${item.base_price || 0} <span>/ person</span>
                    </div>
                    <button 
                      className="btn-pink-pill" 
                      onClick={() => navigate(`/package-details/${item._id || item.id}`)}
                      style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '20px' }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
