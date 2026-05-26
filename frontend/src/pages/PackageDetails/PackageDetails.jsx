import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { LanguageContext } from '../../context/LanguageContext';
import { 
  getTripDetails, 
  getUserProfile, 
  getExperienceReviews, 
  getExperienceStats, 
  createReview,
  getFinalTrip,
  getAllUsersAdmin,
  createCustomTrip,
  addActivityToCustomTrip,
  removeActivityFromCustomTrip,
  removeDayFromCustomTrip,
  addExtraActivityToCustomTrip,
  removeExtraActivityFromCustomTrip,
  createBooking,
  getActivities,
  getProviders,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from '../../utils/api';
import './PackageDetails.css';

const PackageDetails = () => {
  const { id } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [activeImage, setActiveImage] = useState('');
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

  // Customization State
  const [customTrip, setCustomTrip] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activitiesList, setActivitiesList] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [showAddActivityDay, setShowAddActivityDay] = useState(null);
  const [newActivitySelection, setNewActivitySelection] = useState({ activityId: '', providerId: '', price: '' });
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [customizationError, setCustomizationError] = useState('');
  const { lang, setLang } = useContext(LanguageContext);
  const [guestCount, setGuestCount] = useState(1);

  // Wishlist State
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [usersMap, setUsersMap] = useState({});

  const token = localStorage.getItem('token') || localStorage.getItem('clearpath_access_token');

  // Fetch package details, user profile, reviews, stats and wishlist status
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPackageDetails();
    fetchReviewsAndStats();
    if (token) {
      fetchUserProfile();
      checkWishlistStatus();
    }
  }, [id, token]);

  const checkWishlistStatus = async () => {
    try {
      const response = await getWishlist();
      const items = response.wishlist?.experiences || response.data?.experiences || response.wishlist || response.data || [];
      if (Array.isArray(items)) {
        const isSaved = items.some(item => (item._id || item.id) === id);
        setIsInWishlist(isSaved);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist status', err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        setIsInWishlist(false);
      } else {
        await addToWishlist(id);
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error('Failed to toggle wishlist item', err);
      alert('Failed to update wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      
      if (token) {
        try {
          const response = await getFinalTrip(id);
          if (response && response.source === 'customTrip') {
            setCustomTrip(response.data);
            setIsCustomizing(true);
          }
        } catch (err) {
          console.log('No existing customization or error fetching custom trip', err);
        }
      }

      const response = await getTripDetails(id);
      const pkg = response.data || response.experience || response;
      setPackageData(pkg);
      // try fetch users for supervisor lookup if needed
      try {
        const usersRes = await getAllUsersAdmin();
        const usersList = usersRes.data || usersRes.users || usersRes;
        const map = {};
        if (Array.isArray(usersList)) usersList.forEach(u => { if (u && u._id) map[u._id] = u; });
        setUsersMap(map);
      } catch (uerr) {
        console.debug('Could not fetch users for supervisor lookup', uerr);
      }
      if (pkg) {
        setActiveImage(pkg.image || (pkg.images && pkg.images[0]) || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80');
      }
      
      try {
        const acts = await getActivities({ limit: 100 });
        setActivitiesList(acts.data || acts.activities || acts || []);
        
        const provs = await getProviders({ limit: 100 });
        setProvidersList(provs.data || provs.providers || provs || []);
      } catch (err) {
        console.error('Failed to load customization catalogs', err);
      }

    } catch (err) {
      console.error('Failed to load package details', err);
      setError('Failed to load package details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCustomization = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    try {
      setLoading(true);
      await createCustomTrip(id);
      
      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
      setIsCustomizing(true);
      setCustomizationError('');
    } catch (err) {
      console.error('Failed to start customization', err);
      setCustomizationError(err.message || 'Failed to start customizing this experience.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCustomization = () => {
    setIsCustomizing(!isCustomizing);
  };

  const handleToggleDayCheckbox = async (day_number) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      let activeTrip = customTrip;
      if (!activeTrip) {
        // Initialize custom trip first in the background
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      await removeDayFromCustomTrip(activeTrip._id, day_number);
      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
    } catch (err) {
      console.error('Failed to toggle day', err);
      alert(err.message || 'Failed to update day.');
    }
  };

  const handleToggleActivityCheckbox = async (day_number, activityId) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      let activeTrip = customTrip;
      if (!activeTrip) {
        // Initialize custom trip first in the background
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      await removeActivityFromCustomTrip(activeTrip._id, day_number, activityId);
      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
    } catch (err) {
      console.error('Failed to toggle activity', err);
      alert(err.message || 'Failed to update activity.');
    }
  };

  const handleToggleOptionalCheckbox = async (day_number, activity) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      let activeTrip = customTrip;
      if (!activeTrip) {
        // Initialize custom trip first in the background
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      // Check if this activity already exists in customTrip itinerary for this day
      const customDay = activeTrip.itinerary?.find(d => d.day_number === day_number);
      const existingAct = customDay?.activities?.find(a => (a.activity?._id || a.activity) === activity._id);

      if (existingAct) {
        // Just toggle its status
        await removeActivityFromCustomTrip(activeTrip._id, day_number, activity._id);
      } else {
        // Add it as a new custom activity
        await addActivityToCustomTrip(activeTrip._id, day_number, {
          activity: activity._id,
          price: activity.price,
          provider: (activity.providers && activity.providers[0]) || null
        });
      }

      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
    } catch (err) {
      console.error('Failed to toggle optional activity', err);
      alert(err.message || 'Failed to update optional activity.');
    }
  };

  const handleAddActivitySubmit = async (dayNumber) => {
    if (!newActivitySelection.activityId) {
      alert('Please select an activity.');
      return;
    }

    try {
      setLoading(true);
      let activeTrip = customTrip;
      if (!activeTrip) {
        await createCustomTrip(id);
        const viewRes = await getFinalTrip(id);
        activeTrip = viewRes.data;
        setCustomTrip(activeTrip);
        setIsCustomizing(true);
      }

      await addActivityToCustomTrip(activeTrip._id, dayNumber, {
        activity: newActivitySelection.activityId,
        price: Number(newActivitySelection.price) || 0,
        provider: newActivitySelection.providerId || null
      });

      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
      setShowAddActivityDay(null);
      setNewActivitySelection({ activityId: '', providerId: '', price: '' });
      setCustomizationError('');
    } catch (err) {
      console.error('Failed to add custom activity', err);
      setCustomizationError(err.message || 'Failed to add activity.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      setBookingLoading(true);
      let res;
      if (isCustomizing && customTrip) {
        res = await createBooking({ customTrip: customTrip._id, numberOfGuests: guestCount });
      } else {
        res = await createBooking({ experienceId: packageData._id, numberOfGuests: guestCount });
      }
      
      const booking = res.data || res.booking || res;
      if (booking && booking._id) {
        localStorage.setItem('currentBookingId', booking._id);
        window.location.href = '/payment';
      } else {
        throw new Error('Booking could not be created.');
      }
    } catch (err) {
      console.error('Failed to create booking', err);
      alert(err.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
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

  const displayItinerary = customTrip && customTrip.itinerary && customTrip.itinerary.length > 0
    ? customTrip.itinerary
    : (packageData ? packageData.itinerary : []);
  const { start, end } = (() => {
    if (!packageData) return { start: null, end: null };
    let start = null;
    if (packageData.availableDates && packageData.availableDates.length > 0) {
      const validDates = packageData.availableDates
        .map(d => new Date(d.date))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a - b);
      if (validDates.length > 0) {
        start = validDates[0];
      }
    }
    if (!start) {
      const today = new Date();
      const nextSat = new Date();
      nextSat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
      start = nextSat;
    }
    const duration = packageData.duration_days || 1;
    const end = new Date(start);
    end.setDate(start.getDate() + (duration > 1 ? duration - 1 : 0));
    return { start, end };
  })();

  const startFormatted = start 
    ? start.toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  const endFormatted = end
    ? end.toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="package-details-page">
      <Navbar lang={lang} setLang={setLang} isScrolled={true} />

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
                    <i className="fa-solid fa-users"></i> {lang === 'AR' ? `الحد الأقصى: ${packageData.capacity || 20} فرد` : `Max ${packageData.capacity || 20} People`}
                  </span>
                  <span>
                    <i className="fa-solid fa-calendar-day"></i> {lang === 'AR' ? `البداية: ${startFormatted}` : `Start: ${startFormatted}`}
                  </span>
                  <span>
                    <i className="fa-solid fa-calendar-check"></i> {lang === 'AR' ? `النهاية: ${endFormatted}` : `End: ${endFormatted}`}
                  </span>
                  {/* Supervisor display */}
                  <span>
                    <i className="fa-solid fa-user-tie"></i> {(() => {
                      const sup = packageData.supervisor || packageData.supervisior || null;
                      if (!sup) return lang === 'AR' ? 'مشرف: —' : 'Supervisor: —';
                      let name = '';
                      if (typeof sup === 'object') name = `${sup.firstName || ''} ${sup.lastName || ''}`.trim();
                      else name = (usersMap[sup] && `${usersMap[sup].firstName || ''} ${usersMap[sup].lastName || ''}`.trim()) || String(sup);
                      return name ? `${lang === 'AR' ? 'مشرف: ' : 'Supervisor: '} ${name}` : (lang === 'AR' ? 'مشرف: —' : 'Supervisor: —');
                    })()}
                  </span>
                  {stats.totalReviews > 0 && (
                    <span className="meta-rating">
                      <i className="fa-solid fa-star"></i> {stats.averageRating} ({stats.totalReviews} reviews)
                    </span>
                  )}
                </div>

                {/* 📸 Premium Interactive Travel Experience Gallery */}
                <div className="premium-gallery-container">
                  {/* Large Active Image */}
                  <div className="image-wrapper">
                    <img 
                      src={activeImage || packageData.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80'} 
                      alt={packageData.name || packageData.title} 
                      className="main-gallery-image"
                    />
                    <div className="type-badge">{packageData.type}</div>
                  </div>

                  {/* Thumbnails Row */}
                  {packageData.images && packageData.images.length > 0 && (
                    <div className="thumbnails-grid">
                      {packageData.images.map((imgUrl, idx) => {
                        let label = "Sight";
                        if (idx === 1) label = "Safari";
                        if (idx === 2) label = "Hotel";
                        if (idx === 3) label = "Dining";
                        
                        return (
                          <div 
                            key={idx} 
                            className={`thumbnail-item ${activeImage === imgUrl ? 'active' : ''}`}
                            onClick={() => setActiveImage(imgUrl)}
                          >
                            <img src={imgUrl} alt={`${label} view`} />
                            <span className="thumbnail-label">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="details-section">
                  <h2>Overview</h2>
                  <p className="description-text">
                    {packageData.description || 'Embark on a breath-taking journey that lets you discover Egypt\'s true wonders. Fully guided experience with premium logistics, customized options, and memorable local stories.'}
                  </p>
                </div>

                {/* Itinerary Section */}
                <div className="itinerary-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>{isCustomizing ? '⚡ Your Customized Itinerary' : 'Planned Itinerary'}</h2>
                    {token && customTrip && (
                      <button 
                        onClick={handleToggleCustomization} 
                        className="btn-toggle-custom"
                        style={{
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid #d4af37',
                          color: '#d4af37',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                      >
                        {isCustomizing ? 'View Standard Plan' : 'View Customized Plan'}
                      </button>
                    )}
                  </div>

                  <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-circle-info" style={{ color: '#d4af37' }}></i>
                    {token 
                      ? 'يمكنك تخصيص رحلتك بمجرد تحديد أو إلغاء تحديد الأيام والأنشطة أدناه!' 
                      : 'سجل دخولك لتتمكن من إلغاء أو تفعيل أي يوم أو نشاط وتعديل سعر الرحلة فوراً!'}
                  </p>

                  {customizationError && (
                    <div className="alert alert-error" style={{ marginBottom: '15px' }}>
                      <i className="fa-solid fa-circle-exclamation"></i> {customizationError}
                    </div>
                  )}

                  <div className="itinerary-timeline customized">
                    {displayItinerary && displayItinerary.length > 0 ? (
                      <>
                        {displayItinerary.map((day) => {
                          const customDay = customTrip?.itinerary?.find(d => d.day_number === day.day_number);
                          const isDayRemoved = customDay ? customDay.status === 'removed' : false;

                          // Optional Activities for this destination
                          const pkgDestId = packageData?.destination?._id || packageData?.destination;
                          const optionalActs = activitiesList.filter(act => {
                            const actDestId = act.destination?._id || act.destination;
                            return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                          }) || [];
                          const finalAddActivityOptions = optionalActs.length > 0 ? optionalActs : activitiesList;

                          return (
                            <div key={day.day_number} className="itinerary-day" style={{ borderLeft: '2px dashed rgba(212, 175, 55, 0.3)', opacity: isDayRemoved ? 0.55 : 1, transition: 'opacity 0.2s' }}>
                              <div className="day-badge" style={{ background: isDayRemoved ? '#555' : '#d4af37', color: '#000' }}>Day {day.day_number}</div>
                              
                              <div className="day-content" style={{ background: 'rgba(212, 175, 55, 0.02)', border: isDayRemoved ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(212, 175, 55, 0.1)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0 }}>
                                    <input 
                                      type="checkbox"
                                      checked={!isDayRemoved}
                                      onChange={() => handleToggleDayCheckbox(day.day_number)}
                                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#d4af37' }}
                                    />
                                    <h3 style={{ color: isDayRemoved ? '#777' : '#d4af37', margin: 0, fontSize: '1.15rem', textDecoration: isDayRemoved ? 'line-through' : 'none' }}>
                                      Day {day.day_number} Plan {isDayRemoved && ' (Removed)'}
                                    </h3>
                                  </label>
                                </div>

                                {day.activities && day.activities.length > 0 ? (
                                  <ul className="activity-list" style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
                                    {day.activities.map((act, index) => {
                                      const actObj = act.activity;
                                      const customAct = customDay?.activities?.find(a => (a.activity?._id || a.activity) === (actObj?._id || actObj));
                                      const isActRemoved = customAct ? customAct.status === 'removed' : false;
                                      const isDisabled = isDayRemoved;

                                      return (
                                        <li key={index} className="activity-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', opacity: (isDisabled || isActRemoved) ? 0.5 : 1 }}>
                                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isDisabled ? 'not-allowed' : 'pointer', margin: 0, color: (isDisabled || isActRemoved) ? '#777' : '#e2e8f0', width: '80%' }}>
                                            <input 
                                              type="checkbox"
                                              disabled={isDisabled}
                                              checked={!isDisabled && !isActRemoved}
                                              onChange={() => handleToggleActivityCheckbox(day.day_number, actObj?._id || actObj)}
                                              style={{ width: '17px', height: '17px', cursor: isDisabled ? 'not-allowed' : 'pointer', accentColor: '#d4af37' }}
                                            />
                                            <span style={{ textDecoration: isActRemoved ? 'line-through' : 'none' }}>
                                              {actObj?.name || 'Exciting Activity'}
                                              {act.provider && <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '8px' }}>({act.provider.name || 'Provider'})</span>}
                                            </span>
                                          </label>
                                          <span className="act-price" style={{ color: (isDisabled || isActRemoved) ? '#777' : '#d4af37', fontWeight: '600', textDecoration: isActRemoved ? 'line-through' : 'none' }}>
                                            +{act.price} EGP
                                          </span>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                ) : (
                                  <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>Free leisure time to explore the city.</p>
                                )}

                                {/* Inline Add Custom Activity Form */}
                                {isCustomizing && customTrip && !isDayRemoved && (
                                  <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                    {showAddActivityDay === day.day_number ? (
                                      <div className="add-activity-inline-form" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                                        <h4 style={{ color: '#d4af37', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                                          {lang === 'AR' ? 'إضافة نشاط مخصص لهذا اليوم:' : 'Add Custom Activity to Day:'}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                          <select 
                                            value={newActivitySelection.activityId}
                                            onChange={(e) => {
                                              const actId = e.target.value;
                                              const actObj = activitiesList.find(a => a._id === actId);
                                              setNewActivitySelection(prev => ({
                                                ...prev,
                                                activityId: actId,
                                                price: actObj ? actObj.price : '',
                                                providerId: actObj && actObj.provider?._id ? actObj.provider._id : (actObj?.provider || '')
                                              }));
                                            }}
                                            style={{ padding: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
                                          >
                                            <option value="">-- {lang === 'AR' ? 'اختر نشاطاً' : 'Select an Activity'} --</option>
                                            {finalAddActivityOptions.map(act => (
                                              <option key={act._id} value={act._id}>{act.name} ({act.type}) - {act.price} EGP</option>
                                            ))}
                                          </select>

                                          {newActivitySelection.activityId && (
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                              <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                                {lang === 'AR' ? `السعر: ${newActivitySelection.price} جنيه` : `Price: ${newActivitySelection.price} EGP`}
                                              </span>
                                            </div>
                                          )}

                                          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            <button 
                                              onClick={() => handleAddActivitySubmit(day.day_number)}
                                              style={{ background: 'var(--brand-accent)', color: '#000', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                            >
                                              {lang === 'AR' ? 'تأكيد الإضافة' : 'Confirm Add'}
                                            </button>
                                            <button 
                                              onClick={() => {
                                                setShowAddActivityDay(null);
                                                setNewActivitySelection({ activityId: '', providerId: '', price: '' });
                                              }}
                                              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                              {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => setShowAddActivityDay(day.day_number)}
                                        style={{ background: 'transparent', border: '1px dashed rgba(212, 175, 55, 0.4)', color: '#d4af37', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}
                                      >
                                        <i className="fa-solid fa-plus"></i> {lang === 'AR' ? 'إضافة نشاط لهذا اليوم' : 'Add Activity to this Day'}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Timeline Node for Adding a New Day */}
                        {isCustomizing && customTrip && (
                          <div className="add-day-timeline-node" style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '2px dashed rgba(212, 175, 55, 0.3)', paddingLeft: '20px', position: 'relative', marginTop: '20px', minHeight: '60px' }}>
                            <button 
                              className="btn-add-day-plus"
                              onClick={() => {
                                const nextDayNum = displayItinerary.length + 1;
                                setShowAddActivityDay(nextDayNum);
                              }}
                              style={{
                                position: 'absolute',
                                left: '-16px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--brand-accent, #d4af37)',
                                color: '#121212',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 10px rgba(212, 175, 55, 0.4)',
                                transition: 'all 0.2s'
                              }}
                              title={lang === 'AR' ? 'إضافة يوم جديد للخطة' : 'Add New Day to Itinerary'}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                            
                            <div style={{ marginLeft: '15px' }}>
                              {showAddActivityDay === (displayItinerary.length + 1) ? (
                                <div className="add-activity-inline-form" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '15px', borderRadius: '8px', width: '320px' }}>
                                  <h4 style={{ color: '#d4af37', fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                                    {lang === 'AR' ? `إضافة نشاط لليوم الجديد (اليوم ${displayItinerary.length + 1}):` : `Add Activity to Start Day ${displayItinerary.length + 1}:`}
                                  </h4>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <select 
                                      value={newActivitySelection.activityId}
                                      onChange={(e) => {
                                        const actId = e.target.value;
                                        const actObj = activitiesList.find(a => a._id === actId);
                                        setNewActivitySelection(prev => ({
                                          ...prev,
                                          activityId: actId,
                                          price: actObj ? actObj.price : '',
                                          providerId: actObj && actObj.provider?._id ? actObj.provider._id : (actObj?.provider || '')
                                        }));
                                      }}
                                      style={{ padding: '8px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
                                    >
                                      <option value="">-- {lang === 'AR' ? 'اختر نشاطاً' : 'Select an Activity'} --</option>
                                      {(() => {
                                        const pkgDestId = packageData?.destination?._id || packageData?.destination;
                                        const optionalActs = activitiesList.filter(act => {
                                          const actDestId = act.destination?._id || act.destination;
                                          return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                                        }) || [];
                                        const finalOptions = optionalActs.length > 0 ? optionalActs : activitiesList;
                                        return finalOptions.map(act => (
                                          <option key={act._id} value={act._id}>{act.name} ({act.type}) - {act.price} EGP</option>
                                        ));
                                      })()}
                                    </select>

                                    {newActivitySelection.activityId && (
                                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#aaa' }}>
                                          {lang === 'AR' ? `السعر: ${newActivitySelection.price} جنيه` : `Price: ${newActivitySelection.price} EGP`}
                                        </span>
                                      </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                      <button 
                                        onClick={() => handleAddActivitySubmit(displayItinerary.length + 1)}
                                        style={{ background: 'var(--brand-accent)', color: '#000', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                      >
                                        {lang === 'AR' ? 'إنشاء اليوم وإضافة النشاط' : 'Create Day & Add Activity'}
                                      </button>
                                      <button 
                                        onClick={() => {
                                          setShowAddActivityDay(null);
                                          setNewActivitySelection({ activityId: '', providerId: '', price: '' });
                                        }}
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                      >
                                        {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span 
                                  onClick={() => {
                                    const nextDayNum = displayItinerary.length + 1;
                                    setShowAddActivityDay(nextDayNum);
                                  }}
                                  style={{ color: '#d4af37', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}
                                >
                                  {lang === 'AR' ? 'أضف يوماً إضافياً إلى خطتك اليومية (+)' : 'Add an extra day to your itinerary (+)'}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ color: '#888', fontStyle: 'italic' }}>Leisure trip with open explore days.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Sticky Booking Card */}
              <div className="package-sidebar">
                <div className="booking-card">
                  {(() => {
                    const singlePrice = isCustomizing && customTrip 
                      ? (packageData.base_price + customTrip.total_price) 
                      : (packageData ? (packageData.base_price || packageData.price || 0) : 0);
                    const totalPrice = singlePrice * guestCount;

                    return (
                      <>
                        <div className="booking-price" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span className="price-label">{isCustomizing ? (lang === 'AR' ? 'السعر المخصص للفرد' : 'Customized price per guest') : (lang === 'AR' ? 'يبدأ سعر الفرد من' : 'Price starts at')}</span>
                            <span className="price-amount" style={{ fontSize: '1.2rem' }}>
                              {singlePrice} EGP
                            </span>
                          </div>
                          {guestCount > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '6px', marginTop: '4px' }}>
                              <span className="price-label" style={{ color: '#d4af37', fontWeight: '700' }}>
                                {lang === 'AR' ? `الإجمالي لـ ${guestCount} مسافرين` : `Total for ${guestCount} guests`}
                              </span>
                              <span className="price-amount" style={{ color: '#d4af37', fontSize: '1.4rem', fontWeight: '800' }}>
                                {totalPrice} EGP
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Interactive Guest Selector */}
                        <div className="guest-selector-container" style={{
                          margin: '15px 0',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(212, 175, 55, 0.15)',
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <label style={{ fontSize: '0.85rem', color: '#aaa', fontWeight: '600', display: 'flex', justifyContent: 'space-between', margin: 0 }}>
                            <span>{lang === 'AR' ? 'عدد المسافرين (الضيوف)' : 'Number of Travelers (Guests)'}</span>
                            <span style={{ color: '#d4af37', fontWeight: 'bold' }}>{guestCount} {guestCount === 1 ? (lang === 'AR' ? 'مسافر' : 'Guest') : (lang === 'AR' ? 'مسافرين' : 'Guests')}</span>
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                            <button 
                              type="button"
                              onClick={() => setGuestCount(prev => Math.max(1, prev - 1))}
                              disabled={guestCount <= 1}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: guestCount <= 1 ? '#333' : '#d4af37',
                                color: '#000',
                                border: 'none',
                                cursor: guestCount <= 1 ? 'not-allowed' : 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <i className="fa-solid fa-minus"></i>
                            </button>
                            <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#fff' }}>{guestCount}</span>
                            <button 
                              type="button"
                              onClick={() => setGuestCount(prev => prev + 1)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#d4af37',
                                color: '#000',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  
                  {isCustomizing && customTrip && (
                    <div style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid #d4af37', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#d4af37', fontSize: '0.85rem', fontWeight: '600' }}>
                      <i className="fa-solid fa-sparkles"></i> {lang === 'AR' ? 'الخطة المخصصة نشطة' : 'Custom Plan Active'}
                    </div>
                  )}

                  <div className="booking-benefits">
                    <div className="benefit-item">
                      <i className="fa-solid fa-shield-halved"></i>
                      <div>
                        <strong>{lang === 'AR' ? 'إلغاء مجاني' : 'Free Cancellation'}</strong>
                        <p>{lang === 'AR' ? 'إلغاء مرن حتى 24 ساعة مقدماً' : 'Cancel up to 24 hours in advance'}</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <i className="fa-solid fa-bolt"></i>
                      <div>
                        <strong>{lang === 'AR' ? 'تأكيد فوري' : 'Instant Confirmation'}</strong>
                        <p>{lang === 'AR' ? 'احجز مكانك مباشرة في ثوانٍ معدودة' : 'Secure your spot in seconds'}</p>
                      </div>
                    </div>
                    <div className="benefit-item">
                      <i className="fa-solid fa-headset"></i>
                      <div>
                        <strong>{lang === 'AR' ? 'دعم متواصل 24/7' : '24/7 Support'}</strong>
                        <p>{lang === 'AR' ? 'فريق عمل متفاني لخدمتك طوال اليوم' : 'Dedicated customer support'}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                    <button 
                      onClick={handleBookNow} 
                      className="btn-book-now" 
                      disabled={bookingLoading}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                      {bookingLoading ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري إتمام الحجز...' : 'Creating Booking...'}</>
                      ) : (
                        <><i className="fa-solid fa-calendar-days"></i> {isCustomizing ? (lang === 'AR' ? 'احجز الخطة المخصصة' : 'Book Customized Plan') : (lang === 'AR' ? 'احجز هذه الرحلة الآن' : 'Book This Trip')}</>
                      )}
                    </button>

                    <button 
                      onClick={handleWishlistToggle} 
                      className={`btn-wishlist-toggle ${isInWishlist ? 'saved' : ''}`}
                      disabled={wishlistLoading}
                      style={{
                        width: '100%',
                        background: isInWishlist ? '#e61e4d' : '#f1f5f9',
                        border: isInWishlist ? '2px solid #e61e4d' : '2px solid #cbd5e1',
                        color: isInWishlist ? '#ffffff' : '#1e293b',
                        padding: '12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: isInWishlist ? '0 6px 20px rgba(230, 30, 77, 0.4)' : 'none'
                      }}
                    >
                      {wishlistLoading ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري المعالجة...' : 'Processing...'}</>
                      ) : (
                        <>
                          <i className={`${isInWishlist ? 'fa-solid' : 'fa-regular'} fa-heart`} style={{ color: isInWishlist ? '#ffffff' : '#e61e4d' }}></i>
                          {isInWishlist 
                            ? (lang === 'AR' ? 'تم الحفظ في المفضلة' : 'Saved to Wishlist')
                            : (lang === 'AR' ? 'أضف إلى المفضلة' : 'Add to Wishlist')}
                        </>
                      )}
                    </button>

                    {token && (
                      !customTrip ? (
                        <button 
                          onClick={handleStartCustomization} 
                          className="btn-start-custom"
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid #d4af37',
                            color: '#d4af37',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <i className="fa-solid fa-sliders"></i> {lang === 'AR' ? 'خصص هذه الخطة' : 'Customize This Plan'}
                        </button>
                      ) : (
                        <button 
                          onClick={handleToggleCustomization} 
                          className="btn-start-custom"
                          style={{
                            width: '100%',
                            background: 'transparent',
                            border: '1px solid #d4af37',
                            color: '#d4af37',
                            padding: '12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <i className="fa-solid fa-rotate-left"></i> {isCustomizing ? (lang === 'AR' ? 'التحول للخطة الأساسية' : 'Switch to Standard Plan') : (lang === 'AR' ? 'التحول للخطة المخصصة' : 'Switch to Custom Plan')}
                        </button>
                      )
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* ============================================================== */}
            {/* 📝 REVIEWS & RATINGS INTEGRATION SECTION                       */}
            {/* ============================================================== */}
            <div className="reviews-integration-section">
              <hr className="divider" />
              
              <div className="reviews-header">
                <h2>{lang === 'AR' ? 'تقييمات وآراء الزوار' : 'Guest Ratings & Reviews'}</h2>
                <p>{lang === 'AR' ? 'تجارب واقعية وتقييمات من مغامرين موثقين زاروا هذا المكان' : 'Real stories and ratings from verified adventurers'}</p>
              </div>

              {/* 1. Aggregate Statistics Panel */}
              <div className="stats-panel-grid">
                
                {/* Aggregate Summary Box */}
                <div className="stats-summary-box">
                  <div className="average-number">{stats.averageRating || '0.0'}</div>
                  {renderStars(stats.averageRating)}
                  <div className="total-label">{lang === 'AR' ? `بناءً على ${stats.totalReviews || 0} تقييم` : `Based on ${stats.totalReviews || 0} reviews`}</div>
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
                      <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'لقد قمت بتقييم هذه التجربة بالفعل. شكراً لك على مشاركتنا رأيك!' : 'You have already reviewed this experience. Thank you for your feedback!'}
                    </div>
                  ) : (
                    <div className="write-review-card">
                      <h3>{lang === 'AR' ? 'شاركنا تجربتك الشخصية' : 'Share Your Experience'}</h3>
                      <p>{lang === 'AR' ? 'كيف كانت مغامرتك؟ دع الآخرين يتعرفون على تجربتك.' : 'How was your adventure? Let others know what you thought.'}</p>

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
                          <label>{lang === 'AR' ? 'تقييمك بالنجوم:' : 'Your Rating:'}</label>
                          <div className="stars-selector">
                            {renderStars(0, setUserRating, setHoverRating, true)}
                            {userRating > 0 && <span className="selected-rating-text">{userRating} / {lang === 'AR' ? '5 نجوم' : '5 stars'}</span>}
                          </div>
                        </div>

                        {/* Comment Text */}
                        <div className="form-group">
                          <label htmlFor="review-comment">{lang === 'AR' ? 'تعليقاتك ورأيك في الخدمة:' : 'Your Review Comments:'}</label>
                          <textarea
                            id="review-comment"
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder={lang === 'AR' ? 'أخبرنا عن المرشدين، وسائل النقل، الفنادق وتفاصيل رحلتك...' : "Tell us about the guides, the transport, the hotels, and details of your experience..."}
                            required
                            maxLength={500}
                          ></textarea>
                          <span className="char-counter">{userComment.length} / 500 {lang === 'AR' ? 'حرف' : 'characters'}</span>
                        </div>

                        <button type="submit" className="btn-submit-review" disabled={submittingReview}>
                          {submittingReview ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري الإرسال...' : 'Submitting...'}</>
                          ) : (
                            <><i className="fa-solid fa-paper-plane"></i> {lang === 'AR' ? 'إرسال التقييم' : 'Submit Review'}</>
                          )}
                        </button>
                      </form>
                    </div>
                  )
                ) : (
                  <div className="login-prompt-card">
                    <i className="fa-solid fa-lock"></i>
                    <h4>{lang === 'AR' ? 'هل تود كتابة تقييم؟' : 'Want to write a review?'}</h4>
                    <p>{lang === 'AR' ? 'يجب عليك تسجيل الدخول لتتمكن من تقييم وترك تعليق على التجارب.' : 'You must be signed in to rate and comment on experiences.'}</p>
                    <Link to="/login" className="btn-login-redirect">{lang === 'AR' ? 'تسجيل الدخول الآن' : 'Sign In Now'}</Link>
                  </div>
                )}
              </div>

              {/* 3. Review Lists */}
              <div className="reviews-list-container">
                <h3>{lang === 'AR' ? `آراء وتجارب العملاء (${reviews.length})` : `Customer Reviews (${reviews.length})`}</h3>

                {loadingReviews ? (
                  <div className="loading-reviews">
                    <i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="no-reviews-card">
                    <i className="fa-regular fa-comments"></i>
                    <p>{lang === 'AR' ? 'لا توجد تقييمات لهذه التجربة حتى الآن. كن أول من يشاركنا رأيه!' : 'No reviews yet for this experience. Be the first to share your thoughts!'}</p>
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((rev) => {
                      const reviewerName = rev.user ? `${rev.user.firstName} ${rev.user.lastName}`.trim() : (lang === 'AR' ? 'مغامر مجهول' : 'Anonymous Adventurer');
                      const reviewerInitials = getUserInitials(rev.user);
                      const avatarBg = getAvatarColor(reviewerName);
                      const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', {
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
                                  <i className="fa-solid fa-circle-check"></i> {lang === 'AR' ? 'حجز مؤكد' : 'Verified Booking'}
                                </span>
                              )}
                            </div>

                          </div>

                          {/* Body */}
                          <div className="review-card-body">
                            <p>{rev.comment || (lang === 'AR' ? 'ترك هذا المستخدم تقييماً بالنجوم فقط دون تعليق.' : 'This user left no comment, just a rating.')}</p>
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
            <p>{lang === 'AR' ? 'لم يتم العثور على الباقة السياحية.' : 'Package not found.'}</p>
            <Link to="/" className="btn-back">{lang === 'AR' ? 'العودة للرئيسية' : 'Return to Home'}</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PackageDetails;
