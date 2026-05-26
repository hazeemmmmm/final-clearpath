import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserBookings, cancelBooking } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import './MyBookings.css';

const MyBookings = () => {
  const { lang, setLang } = useContext(LanguageContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [expandedBookingIds, setExpandedBookingIds] = useState([]);

  const toggleExpandPlan = (bookingId) => {
    setExpandedBookingIds(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('clearpath_access_token') || localStorage.getItem('token');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBookings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await getUserBookings();
      // The backend returns an array or an object like { message, bookings: [...] }
      const list = response.bookings || response.data?.bookings || response.data || response || [];
      setBookings(Array.isArray(list) ? list : []);
    } catch (err) {
      setError('Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleCancelBooking = async (booking) => {
    const now = new Date();
    const createdAt = booking.createdAt || booking.booking_date || null;
    const hoursSinceBooking = createdAt ? (now - new Date(createdAt)) / (1000 * 60 * 60) : Infinity;
    const daysUntilTravel = booking.travel_date ? (new Date(booking.travel_date) - now) / (1000 * 60 * 60 * 24) : Infinity;

    let feePercent = 0;
    if (hoursSinceBooking <= 24) feePercent = 0;
    else if (daysUntilTravel <= 2) feePercent = 50;
    else if (daysUntilTravel <= 7) feePercent = 10;
    else feePercent = 5;

    const feeAmount = Number(((booking.total_amount || 0) * (feePercent / 100)).toFixed(2));

    const confirmMsg = lang === 'AR'
      ? `هل أنت متأكد من إلغاء هذا الحجز؟ رسوم الإلغاء: ${feePercent}% (${feeAmount} EGP).`
      : `Are you sure you want to cancel this booking? Cancellation fee: ${feePercent}% (${feeAmount} EGP).`;

    if (window.confirm(confirmMsg)) {
      setActionLoadingId(booking._id);
      try {
        await cancelBooking(booking._id);
        // Refresh bookings
        await fetchBookings();
      } catch (err) {
        const errorMsg = lang === 'AR'
          ? 'فشل إلغاء الحجز. حاول مرة أخرى أو تواصل مع الدعم.'
          : (err.message || 'Failed to cancel the booking. Try again or contact support.');
        alert(errorMsg);
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  return (
    <div className={`bookings-page-container ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />

      <div className="bookings-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>{lang === 'AR' ? 'حجوزاتي ورحلاتي' : 'My Bookings & Trips'}</h1>
          <p>{lang === 'AR' ? 'تتبع رحلاتك الحالية والسابقة في أرض الفراعنة' : 'Track your active and past reservations in the land of Pharaohs.'}</p>
        </div>
      </div>

      <main className="bookings-main-content">
        {!token ? (
          <div className="bookings-empty-state">
            <div className="glass-empty-card">
              <i className="fa-solid fa-lock empty-icon"></i>
              <h3>{lang === 'AR' ? 'يرجى تسجيل الدخول' : 'Please Log In'}</h3>
              <p>{lang === 'AR' ? 'سجل دخولك لرؤية وإدارة حجوزاتك ونشاطاتك' : 'Log in to view and manage your travel bookings.'}</p>
              <button className="btn-explore-cta" onClick={() => navigate('/login')}>
                {lang === 'AR' ? 'تسجيل الدخول' : 'Log In'}
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="bookings-loading-spinner">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>{lang === 'AR' ? 'جاري جلب حجوزاتك...' : 'Fetching your bookings...'}</p>
          </div>
        ) : error ? (
          <div className="bookings-error-card">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <p>{error}</p>
            <button className="btn-explore-cta" onClick={fetchBookings}>{lang === 'AR' ? 'إعادة المحاولة' : 'Retry'}</button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bookings-empty-state">
            <div className="glass-empty-card">
              <div className="empty-icon"><i className="fa-solid fa-plane-departure"></i></div>
              <h3>{lang === 'AR' ? 'لا يوجد حجوزات بعد' : 'No bookings found'}</h3>
              <p>{lang === 'AR' ? 'لم تقم بحجز أي تجارب أو باقات سياحية حتى الآن. ابدأ مغامرتك اليوم!' : 'You haven\'t booked any travel packages or custom trips yet. Begin your adventure today!'}</p>
              <button className="btn-explore-cta" onClick={() => navigate('/experiences')}>
                {lang === 'AR' ? 'استكشف الرحلات والباقات' : 'Explore Packages'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              // Resolve trip/package info from either direct experience or customTrip.experience
              const isCustom = !!booking.customTrip;
              const expObj = booking.experience || booking.customTrip?.experience;
              const title = expObj?.name || (isCustom ? (lang === 'AR' ? 'رحلة مخصصة' : 'Custom Trip') : (lang === 'AR' ? 'باقة سياحية مميزة' : 'Premium Package'));
              const image = expObj?.images?.[0] || '/img/cairo_pyramids_1775971845389.png';
              const locationName = expObj?.destination?.name || (lang === 'AR' ? 'مواقع متعددة في مصر' : 'Multiple Locations, Egypt');
              
              const bookingDate = booking.booking_date
                ? new Date(booking.booking_date).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—';

              return (
                <div key={booking._id} className="booking-item-card glassmorphic-card">
                  {/* Image Column */}
                  <div className="booking-card-image">
                    <img src={image} alt={title} />
                    {isCustom && <span className="custom-tag-badge">{lang === 'AR' ? '🗺️ رحلة مخصصة' : '🗺️ Custom'}</span>}
                  </div>

                  {/* Content Column */}
                  <div className="booking-card-content">
                    <div className="booking-card-header">
                      <div className="header-left">
                        <span className="booking-type-label">
                          {booking.booking_type === 'Trip' ? (lang === 'AR' ? 'رحلة سياحية' : 'Trip') : (lang === 'AR' ? 'باقة متكاملة' : 'Package')}
                        </span>
                        <h3>{title}</h3>
                        <p className="booking-location"><i className="fa-solid fa-location-dot"></i> {locationName}</p>
                      </div>
                      
                      <div className="header-right">
                        <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                          {booking.status === 'Confirmed' ? (lang === 'AR' ? 'مؤكد' : 'Confirmed') :
                           booking.status === 'Cancelled' ? (lang === 'AR' ? 'ملغي' : 'Cancelled') :
                           (lang === 'AR' ? 'قيد الانتظار' : 'Pending')}
                        </span>
                      </div>
                    </div>

                    <div className="booking-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">{lang === 'AR' ? 'تاريخ الحجز' : 'Booking Date'}</span>
                        <span className="detail-value">{bookingDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">{lang === 'AR' ? 'رقم الحجز' : 'Booking ID'}</span>
                        <span className="detail-value id-value">{booking._id}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">{lang === 'AR' ? 'عدد المسافرين' : 'Travelers'}</span>
                        <span className="detail-value">{booking.numberOfGuests || 1} {booking.numberOfGuests === 1 ? (lang === 'AR' ? 'فرد' : 'Guest') : (lang === 'AR' ? 'أفراد' : 'Guests')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">{lang === 'AR' ? 'المبلغ الإجمالي' : 'Total Price'}</span>
                        <span className="detail-value price-value">{booking.total_amount || 0} EGP</span>
                      </div>
                    </div>

                    <div className="booking-card-footer">
                      <button 
                        className="btn-view-details"
                        onClick={() => expObj?._id && navigate(`/package-details/${expObj._id}`)}
                      >
                        <i className="fa-solid fa-circle-info"></i> {lang === 'AR' ? 'عرض التفاصيل' : 'View Details'}
                      </button>

                      {((booking.customTrip && booking.customTrip.itinerary) || (expObj && expObj.itinerary)) && (
                        <button 
                          className="btn-view-itinerary"
                          onClick={() => toggleExpandPlan(booking._id)}
                          style={{
                            background: expandedBookingIds.includes(booking._id) ? '#d4af37' : 'rgba(255, 255, 255, 0.05)',
                            color: expandedBookingIds.includes(booking._id) ? '#121212' : '#d4af37',
                            border: '1px solid #d4af37',
                            padding: '8px 16px',
                            borderRadius: '25px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s'
                          }}
                        >
                          <i className="fa-solid fa-route"></i>
                          {expandedBookingIds.includes(booking._id) 
                            ? (lang === 'AR' ? 'إخفاء مسار الرحلة' : 'Hide Daily Plan')
                            : (lang === 'AR' ? 'عرض مسار الرحلة' : 'Show Daily Plan')}
                        </button>
                      )}

                      {booking.status !== 'Cancelled' && (
                        <button 
                          className="btn-cancel-booking"
                          disabled={actionLoadingId === booking._id}
                          onClick={() => navigate(`/booking/${booking._id}/cancel`)}
                        >
                          {actionLoadingId === booking._id ? (
                            <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري الإلغاء...' : 'Cancelling...'}</>
                          ) : (
                            <><i className="fa-solid fa-ban"></i> {lang === 'AR' ? 'إلغاء الحجز' : 'Cancel Booking'}</>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expanded Custom/Standard Itinerary Breakdown */}
                    {expandedBookingIds.includes(booking._id) && (
                      <div className="booking-itinerary-breakdown" style={{
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        width: '100%'
                      }}>
                        <h4 style={{ color: '#d4af37', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                          <i className="fa-solid fa-map-location-dot"></i>
                          {lang === 'AR' ? 'تفاصيل خطة الرحلة اليومية:' : 'Daily Itinerary Breakdown:'}
                        </h4>
                        
                        <div className="timeline-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          {(() => {
                            const displayItinerary = booking.customTrip && booking.customTrip.itinerary
                              ? booking.customTrip.itinerary.filter(d => d.status !== 'removed')
                              : (expObj?.itinerary || []);

                            if (displayItinerary.length === 0) {
                              return <p style={{ color: '#888', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                {lang === 'AR' ? 'لا توجد أنشطة مجدولة لهذه الرحلة.' : 'No scheduled activities for this trip.'}
                              </p>;
                            }

                            return displayItinerary.map((day) => {
                              const activeActivities = booking.customTrip
                                ? (day.activities || []).filter(a => a.status === 'active')
                                : (day.activities || []);

                              return (
                                <div key={day.day_number} className="timeline-day-block" style={{
                                  background: 'rgba(255, 255, 255, 0.01)',
                                  border: '1px solid rgba(212, 175, 55, 0.1)',
                                  borderRadius: '8px',
                                  padding: '12px 16px'
                                }}>
                                  <div style={{ fontWeight: '700', color: '#d4af37', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{lang === 'AR' ? `اليوم ${day.day_number}` : `Day ${day.day_number}`}</span>
                                    {activeActivities.length === 0 && (
                                      <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>
                                        {lang === 'AR' ? 'يوم استجمام حر' : 'Free leisure day'}
                                      </span>
                                    )}
                                  </div>

                                  {activeActivities.length > 0 ? (
                                    <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {activeActivities.map((act, idx) => {
                                        const actObj = act.activity;
                                        const providerObj = act.provider || actObj?.provider;
                                        return (
                                          <li key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            fontSize: '0.85rem',
                                            color: '#e2e8f0',
                                            padding: '4px 0',
                                            borderBottom: '1px solid rgba(255,255,255,0.03)'
                                          }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                              <span style={{ fontWeight: '500' }}>{actObj?.name || (lang === 'AR' ? 'نشاط سياحي' : 'Tourist Activity')}</span>
                                              {providerObj && (
                                                <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                                  {lang === 'AR' ? 'المزود:' : 'Provider:'} {providerObj.name || providerObj}
                                                </span>
                                              )}
                                            </div>
                                            <span style={{ color: '#d4af37', fontWeight: '600' }}>
                                              +{act.price || actObj?.price || 0} EGP
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  ) : (
                                    <p style={{ color: '#666', fontStyle: 'italic', margin: 0, fontSize: '0.8rem' }}>
                                      {lang === 'AR' ? 'وقت حر لاستكشاف المدينة بمفردك.' : 'Free leisure time to explore the city.'}
                                    </p>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookings;
