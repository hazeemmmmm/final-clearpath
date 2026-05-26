import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { LanguageContext } from '../../context/LanguageContext';
import { 
  getTripDetails, 
  getTrips,
  getUserProfile, 
  getExperienceReviews, 
  getExperienceStats, 
  createReview,
  getFinalTrip,
  getAllUsersAdmin,
  createCustomTrip,
  addDayToCustomTrip,
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
  const [addDayTab, setAddDayTab] = useState('custom'); // 'custom' | 'ready'
  const [newActivitySelection, setNewActivitySelection] = useState({ activityId: '', providerId: '', price: '' });
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [customizationError, setCustomizationError] = useState('');
  const { lang, setLang } = useContext(LanguageContext);
  const [guestCount, setGuestCount] = useState(1);
  const [suggestedPackages, setSuggestedPackages] = useState([]);

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

        // Load other packages/dayuse of the same region to suggest
        try {
          const allPkgsRes = await getTrips({ limit: 100 });
          const allPkgs = allPkgsRes.data || allPkgsRes || [];
          if (Array.isArray(allPkgs) && pkg && pkg.destination) {
            const currentDestId = pkg.destination._id || pkg.destination;
            const filtered = allPkgs.filter(p => {
              const pDestId = p.destination?._id || p.destination;
              return pDestId && currentDestId && pDestId.toString() === currentDestId.toString() && (p._id || p.id) !== (pkg._id || pkg.id);
            });
            setSuggestedPackages(filtered);
          }
        } catch (perr) {
          console.error("Failed to load suggested packages for this destination region", perr);
        }
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

  const handleInjectDayuseDay = async (dayusePkg) => {
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

      const sourceDay = dayusePkg.itinerary?.[0] || {};
      
      const payload = {
        title: dayusePkg.name || sourceDay.title || 'Day Use Plan',
        description: dayusePkg.description || sourceDay.description || 'Pre-designed single-day itinerary.',
        image: dayusePkg.image || sourceDay.image || '',
        activities: (sourceDay.activities || []).map(act => {
          const actId = act.activity?._id || act.activity;
          const matchedActObj = activitiesList.find(a => a._id === actId);
          return {
            activity: actId,
            price: Number(act.price) || (matchedActObj ? Number(matchedActObj.price) : 0),
            provider: act.provider?._id || act.provider || (matchedActObj?.provider?._id || matchedActObj?.provider) || null
          };
        })
      };

      await addDayToCustomTrip(activeTrip._id, payload);

      const viewRes = await getFinalTrip(id);
      setCustomTrip(viewRes.data);
      setShowAddActivityDay(null);
      setCustomizationError('');
    } catch (err) {
      console.error('Failed to inject Dayuse day', err);
      setCustomizationError(err.message || 'Failed to inject Dayuse day.');
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

  const getDayDate = (dayNumber) => {
    if (!start) return '';
    const dayDate = new Date(start);
    dayDate.setDate(start.getDate() + (dayNumber - 1));
    return dayDate.toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
                     <div className="thumbnails-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '15px' }}>
                       {packageData.images.map((imgUrl, idx) => {
                         const isValidUrl = imgUrl && (imgUrl.trim().startsWith('http') || imgUrl.trim().startsWith('/') || imgUrl.trim().startsWith('data:image'));
                         
                         let finalImgUrl = imgUrl;
                         if (!isValidUrl) {
                           if (idx === 0) finalImgUrl = 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80';
                           else if (idx === 1) finalImgUrl = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80';
                           else if (idx === 2) finalImgUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';
                           else finalImgUrl = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';
                         }
                         
                         return (
                           <div 
                             key={idx} 
                             className={`thumbnail-item ${activeImage === finalImgUrl ? 'active' : ''}`}
                             onClick={() => setActiveImage(finalImgUrl)}
                             style={{
                               background: '#121212',
                               position: 'relative',
                               overflow: 'hidden',
                               border: activeImage === finalImgUrl ? '2.5px solid var(--secondary-color, #d4af37)' : '1px solid rgba(212, 175, 55, 0.25)',
                               borderRadius: '10px',
                               height: '80px',
                               cursor: 'pointer',
                               boxSizing: 'border-box',
                               transition: 'all 0.2s'
                             }}
                           >
                             <img src={finalImgUrl} alt="Experience view" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                            <div key={day.day_number} className="itinerary-day-card" style={{ 
                              background: 'var(--card-bg, #ffffff)', 
                              border: isDayRemoved ? '1px solid var(--border-light, #333)' : '1.5px solid var(--secondary-color, #d4af37)',
                              borderRadius: '16px', 
                              overflow: 'hidden',
                              marginBottom: '30px',
                              opacity: isDayRemoved ? 0.6 : 1,
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                              boxShadow: 'var(--box-shadow-soft)',
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              
                              {/* 🖼️ Scenic Airbnb-style Day Illustration Image Banner */}
                              <div className="day-image-banner" style={{ 
                                height: '220px', 
                                position: 'relative',
                                background: '#121212',
                                overflow: 'hidden'
                              }}>
                                <img 
                                  src={day.image || packageData.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80'} 
                                  alt={day.title || `Day ${day.day_number}`} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                />
                                
                                {/* Overlay Gradient */}
                                <div style={{
                                  position: 'absolute',
                                  left: 0, right: 0, top: 0, bottom: 0,
                                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.85) 100%)'
                                }}></div>

                                {/* Custom Day Number Badge */}
                                <div className="day-number-badge" style={{
                                  position: 'absolute',
                                  top: '15px',
                                  left: '15px',
                                  background: isDayRemoved ? '#555' : 'var(--secondary-color, #d4af37)',
                                  color: '#000000',
                                  padding: '5px 12px',
                                  borderRadius: '20px',
                                  fontWeight: '800',
                                  fontSize: '0.8rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px',
                                  zIndex: 2
                                }}>
                                  Day {day.day_number}
                                </div>

                                {/* Day Calendar Date Badge */}
                                <div className="day-calendar-date-badge" style={{
                                  position: 'absolute',
                                  top: '15px',
                                  left: '95px',
                                  background: 'rgba(0, 0, 0, 0.75)',
                                  color: '#fff',
                                  padding: '5px 12px',
                                  borderRadius: '20px',
                                  fontWeight: '700',
                                  fontSize: '0.78rem',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  zIndex: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px'
                                }}>
                                  <i className="fa-solid fa-calendar-day" style={{ color: 'var(--secondary-color, #d4af37)' }}></i>
                                  {getDayDate(day.day_number)}
                                </div> 

                                {/* Toggle checkbox overlay */}
                                <div className="day-toggle-action" style={{
                                  position: 'absolute',
                                  top: '15px',
                                  right: '15px',
                                  background: 'rgba(0, 0, 0, 0.6)',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <input 
                                    type="checkbox"
                                    checked={!isDayRemoved}
                                    onChange={() => handleToggleDayCheckbox(day.day_number)}
                                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--secondary-color, #d4af37)' }}
                                    id={`check-day-${day.day_number}`}
                                  />
                                  <label htmlFor={`check-day-${day.day_number}`} style={{ color: '#fff', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '700', margin: 0 }}>
                                    {isDayRemoved ? (lang === 'AR' ? 'تفعيل اليوم' : 'Enable Day') : (lang === 'AR' ? 'إلغاء اليوم' : 'Disable Day')}
                                  </label>
                                </div>

                                {/* Day Title Heading */}
                                <h3 style={{ 
                                  position: 'absolute',
                                  bottom: '15px',
                                  left: '20px',
                                  right: '20px',
                                  color: '#ffffff',
                                  margin: 0,
                                  fontSize: '1.4rem',
                                  fontWeight: '800',
                                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                  textDecoration: isDayRemoved ? 'line-through' : 'none'
                                }}>
                                  {day.title || (lang === 'AR' ? `مخطط اليوم ${day.day_number}` : `Day ${day.day_number} Itinerary Plan`)}
                                </h3>
                              </div>

                              <div className="day-card-body" style={{ padding: '20px 25px', flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                
                                {/* 📝 Day Description */}
                                {day.description && (
                                  <div style={{
                                    borderLeft: '3px solid var(--secondary-color, #d4af37)',
                                    paddingLeft: '15px'
                                  }}>
                                    <h5 style={{ margin: '0 0 5px 0', textTransform: 'uppercase', color: 'var(--secondary-color, #d4af37)', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                      {lang === 'AR' ? 'نظرة عامة على اليوم' : 'Day overview'}
                                    </h5>
                                    <p className="day-description-info" style={{ 
                                      color: 'var(--text-muted, #64748b)', 
                                      fontSize: '0.94rem', 
                                      lineHeight: '1.6',
                                      marginTop: '0', 
                                      marginBottom: '0',
                                      fontWeight: '500'
                                    }}>
                                      {day.description}
                                    </p>
                                  </div>
                                )}

                                {/* ⚡ Day Activities Header */}
                                <h5 style={{ margin: '5px 0 0 0', textTransform: 'uppercase', color: 'var(--primary-color, #003D59)', fontSize: '0.78rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                  {lang === 'AR' ? 'الأنشطة المدرجة:' : 'Included daily activities'}
                                </h5>

                                {day.activities && day.activities.length > 0 ? (
                                  <ul className="activity-list" style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {day.activities.map((act, index) => {
                                      const actObj = act.activity;
                                      const customAct = customDay?.activities?.find(a => (a.activity?._id || a.activity) === (actObj?._id || actObj));
                                      const isActRemoved = customAct ? customAct.status === 'removed' : false;
                                      const isDisabled = isDayRemoved;

                                      const provId = act.provider?._id || act.provider || actObj?.provider?._id || actObj?.provider;
                                      const matchedProv = providersList.find(p => p._id === provId);
                                      const providerName = matchedProv ? matchedProv.name : (act.provider?.name || actObj?.provider?.name || '');

                                      return (
                                        <li key={index} className="activity-item" style={{ 
                                          display: 'flex', 
                                          flexDirection: 'column', 
                                          alignItems: 'stretch', 
                                          padding: '12px 15px', 
                                          background: 'rgba(0,0,0,0.02)',
                                          border: '1px solid var(--border-light, #e2e8f0)',
                                          borderRadius: '10px', 
                                          opacity: (isDisabled || isActRemoved) ? 0.5 : 1,
                                          transition: 'all 0.2s'
                                        }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
                                            <label style={{ 
                                              display: 'flex', 
                                              alignItems: 'center', 
                                              gap: '10px', 
                                              cursor: isDisabled ? 'not-allowed' : 'pointer', 
                                              margin: 0, 
                                              color: (isDisabled || isActRemoved) ? '#888' : 'inherit', 
                                              fontWeight: '700'
                                            }}>
                                              <input 
                                                type="checkbox"
                                                disabled={isDisabled}
                                                checked={!isDisabled && !isActRemoved}
                                                onChange={() => handleToggleActivityCheckbox(day.day_number, actObj?._id || actObj)}
                                                style={{ width: '17px', height: '17px', cursor: isDisabled ? 'not-allowed' : 'pointer', accentColor: 'var(--secondary-color, #d4af37)' }}
                                              />
                                              <span style={{ textDecoration: isActRemoved ? 'line-through' : 'none', color: 'var(--text-dark, #1e293b)', fontSize: '0.95rem' }}>
                                                <strong>{actObj?.name || act.name || 'Exciting Activity'}</strong>
                                                {providerName && (
                                                  <span style={{ 
                                                    fontSize: '0.74rem', 
                                                    color: 'var(--secondary-color, #d4af37)', 
                                                    marginLeft: '10px', 
                                                    backgroundColor: 'rgba(212,175,55,0.08)', 
                                                    padding: '3px 10px', 
                                                    borderRadius: '4px',
                                                    border: '1px solid rgba(212,175,55,0.2)',
                                                    fontWeight: '700',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                  }}>
                                                    <i className="fa-solid fa-parachute-box"></i>
                                                    {providerName}
                                                  </span>
                                                )}
                                              </span>
                                            </label>
                                            <span className="act-price" style={{ color: (isDisabled || isActRemoved) ? '#777' : 'var(--accent-color, #CE1126)', fontWeight: '800', fontSize: '0.95rem', textDecoration: isActRemoved ? 'line-through' : 'none' }}>
                                              +{act.price} EGP
                                            </span>
                                          </div>

                                          {/* 📝 Activity Description */}
                                          {(act.description || actObj?.description) && (
                                            <div style={{
                                              paddingLeft: '27px',
                                              marginTop: '6px',
                                              fontSize: '0.84rem',
                                              color: 'var(--text-muted, #64748b)',
                                              lineHeight: '1.4',
                                              textDecoration: isActRemoved ? 'line-through' : 'none'
                                            }}>
                                              {act.description || actObj.description}
                                            </div>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                ) : (
                                  <p style={{ color: '#888', fontStyle: 'italic', margin: 0 }}>Free leisure time to explore the city.</p>
                                )}

                                {/* Inline Add Custom Activity Form */}
                                {isCustomizing && customTrip && !isDayRemoved && (
                                  <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                    {showAddActivityDay === day.day_number ? (
                                      <div className="add-activity-inline-form" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '15px', borderRadius: '10px', marginTop: '10px' }}>
                                        <h4 style={{ color: '#d4af37', fontSize: '0.92rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                          {lang === 'AR' ? 'استعراض وإضافة نشاط إضافي بالمنطقة:' : 'Browse & Add Extra Activity in region:'}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                          {/* Select Dropdown filtering ONLY activities in current destination region NOT in experience already */}
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
                                            style={{ padding: '10px', background: '#14141f', border: '1.5px solid rgba(212,175,55,0.2)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                                          >
                                            <option value="">-- {lang === 'AR' ? 'اختر نشاطاً إضافياً بالمنطقة' : 'Select an Extra Activity in Region'} --</option>
                                            {(() => {
                                              const pkgDestId = packageData?.destination?._id || packageData?.destination;
                                              // Filter: ONLY activities in this region
                                              const regionalActs = activitiesList.filter(act => {
                                                const actDestId = act.destination?._id || act.destination;
                                                return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                                              });

                                              // Filter out activities that are already in the current day's plan to prevent duplicate additions
                                              const currentDayActIds = day.activities.map(a => (a.activity?._id || a.activity)?.toString());
                                              const remainingActs = regionalActs.filter(a => !currentDayActIds.includes(a._id.toString()));

                                              return remainingActs.map(act => {
                                                const provId = act.provider?._id || act.provider;
                                                const matchedProv = providersList.find(p => p._id === provId);
                                                const provName = matchedProv ? matchedProv.name : (act.provider?.name || 'Provider');
                                                return (
                                                  <option key={act._id} value={act._id}>
                                                    {act.name} | Mover: {provName} | {act.description ? act.description.substring(0, 30) + '...' : 'No desc'} | Price: {act.price} EGP
                                                  </option>
                                                );
                                              });
                                            })()}
                                          </select>

                                          {/* 🌟 Professional Live Preview of Selected Activity Specs */}
                                          {(() => {
                                            if (!newActivitySelection.activityId) return null;
                                            const selectedActObj = activitiesList.find(a => a._id === newActivitySelection.activityId);
                                            if (!selectedActObj) return null;

                                            const provId = selectedActObj.provider?._id || selectedActObj.provider;
                                            const matchedProv = providersList.find(p => p._id === provId);
                                            const providerNameResolved = matchedProv ? matchedProv.name : (selectedActObj.provider?.name || 'Local Expert');

                                            return (
                                              <div className="activity-live-preview-box" style={{
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                border: '1px dashed rgba(212,175,55,0.3)',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                fontSize: '0.85rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '6px'
                                              }}>
                                                <div style={{ color: '#fff', fontWeight: '700' }}>
                                                  {selectedActObj.name}
                                                </div>
                                                <div style={{ color: '#d4af37', fontWeight: '600', display: 'flex', gap: '15px' }}>
                                                  <span>
                                                    <i className="fa-solid fa-parachute-box" style={{ marginRight: '5px' }}></i>
                                                    {providerNameResolved}
                                                  </span>
                                                  <span>
                                                    <i className="fa-solid fa-wallet" style={{ marginRight: '5px' }}></i>
                                                    {newActivitySelection.price} EGP
                                                  </span>
                                                </div>
                                                {selectedActObj.description && (
                                                  <div style={{ color: '#a4a4b4', fontSize: '0.78rem', lineHeight: '1.4', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                                                    {selectedActObj.description}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}

                                          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            <button 
                                              onClick={() => handleAddActivitySubmit(day.day_number)}
                                              style={{ background: 'var(--secondary-color, #d4af37)', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.82rem' }}
                                            >
                                              {lang === 'AR' ? 'تأكيد إضافة النشاط' : 'Confirm Add Activity'}
                                            </button>
                                            <button 
                                              onClick={() => {
                                                setShowAddActivityDay(null);
                                                setNewActivitySelection({ activityId: '', providerId: '', price: '' });
                                              }}
                                              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}
                                            >
                                              {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <button 
                                        onClick={() => setShowAddActivityDay(day.day_number)}
                                        style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1.5px dashed rgba(212, 175, 55, 0.4)', color: '#d4af37', padding: '8px 18px', borderRadius: '25px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.05)'; }}
                                      >
                                        <i className="fa-solid fa-circle-plus"></i> {lang === 'AR' ? 'إضافة أنشطة إضافية للمخطط اليومي' : 'Add regional activities to this plan'}
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
                              type="button"
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
                                <div className="add-activity-inline-form" style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1.5px solid rgba(212, 175, 55, 0.3)',
                                  padding: '20px',
                                  borderRadius: '12px',
                                  width: '450px',
                                  maxWidth: '90vw',
                                  boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
                                }}>
                                  {/* Tab Selection Headers */}
                                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                                    <button
                                      type="button"
                                      onClick={() => setAddDayTab('custom')}
                                      style={{
                                        background: addDayTab === 'custom' ? 'var(--secondary-color, #d4af37)' : 'transparent',
                                        color: addDayTab === 'custom' ? '#000' : '#fff',
                                        border: addDayTab === 'custom' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        flex: 1,
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      {lang === 'AR' ? 'نشاط مخصص' : 'Custom Activity'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setAddDayTab('ready')}
                                      style={{
                                        background: addDayTab === 'ready' ? 'var(--secondary-color, #d4af37)' : 'transparent',
                                        color: addDayTab === 'ready' ? '#000' : '#fff',
                                        border: addDayTab === 'ready' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        flex: 1,
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      {lang === 'AR' ? 'يوم جاهز (Day Use)' : 'Ready Day Use Day'}
                                    </button>
                                  </div>

                                  {addDayTab === 'custom' ? (
                                    <>
                                      <h4 style={{ color: '#d4af37', fontSize: '0.9rem', margin: '0 0 10px 0', fontWeight: '800' }}>
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
                                          style={{ padding: '10px', background: '#14141f', border: '1.5px solid rgba(212,175,55,0.2)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                                        >
                                          <option value="">-- {lang === 'AR' ? 'اختر نشاطاً إضافياً بالمنطقة' : 'Select an Activity'} --</option>
                                          {(() => {
                                            const pkgDestId = packageData?.destination?._id || packageData?.destination;
                                            const optionalActs = activitiesList.filter(act => {
                                              const actDestId = act.destination?._id || act.destination;
                                              return actDestId && pkgDestId && actDestId.toString() === pkgDestId.toString();
                                            }) || [];
                                            return optionalActs.map(act => {
                                              const provId = act.provider?._id || act.provider;
                                              const matchedProv = providersList.find(p => p._id === provId);
                                              const provName = matchedProv ? matchedProv.name : (act.provider?.name || 'Local Expert');
                                              return (
                                                <option key={act._id} value={act._id}>
                                                  {act.name} | Mover: {provName} | {act.description ? act.description.substring(0, 30) + '...' : 'No desc'} | Price: {act.price} EGP
                                                </option>
                                              );
                                            });
                                          })()}
                                        </select>

                                        {/* 🌟 Professional Live Preview of Selected Activity Specs */}
                                        {(() => {
                                          if (!newActivitySelection.activityId) return null;
                                          const selectedActObj = activitiesList.find(a => a._id === newActivitySelection.activityId);
                                          if (!selectedActObj) return null;

                                          const provId = selectedActObj.provider?._id || selectedActObj.provider;
                                          const matchedProv = providersList.find(p => p._id === provId);
                                          const providerNameResolved = matchedProv ? matchedProv.name : (selectedActObj.provider?.name || 'Local Expert');

                                          return (
                                            <div className="activity-live-preview-box" style={{
                                              background: 'rgba(255, 255, 255, 0.02)',
                                              border: '1px dashed rgba(212,175,55,0.3)',
                                              borderRadius: '8px',
                                              padding: '12px',
                                              fontSize: '0.85rem',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: '6px'
                                            }}>
                                              <div style={{ color: '#fff', fontWeight: '700' }}>
                                                {selectedActObj.name}
                                              </div>
                                              <div style={{ color: '#d4af37', fontWeight: '600', display: 'flex', gap: '15px' }}>
                                                <span>
                                                  <i className="fa-solid fa-parachute-box" style={{ marginRight: '5px' }}></i>
                                                  {providerNameResolved}
                                                </span>
                                                <span>
                                                  <i className="fa-solid fa-wallet" style={{ marginRight: '5px' }}></i>
                                                  {newActivitySelection.price} EGP
                                                </span>
                                              </div>
                                              {selectedActObj.description && (
                                                <div style={{ color: '#a4a4b4', fontSize: '0.78rem', lineHeight: '1.4', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                                                  {selectedActObj.description}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })()}

                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                          <button 
                                            onClick={() => handleAddActivitySubmit(displayItinerary.length + 1)}
                                            style={{ background: 'var(--secondary-color, #d4af37)', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '800', fontSize: '0.82rem' }}
                                          >
                                            {lang === 'AR' ? 'تأكيد إضافة اليوم والنشاط' : 'Confirm Add Day & Activity'}
                                          </button>
                                          <button 
                                            onClick={() => {
                                              setShowAddActivityDay(null);
                                              setNewActivitySelection({ activityId: '', providerId: '', price: '' });
                                            }}
                                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }}
                                          >
                                            {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                                          </button>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <h4 style={{ color: '#d4af37', fontSize: '0.9rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                                        {lang === 'AR' ? 'اختر يوماً جاهزاً من الباقات المتاحة بنفس المنطقة:' : 'Choose a ready-made Day Use in same region:'}
                                      </h4>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                                        {(() => {
                                          const regionalDayuses = suggestedPackages.filter(p => p.type === 'Package' || p.duration_days === 1);
                                          if (regionalDayuses.length === 0) {
                                            return (
                                              <p style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'center', padding: '10px 0' }}>
                                                {lang === 'AR' ? 'لا توجد باقات Day Use جاهزة متاحة حالياً في هذه المنطقة.' : 'No pre-designed Day Use experiences available in this region.'}
                                              </p>
                                            );
                                          }

                                          return regionalDayuses.map(pkg => (
                                            <div 
                                              key={pkg._id} 
                                              onClick={() => handleInjectDayuseDay(pkg)}
                                              style={{
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                gap: '12px',
                                                alignItems: 'center'
                                              }}
                                              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                                              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                                            >
                                              <img 
                                                src={pkg.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=150&q=80'} 
                                                alt={pkg.name} 
                                                style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }}
                                              />
                                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: '700' }}>
                                                  {pkg.name}
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '1', WebkitBoxOrient: 'vertical' }}>
                                                  {pkg.description || 'Pre-designed package.'}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', fontSize: '0.74rem', fontWeight: '700', marginTop: '2px' }}>
                                                  <span>{pkg.base_price} EGP</span>
                                                  <span style={{ color: '#aaa', fontSize: '0.7rem' }}>
                                                    <i className="fa-solid fa-bolt" style={{ marginRight: '3px', color: '#d4af37' }}></i>
                                                    {lang === 'AR' ? 'اضغط للإضافة' : 'Click to Inject'}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          ));
                                        })()}
                                      </div>
                                      
                                      <button 
                                        onClick={() => {
                                          setShowAddActivityDay(null);
                                        }}
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', marginTop: '10px', width: '100%' }}
                                      >
                                        {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                                      </button>
                                    </>
                                  )}
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

                    {/* 🌟 Suggested regional Packages & Dayuse card lists */}
                    {isCustomizing && suggestedPackages && suggestedPackages.length > 0 && (
                      <div className="regional-suggestions-section" style={{
                        marginTop: '35px',
                        padding: '25px',
                        background: 'rgba(212, 175, 55, 0.04)',
                        border: '1px solid rgba(212, 175, 55, 0.15)',
                        borderRadius: '16px',
                        boxSizing: 'border-box'
                      }}>
                        <h3 style={{ 
                          color: '#d4af37', 
                          fontSize: '1.25rem', 
                          fontWeight: '800', 
                          marginTop: '0', 
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <i className="fa-solid fa-map-location-dot"></i>
                          {lang === 'AR' ? 'أيام أنشطة وباقات إضافية متاحة في نفس المنطقة:' : 'Suggested Extra Days & Packages in same region:'}
                        </h3>
                        <p style={{ color: '#c4c4d4', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
                          {lang === 'AR' 
                            ? 'لقد عثرنا على هذه الباقات والرحلات اليومية المتاحة في نفس الوجهة الجغرافية. يمكنك استلهام أفكار منها أو إضافتها لرحلتك المخصصة.' 
                            : 'We found these dayuse experiences and travel packages active in the same region. You can view their details to enrich your journey.'}
                        </p>

                        <div className="suggestions-flex-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: '20px'
                        }}>
                          {suggestedPackages.map(pkg => (
                            <div key={pkg._id} className="suggested-region-card" style={{
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '12px',
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'transform 0.2s, border-color 0.2s',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.location.href = `/package-details/${pkg._id}`}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                              <div className="card-media-wrapper" style={{ height: '140px', position: 'relative' }}>
                                <img 
                                  src={pkg.image || 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80'} 
                                  alt={pkg.name} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '10px',
                                  background: 'rgba(0,0,0,0.7)',
                                  color: '#d4af37',
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  border: '1px solid rgba(212,175,55,0.3)'
                                }}>
                                  {pkg.type === 'Package' ? (lang === 'AR' ? 'يوم واحد' : 'Day Use') : (lang === 'AR' ? 'رحلة متعددة' : 'Trip')}
                                </div>
                              </div>

                              <div className="card-info-pane" style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: '1', gap: '8px' }}>
                                <h4 style={{ color: '#ffffff', fontSize: '0.98rem', fontWeight: '700', margin: '0', lineHeight: '1.3' }}>
                                  {pkg.name}
                                </h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0', flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                                  {pkg.description || 'Embark on a high-value excursion.'}
                                </p>
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center', 
                                  marginTop: '5px',
                                  borderTop: '1px dashed rgba(255,255,255,0.06)',
                                  paddingTop: '10px'
                                }}>
                                  <span style={{ color: '#aaa', fontSize: '0.78rem' }}>
                                    <i className="fa-solid fa-clock" style={{ marginRight: '5px' }}></i>
                                    {pkg.duration_days} {pkg.duration_days > 1 ? (lang === 'AR' ? 'أيام' : 'Days') : (lang === 'AR' ? 'يوم' : 'Day')}
                                  </span>
                                  <strong style={{ color: '#d4af37', fontSize: '0.95rem' }}>
                                    {pkg.base_price} EGP
                                  </strong>
                                </div>

                                {isCustomizing && (pkg.type === 'Package' || pkg.duration_days === 1) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInjectDayuseDay(pkg);
                                    }}
                                    style={{
                                      marginTop: '10px',
                                      width: '100%',
                                      background: 'rgba(212, 175, 55, 0.1)',
                                      border: '1px solid rgba(212, 175, 55, 0.4)',
                                      color: '#d4af37',
                                      padding: '8px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: '700',
                                      fontSize: '0.78rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '5px',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--secondary-color, #d4af37)'; e.currentTarget.style.color = '#000'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; e.currentTarget.style.color = '#d4af37'; }}
                                  >
                                    <i className="fa-solid fa-circle-plus"></i>
                                    {lang === 'AR' ? 'إضافة اليوم لخطتي' : 'Add Day to Itinerary'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
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
