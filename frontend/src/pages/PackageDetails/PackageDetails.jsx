import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  getTripDetails, 
  getUserProfile, 
  getExperienceReviews, 
  getExperienceStats, 
  createReview 
} from '../../utils/api';
import './PackageDetails.css';

const PackageDetails = () => {
  const { id } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  const token = localStorage.getItem('token') || localStorage.getItem('clearpath_access_token');

  // Fetch package details, user profile, reviews and stats
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPackageDetails();
    fetchReviewsAndStats();
    if (token) {
      fetchUserProfile();
    }
  }, [id, token]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await getTripDetails(id);
      setPackageData(response.data || response.experience || response);
    } catch (err) {
      console.error('Failed to load package details', err);
      setError('Failed to load package details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      setCurrentUser(response.user || response.data?.user || response.data || response);
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  };

  const fetchReviewsAndStats = async () => {
    try {
      setLoadingReviews(true);
      
      // Load stats
      const statsRes = await getExperienceStats(id);
      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      } else if (statsRes) {
        setStats(statsRes);
      }

      // Load reviews list
      const reviewsRes = await getExperienceReviews(id, { limit: 50 });
      const loadedReviews = reviewsRes.reviews || reviewsRes.data?.reviews || reviewsRes.data || [];
      setReviews(loadedReviews);

    } catch (err) {
      console.error('Failed to load reviews or stats', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Check if current user has already reviewed when user and reviews list are loaded
  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const hasReviewed = reviews.some(r => {
        const reviewUserObj = r.user?._id || r.user;
        const currentUserId = currentUser._id || currentUser.id;
        return reviewUserObj && reviewUserObj.toString() === currentUserId.toString();
      });
      setUserHasReviewed(hasReviewed);
    }
  }, [currentUser, reviews]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (userRating === 0) {
      setReviewError('Please select a rating of at least 1 star.');
      return;
    }

    setSubmittingReview(true);
    setReviewSuccess('');
    setReviewError('');

    try {
      await createReview({
        experience: id,
        rating: userRating,
        comment: userComment
      });

      setReviewSuccess('Thank you! Your review has been submitted successfully.');
      setUserRating(0);
      setUserComment('');
      setUserHasReviewed(true);
      
      // Refresh
      fetchReviewsAndStats();
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, onClick = null, onHover = null, interactive = false) => {
    const stars = [];
    const currentValue = interactive ? (hoverRating || userRating) : rating;
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= currentValue;
      stars.push(
        <i
          key={i}
          className={`${isFilled ? 'fa-solid' : 'fa-regular'} fa-star star ${interactive ? 'interactive-star' : ''}`}
          onClick={onClick ? () => onClick(i) : null}
          onMouseEnter={onHover ? () => onHover(i) : null}
          onMouseLeave={onHover ? () => onHover(0) : null}
          style={{ 
            cursor: interactive ? 'pointer' : 'default', 
            color: isFilled ? '#FFD700' : '#ddd',
            fontSize: interactive ? '1.8rem' : '0.95rem',
            marginRight: '3px',
            transition: 'color 0.2s, transform 0.2s'
          }}
        />
      );
    }
    return <div className="stars-container">{stars}</div>;
  };

  const getUserInitials = (user) => {
    if (!user) return '?';
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
    return first + last || 'U';
  };

  const getAvatarColor = (name) => {
    if (!name) return '#003D59';
    const colors = ['#003D59', '#CE1126', '#d4af37', '#2e7d32', '#6a1b9a', '#ef6c00', '#00838f'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const calculatePercentage = (count) => {
    if (!stats.totalReviews || stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  return (
    <div className="package-details-page">
      <Navbar />

      <main className="details-container">
        {loading ? (
          <div className="loading-spinner">
            <i className="fa-solid fa-spinner fa-spin"></i> Loading details...
          </div>
        ) : error ? (
          <div className="error-card">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{error}</p>
            <Link to="/" className="btn-back">Return to Home</Link>
          </div>
        ) : packageData ? (
          <>
            {/* Top Breadcrumb */}
            <div className="breadcrumb">
              <Link to="/">Home</Link> <i className="fa-solid fa-chevron-right"></i> 
              <Link to={packageData.type === 'Trip' ? '/trips' : '/dayuse'}>{packageData.type === 'Trip' ? 'Trips' : 'Day Use'}</Link> 
              <i className="fa-solid fa-chevron-right"></i> <span>{packageData.name || packageData.title}</span>
            </div>

            {/* Main Grid */}
            <div className="package-grid">
              
              {/* Left Column: Details & Itinerary */}
              <div className="package-main-info">
                <h1>{packageData.name || packageData.title}</h1>
                
                <div className="package-meta">
                  <span>
                    <i className="fa-solid fa-location-dot"></i> {packageData.destination?.name || 'Egypt'}
                  </span>
                  <span>
                    <i className="fa-solid fa-clock"></i> {packageData.duration_days} {packageData.duration_days > 1 ? 'Days' : 'Day'}
                  </span>
                  <span>
                    <i className="fa-solid fa-users"></i> Max {packageData.capacity || 20} People
                  </span>
                  {stats.totalReviews > 0 && (
                    <span className="meta-rating">
                      <i className="fa-solid fa-star"></i> {stats.averageRating} ({stats.totalReviews} reviews)
                    </span>
                  )}
                </div>

                <div className="image-wrapper">
                  <img 
                    src={packageData.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80'} 
                    alt={packageData.name || packageData.title} 
                  />
                  <div className="type-badge">{packageData.type}</div>
                </div>

                <div className="details-section">
                  <h2>Overview</h2>
                  <p className="description-text">
                    {packageData.description || 'Embark on a breath-taking journey that lets you discover Egypt\'s true wonders. Fully guided experience with premium logistics, customized options, and memorable local stories.'}
                  </p>
                </div>

                {/* Itinerary Section if available */}
                {packageData.itinerary && packageData.itinerary.length > 0 && (
                  <div className="itinerary-section">
                    <h2>Planned Itinerary</h2>
                    <div className="itinerary-timeline">
                      {packageData.itinerary.map((day) => (
                        <div key={day.day_number} className="itinerary-day">
                          <div className="day-badge">Day {day.day_number}</div>
                          <div className="day-content">
                            {day.activities && day.activities.length > 0 ? (
                              <ul className="activity-list">
                                {day.activities.map((act, index) => (
                                  <li key={index} className="activity-item">
                                    <span className="act-name">
                                      <i className="fa-solid fa-circle-check"></i> {act.activity?.name || 'Exciting Activity'}
                                    </span>
                                    {act.price > 0 && <span className="act-price">+{act.price} EGP</span>}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p>Free leisure time to explore the city.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Booking Card */}
              <div className="package-sidebar">
                <div className="booking-card">
                  <div className="booking-price">
                    <span className="price-label">Price starts at</span>
                    <span className="price-amount">{packageData.base_price || packageData.price} EGP</span>
                  </div>
                  
                  <div className="booking-benefits">
                    <div className="benefit-item">
                      <i className="fa-solid fa-shield-halved"></i>
                      <div>
                        <strong>Free Cancellation</strong>
                        <p>Cancel up to 24 hours in advance</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <i className="fa-solid fa-bolt"></i>
                      <div>
                        <strong>Instant Confirmation</strong>
                        <p>Secure your spot in seconds</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <i className="fa-solid fa-headset"></i>
                      <div>
                        <strong>24/7 Support</strong>
                        <p>Dedicated customer support</p>
                      </div>
                    </div>
                  </div>

                  <button className="btn-book-now">
                    <i className="fa-solid fa-calendar-days"></i> Book This Trip
                  </button>
                </div>
              </div>

            </div>

            {/* ============================================================== */}
            {/* 📝 REVIEWS & RATINGS INTEGRATION SECTION                       */}
            {/* ============================================================== */}
            <div className="reviews-integration-section">
              <hr className="divider" />
              
              <div className="reviews-header">
                <h2>Guest Ratings & Reviews</h2>
                <p>Real stories and ratings from verified adventurers</p>
              </div>

              {/* 1. Aggregate Statistics Panel */}
              <div className="stats-panel-grid">
                
                {/* Aggregate Summary Box */}
                <div className="stats-summary-box">
                  <div className="average-number">{stats.averageRating || '0.0'}</div>
                  {renderStars(stats.averageRating)}
                  <div className="total-label">Based on {stats.totalReviews || 0} reviews</div>
                </div>

                {/* Star Rating Breakdown Bars */}
                <div className="stats-breakdown-box">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratingBreakdown?.[star] || 0;
                    const pct = calculatePercentage(count);
                    return (
                      <div key={star} className="breakdown-row">
                        <span className="star-num">{star} ★</span>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="star-pct">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* 2. Review Form (Share your Experience) */}
              <div className="review-action-container">
                {token ? (
                  userHasReviewed ? (
                    <div className="info-message success">
                      <i className="fa-solid fa-circle-check"></i> You have already reviewed this experience. Thank you for your feedback!
                    </div>
                  ) : (
                    <div className="write-review-card">
                      <h3>Share Your Experience</h3>
                      <p>How was your adventure? Let others know what you thought.</p>

                      {reviewSuccess && (
                        <div className="alert alert-success">
                          <i className="fa-solid fa-circle-check"></i> {reviewSuccess}
                        </div>
                      )}
                      
                      {reviewError && (
                        <div className="alert alert-error">
                          <i className="fa-solid fa-circle-exclamation"></i> {reviewError}
                        </div>
                      )}

                      <form onSubmit={handleReviewSubmit} className="review-form">
                        
                        {/* Rating Stars Selector */}
                        <div className="form-group-stars">
                          <label>Your Rating:</label>
                          <div className="stars-selector">
                            {renderStars(0, setUserRating, setHoverRating, true)}
                            {userRating > 0 && <span className="selected-rating-text">{userRating} / 5 stars</span>}
                          </div>
                        </div>

                        {/* Comment Text */}
                        <div className="form-group">
                          <label htmlFor="review-comment">Your Review Comments:</label>
                          <textarea
                            id="review-comment"
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Tell us about the guides, the transport, the hotels, and details of your experience..."
                            required
                            maxLength={500}
                          ></textarea>
                          <span className="char-counter">{userComment.length} / 500 characters</span>
                        </div>

                        <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                          {submittingReview ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</>
                          ) : (
                            <><i className="fa-solid fa-paper-plane"></i> Submit Review</>
                          )}
                        </button>
                      </form>
                    </div>
                  )
                ) : (
                  <div className="login-prompt-card">
                    <i className="fa-solid fa-lock"></i>
                    <h4>Want to write a review?</h4>
                    <p>You must be signed in to rate and comment on experiences.</p>
                    <Link to="/login" className="btn-login-redirect">Sign In Now</Link>
                  </div>
                )}
              </div>

              {/* 3. Review Lists */}
              <div className="reviews-list-container">
                <h3>Customer Reviews ({reviews.length})</h3>

                {loadingReviews ? (
                  <div className="loading-reviews">
                    <i className="fa-solid fa-spinner fa-spin"></i> Loading reviews...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="no-reviews-card">
                    <i className="fa-regular fa-comments"></i>
                    <p>No reviews yet for this experience. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((rev) => {
                      const reviewerName = rev.user ? `${rev.user.firstName} ${rev.user.lastName}`.trim() : 'Anonymous Adventurer';
                      const reviewerInitials = getUserInitials(rev.user);
                      const avatarBg = getAvatarColor(reviewerName);
                      const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      }) : 'Recent';

                      return (
                        <div key={rev._id} className="review-card">
                          
                          {/* Header */}
                          <div className="review-card-header">
                            
                            {/* Avatar & User Details */}
                            <div className="reviewer-info">
                              <div className="reviewer-avatar" style={{ backgroundColor: avatarBg }}>
                                {reviewerInitials}
                              </div>
                              <div>
                                <h4 className="reviewer-name">{reviewerName}</h4>
                                <span className="review-date">{reviewDate}</span>
                              </div>
                            </div>

                            {/* Rating Stars & Badge */}
                            <div className="review-meta">
                              {renderStars(rev.rating)}
                              {rev.isVerifiedBooking && (
                                <span className="verified-badge">
                                  <i className="fa-solid fa-circle-check"></i> Verified Booking
                                </span>
                              )}
                            </div>

                          </div>

                          {/* Body */}
                          <div className="review-card-body">
                            <p>{rev.comment || 'This user left no comment, just a rating.'}</p>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </>
        ) : (
          <div className="error-card">
            <p>Package not found.</p>
            <Link to="/" className="btn-back">Return to Home</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PackageDetails;
