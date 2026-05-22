import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getUserProfile, getMyReviews, deleteReview } from '../../utils/api';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tabs and Reviews State
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'reviews'
  const [myReviews, setMyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('token') || localStorage.getItem('clearpath_access_token');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }
      try {
        const response = await getUserProfile();
        setProfile(response.user || response.data?.user || response.data || response);
        
        // Quietly fetch reviews count
        const reviewsRes = await getMyReviews();
        const reviewsList = reviewsRes.reviews || reviewsRes.data?.reviews || reviewsRes.data || reviewsRes || [];
        setMyReviews(reviewsList);
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const reviewsRes = await getMyReviews();
      const reviewsList = reviewsRes.reviews || reviewsRes.data?.reviews || reviewsRes.data || reviewsRes || [];
      setMyReviews(reviewsList);
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      try {
        await deleteReview(reviewId);
        setMyReviews(prev => prev.filter(r => r._id !== reviewId));
      } catch (err) {
        alert(err.message || 'Failed to delete review');
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`${i <= rating ? 'fa-solid' : 'fa-regular'} fa-star`}
          style={{ color: i <= rating ? '#FFD700' : '#ddd', marginRight: '3px' }}
        />
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  return (
    <div className="profile-page">
      <Navbar />
      
      <main className="profile-main-container">
        {loading ? (
          <div className="loading-spinner">
            <i className="fa-solid fa-spinner fa-spin"></i> Loading profile...
          </div>
        ) : error ? (
          <div className="error-card">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{error}</p>
            <Link to="/login" className="btn-back">Log In Now</Link>
          </div>
        ) : (
          <div className="profile-layout-grid">
            
            {/* Left Column: Sidebar / Profile Summary */}
            <aside className="profile-summary-sidebar">
              <div className="avatar-large">
                {profile?.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3>{profile?.firstName} {profile?.lastName}</h3>
              <p className="user-email"><i className="fa-regular fa-envelope"></i> {profile?.email}</p>
              
              {profile?.role && (
                <span className={`role-badge ${profile.role.toLowerCase()}`}>
                  {profile.role.toUpperCase()}
                </span>
              )}

              <hr className="sidebar-divider" />
              
              <div className="profile-menu-navigation">
                <button 
                  className={`menu-nav-btn ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <i className="fa-solid fa-address-card"></i> Personal Info
                </button>
                <button 
                  className={`menu-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => { setActiveTab('reviews'); fetchReviews(); }}
                >
                  <i className="fa-solid fa-comment-dots"></i> My Reviews <span className="count-bubble">{myReviews.length}</span>
                </button>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="menu-nav-btn admin-link">
                    <i className="fa-solid fa-user-shield"></i> Admin Dashboard
                  </Link>
                )}
              </div>
            </aside>

            {/* Right Column: Tab Content */}
            <section className="profile-tab-content">
              
              {/* Tab 1: Personal Info */}
              {activeTab === 'info' && (
                <div className="tab-card info-tab">
                  <h2>Personal Information</h2>
                  <p className="tab-subtitle">Manage your personal details and account configurations.</p>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <label>First Name</label>
                      <div className="value-box">{profile?.firstName || '—'}</div>
                    </div>
                    <div className="info-item">
                      <label>Last Name</label>
                      <div className="value-box">{profile?.lastName || '—'}</div>
                    </div>
                    <div className="info-item">
                      <label>Email Address</label>
                      <div className="value-box">{profile?.email || '—'}</div>
                    </div>
                    <div className="info-item">
                      <label>Phone Number</label>
                      <div className="value-box">{profile?.phoneNumber || '—'}</div>
                    </div>
                    <div className="info-item">
                      <label>Gender</label>
                      <div className="value-box">{profile?.gender || '—'}</div>
                    </div>
                    <div className="info-item">
                      <label>Nationality</label>
                      <div className="value-box">{profile?.nationality || '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Reviews Management */}
              {activeTab === 'reviews' && (
                <div className="tab-card reviews-tab">
                  <h2>My Submitted Reviews</h2>
                  <p className="tab-subtitle">All opinions, feedback, and reviews you have posted on packages.</p>

                  {loadingReviews ? (
                    <div className="loading-reviews">
                      <i className="fa-solid fa-spinner fa-spin"></i> Fetching your reviews...
                    </div>
                  ) : myReviews.length === 0 ? (
                    <div className="empty-reviews-state">
                      <i className="fa-regular fa-message"></i>
                      <h4>No reviews submitted yet</h4>
                      <p>You haven't reviewed any trips or packages. Book a journey and tell us what you think!</p>
                      <Link to="/trips" className="btn-explore">Explore Packages</Link>
                    </div>
                  ) : (
                    <div className="my-reviews-list">
                      {myReviews.map((rev) => {
                        const packageTitle = rev.experience?.name || 'Exciting Egypt Trip';
                        const pkgId = rev.experience?._id || rev.experience;
                        const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        }) : 'Recent';

                        return (
                          <div key={rev._id} className="user-review-item-card">
                            
                            {/* Card Header */}
                            <div className="review-item-header">
                              <div>
                                <h4>
                                  {pkgId ? (
                                    <Link to={`/package-details/${pkgId}`} className="pkg-link">
                                      {packageTitle}
                                    </Link>
                                  ) : packageTitle}
                                </h4>
                                <span className="review-item-date">{reviewDate}</span>
                              </div>
                              <button 
                                className="btn-delete-review"
                                onClick={() => handleDeleteReview(rev._id)}
                                title="Delete this review"
                              >
                                <i className="fa-solid fa-trash-can"></i> Delete
                              </button>
                            </div>

                            {/* Stars Rating */}
                            <div className="review-item-stars-row">
                              {renderStars(rev.rating)}
                              {rev.isVerifiedBooking && (
                                <span className="verified-booking-tag">
                                  <i className="fa-solid fa-circle-check"></i> Verified Booking
                                </span>
                              )}
                            </div>

                            {/* Review Content */}
                            <p className="review-item-text">
                              {rev.comment || 'You rated this experience without typing any comments.'}
                            </p>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </section>

          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
