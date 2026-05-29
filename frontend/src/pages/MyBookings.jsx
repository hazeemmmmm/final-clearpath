import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserBookings, cancelBooking } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import { setChatOpen } from '../store/authSlice';

const MyBookings = () => {
  const { lang, setLang } = useContext(LanguageContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [expandedBookingIds, setExpandedBookingIds] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('clearpath_access_token') || localStorage.getItem('token');

  const toggleExpandPlan = (bookingId) => {
    setExpandedBookingIds(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
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
    <div className={`tw-min-h-screen tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-font-sans tw-flex tw-flex-col ${lang === 'AR' ? 'tw-dir-rtl' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />

      <header className="tw-relative tw-h-[50vh] tw-w-full tw-flex tw-items-center tw-justify-center tw-mt-0">
        <div className="tw-absolute tw-inset-0 tw-z-0 tw-bg-white dark:tw-bg-black">
          <img 
            src="/hero-abu-simbel.jpg" 
            alt="Hero Background" 
            className="tw-w-full tw-h-full tw-object-cover tw-opacity-20 dark:tw-opacity-40"
            style={{ objectPosition: 'center 30%' }}
          />
          <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-white/90 tw-via-white/70 tw-to-slate-50 dark:tw-from-black/80 dark:tw-via-black/50 dark:tw-to-[#0a0b0d]"></div>
        </div>

        <div className="tw-relative tw-z-10 tw-text-center tw-px-4 tw-pt-24">
          <h1 className="tw-text-4xl md:tw-text-6xl tw-font-serif tw-font-bold tw-text-amber-500 tw-mb-4 drop-shadow-sm dark:drop-shadow-lg">
            {lang === 'AR' ? 'حجوزاتي ورحلاتي' : 'My Bookings & Trips'}
          </h1>
          <p className="tw-text-slate-600 dark:tw-text-slate-300 tw-text-sm md:tw-text-base tw-max-w-xl tw-mx-auto tw-leading-relaxed tw-font-medium dark:tw-font-light drop-shadow-sm dark:drop-shadow-md">
            {lang === 'AR' 
              ? 'راجع وأدر تجارب السفر الحصرية الخاصة بك، المصممة خصيصاً للمستكشف المتميز.' 
              : 'Review and manage your exclusive travel experiences, curated for the discerning pathfinder.'}
          </p>
        </div>
      </header>

      <main className="tw-flex-grow tw-container tw-mx-auto tw-px-4 tw-py-12 tw-max-w-4xl tw-relative tw-z-20 -tw-mt-12">
        {!token ? (
          <div className="tw-flex tw-justify-center tw-py-16">
            <div className="tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-10 tw-text-center tw-max-w-lg tw-w-full tw-shadow-xl">
              <i className="fa-solid fa-lock tw-text-5xl tw-text-slate-300 dark:tw-text-slate-600 tw-mb-6"></i>
              <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-3">{lang === 'AR' ? 'يرجى تسجيل الدخول' : 'Please Log In'}</h3>
              <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-mb-8">{lang === 'AR' ? 'سجل دخولك لرؤية وإدارة حجوزاتك ونشاطاتك' : 'Log in to view and manage your travel bookings.'}</p>
              <button className="tw-w-full tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-slate-900 tw-font-bold tw-py-3 tw-px-8 tw-rounded-md tw-transition-colors" onClick={() => navigate('/login')}>
                {lang === 'AR' ? 'تسجيل الدخول' : 'Log In'}
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-32 tw-gap-4">
            <i className="fa-solid fa-circle-notch fa-spin tw-text-4xl tw-text-amber-500"></i>
            <p className="tw-text-slate-500 dark:tw-text-slate-400 tw-font-medium">{lang === 'AR' ? 'جاري جلب حجوزاتك...' : 'Fetching your bookings...'}</p>
          </div>
        ) : error ? (
          <div className="tw-flex tw-justify-center tw-py-16">
             <div className="tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-md tw-border tw-border-red-200 dark:tw-border-red-900/30 tw-rounded-2xl tw-p-10 tw-text-center tw-max-w-lg tw-w-full tw-shadow-xl">
              <i className="fa-solid fa-triangle-exclamation tw-text-5xl tw-text-red-500 tw-mb-6"></i>
              <p className="tw-text-slate-700 dark:tw-text-slate-300 tw-mb-6">{error}</p>
              <button className="tw-bg-slate-900 dark:tw-bg-white tw-text-white dark:tw-text-slate-900 hover:tw-bg-amber-500 dark:hover:tw-bg-amber-500 hover:tw-text-slate-900 tw-font-bold tw-py-3 tw-px-8 tw-rounded-md tw-transition-colors" onClick={fetchBookings}>{lang === 'AR' ? 'إعادة المحاولة' : 'Retry'}</button>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="tw-flex tw-justify-center tw-py-16">
            <div className="tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-12 tw-text-center tw-max-w-lg tw-w-full tw-shadow-xl">
              <div className="tw-text-6xl tw-text-slate-300 dark:tw-text-slate-700 tw-mb-6"><i className="fa-solid fa-plane-departure"></i></div>
              <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">{lang === 'AR' ? 'لا يوجد حجوزات بعد' : 'No bookings found'}</h3>
              <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-leading-relaxed tw-mb-8">{lang === 'AR' ? 'لم تقم بحجز أي تجارب أو باقات سياحية حتى الآن. ابدأ مغامرتك اليوم!' : 'You haven\'t booked any travel packages or custom trips yet. Begin your adventure today!'}</p>
              <button className="tw-w-full tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-slate-900 tw-font-bold tw-py-3 tw-px-8 tw-rounded-md tw-transition-colors" onClick={() => navigate('/experiences')}>
                {lang === 'AR' ? 'استكشف الرحلات والباقات' : 'Explore Packages'}
              </button>
            </div>
          </div>
        ) : (
          <div className="tw-flex tw-flex-col tw-gap-8">
            {bookings.map((booking) => {
              const isCustom = !!booking.customTrip;
              const expObj = booking.experience || booking.customTrip?.experience;
              const title = expObj?.name || (isCustom ? (lang === 'AR' ? 'رحلة مخصصة' : 'Custom Trip') : (lang === 'AR' ? 'باقة سياحية مميزة' : 'Premium Package'));
              const image = expObj?.images?.[0] || expObj?.image || '/img/cairo_pyramids_1775971845389.png';
              const locationName = expObj?.destination?.name || (lang === 'AR' ? 'مصر' : 'Egypt');
              
              const bookingDate = booking.booking_date
                ? new Date(booking.booking_date).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                : '—';

              const guests = booking.numberOfGuests || 1;
              const status = booking.status || 'Pending';
              
              // Status Badge logic matching screenshot (Outline colored badges)
              let statusClasses = "tw-border-slate-500 tw-text-slate-500 tw-bg-slate-500/10";
              let statusText = lang === 'AR' ? 'قيد الانتظار' : 'PENDING';
              
              if (status === 'Confirmed') {
                statusClasses = "tw-border-amber-500/40 tw-text-amber-600 dark:tw-text-amber-500 tw-bg-amber-500/10";
                statusText = lang === 'AR' ? 'مؤكد' : 'CONFIRMED';
              } else if (status === 'Cancelled') {
                statusClasses = "tw-border-slate-500/40 tw-text-slate-500 dark:tw-text-slate-500 tw-bg-slate-500/10";
                statusText = lang === 'AR' ? 'ملغي' : 'CANCELLED';
              } else if (status === 'Completed') {
                statusClasses = "tw-border-slate-500/40 tw-text-slate-600 dark:tw-text-slate-400 tw-bg-slate-500/10";
                statusText = lang === 'AR' ? 'مكتمل' : 'COMPLETED';
              }

              return (
                <div key={booking._id} className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-slate-200 dark:tw-border-[#1f1f1f] tw-rounded-lg tw-overflow-hidden tw-shadow-sm hover:tw-shadow-xl tw-transition-all tw-flex tw-flex-col md:tw-flex-row">
                  {/* Image Section */}
                  <div className="tw-relative md:tw-w-1/3 tw-h-56 md:tw-h-auto">
                    <img src={image} alt={title} className="tw-w-full tw-h-full tw-object-cover" />
                    <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/60 tw-to-transparent md:tw-hidden"></div>
                  </div>

                  {/* Content Section */}
                  <div className="md:tw-w-2/3 tw-p-6 md:tw-p-8 tw-flex tw-flex-col">
                    {/* Header Row */}
                    <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between sm:tw-items-center tw-mb-4 tw-gap-3">
                      <div className={`tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-border ${statusClasses} tw-text-[10px] tw-font-semibold tw-tracking-widest tw-uppercase tw-w-fit`}>
                        {statusText}
                      </div>
                      <div className="tw-text-slate-500 dark:tw-text-[#666666] tw-text-xs tw-font-medium">
                        Booking ID: <span className="tw-font-mono">{booking._id.substring(0,8).toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="tw-font-serif tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4 tw-leading-tight">
                      {title}
                    </h2>

                    {/* Meta Icons Row */}
                    <div className="tw-flex tw-flex-wrap tw-gap-x-6 tw-gap-y-3 tw-mb-8 tw-text-sm tw-font-medium tw-text-slate-600 dark:tw-text-[#cccccc]">
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <i className="fa-regular fa-calendar tw-text-amber-500"></i>
                        <span>{bookingDate}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <i className="fa-solid fa-user-group tw-text-amber-500"></i>
                        <span>{guests} {guests === 1 ? (lang === 'AR' ? 'فرد' : 'Guests') : (lang === 'AR' ? 'أفراد' : 'Guests')}</span>
                      </div>
                      <div className="tw-flex tw-items-center tw-gap-2">
                        <i className="fa-solid fa-location-dot tw-text-amber-500"></i>
                        <span>{locationName}</span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="tw-mt-auto tw-flex tw-flex-wrap tw-items-center tw-gap-4">
                      {status !== 'Completed' && status !== 'Cancelled' ? (
                        <>
                          <button 
                            className="tw-bg-[#ffd700] hover:tw-bg-[#e5c100] tw-text-black tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-shadow-sm tw-flex tw-items-center tw-gap-2"
                            onClick={() => expObj?._id && navigate(`/package-details/${expObj._id}`)}
                          >
                            {lang === 'AR' ? 'عرض التفاصيل' : 'View Itinerary'}
                            <i className="fa-solid fa-chevron-down tw-text-xs"></i>
                          </button>
                          
                          {/* Chatbot Support Button */}
                          <button 
                            className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-text-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors"
                            onClick={() => dispatch(setChatOpen(true))}
                          >
                            {lang === 'AR' ? 'الدعم الفني' : 'Support'}
                          </button>
                          
                          {/* Cancel Button */}
                          <button 
                            className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-red-500 hover:tw-text-red-500 dark:hover:tw-border-red-500 dark:hover:tw-text-red-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-ml-auto"
                            disabled={actionLoadingId === booking._id}
                            onClick={() => navigate(`/booking/${booking._id}/cancel`)}
                          >
                            {actionLoadingId === booking._id ? (
                              <><i className="fa-solid fa-spinner fa-spin tw-mr-2"></i> {lang === 'AR' ? 'جاري الإلغاء...' : 'Cancelling...'}</>
                            ) : (
                              <>{lang === 'AR' ? 'إلغاء الحجز' : 'Cancel'}</>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                           <button 
                            className="tw-bg-transparent tw-border tw-border-amber-500/30 tw-text-amber-600 dark:tw-text-amber-500 hover:tw-bg-amber-500/10 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-flex tw-items-center tw-gap-2"
                            onClick={() => toggleExpandPlan(booking._id)}
                          >
                            {lang === 'AR' ? 'عرض الذكريات' : 'View Memories'}
                          </button>
                          <button 
                            className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-text-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors"
                            onClick={() => expObj?._id && navigate(`/package-details/${expObj._id}`)}
                          >
                            {lang === 'AR' ? 'احجز مجدداً' : 'Book Again'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Assistance Section (Based on Screenshot) */}
        {token && bookings.length > 0 && !loading && !error && (
          <div className="tw-mt-24 tw-text-center tw-mb-12 tw-py-12 tw-border-t tw-border-slate-200 dark:tw-border-[#1f1f1f]">
            <h2 className="tw-font-serif tw-text-3xl md:tw-text-4xl tw-font-bold tw-text-[#ffd700] tw-mb-4">
              {lang === 'AR' ? 'هل تحتاج إلى مساعدة في رحلتك؟' : 'Need assistance with your journey?'}
            </h2>
            <p className="tw-text-slate-600 dark:tw-text-[#aaaaaa] tw-max-w-2xl tw-mx-auto tw-mb-8 tw-leading-relaxed tw-text-sm md:tw-text-base">
              {lang === 'AR' 
                ? 'مستشارو السفر النخبة لدينا متاحون على مدار الساعة طوال أيام الأسبوع لضمان أن يظل مسارك واضحاً وتجربتك لا تضاهى.' 
                : 'Our elite travel advisors are available 24/7 to ensure your path remains clear and your experience unparalleled.'}
            </p>
            <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-8 tw-text-sm tw-font-bold tw-text-[#ffd700]">
              <button className="tw-flex tw-items-center tw-gap-2 hover:tw-opacity-80 tw-transition-opacity" onClick={() => dispatch(setChatOpen(true))}>
                <i className="fa-solid fa-phone"></i>
                {lang === 'AR' ? 'كونسيرج مخصص' : 'Dedicated Concierge'}
              </button>
              <button className="tw-flex tw-items-center tw-gap-2 hover:tw-opacity-80 tw-transition-opacity" onClick={() => dispatch(setChatOpen(true))}>
                <i className="fa-solid fa-envelope"></i>
                {lang === 'AR' ? 'المراسلة الآمنة' : 'Secure Messaging'}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyBookings;
