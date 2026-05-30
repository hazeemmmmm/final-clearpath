import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserBookings, cancelBooking, createBooking } from '../utils/api';
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
  
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'saved'
  const [offlineChain, setOfflineChain] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const loadOfflineChain = () => {
    const chainStr = localStorage.getItem('clearpath_trip_chain');
    if (chainStr) {
      try {
        setOfflineChain(JSON.parse(chainStr));
      } catch (e) {
        console.error(e);
      }
    } else {
      setOfflineChain([]);
    }
  };

  useEffect(() => {
    loadOfflineChain();
    window.addEventListener('cartUpdate', loadOfflineChain);
    return () => window.removeEventListener('cartUpdate', loadOfflineChain);
  }, []);

  const handleCheckoutChain = async () => {
    if (offlineChain.length === 0) return;
    setCheckoutLoading(true);
    try {
      const createdBookingIds = [];
      for (const item of offlineChain) {
        let payload;
        if (item.isCustomizing && item.customTripId) {
          payload = { customTrip: item.customTripId, numberOfGuests: item.guestCount, selectedAddons: item.selectedAddons };
        } else {
          payload = { experienceId: item.id, numberOfGuests: item.guestCount, selectedAddons: item.selectedAddons };
        }
        
        const res = await createBooking(payload);
        const booking = res.data || res.booking || res;
        if (booking && booking._id) {
          createdBookingIds.push(booking._id);
        }
      }

      if (createdBookingIds.length > 0) {
        localStorage.removeItem('clearpath_trip_chain');
        setOfflineChain([]);
        window.dispatchEvent(new Event('cartUpdate'));
        
        alert(lang === 'AR' 
          ? 'تم إنشاء حجوزات السلسلة بنجاح! جاري تحديث قائمة رحلاتك.' 
          : 'Trip Chain bookings created successfully! Updating your bookings list.');
        
        await fetchBookings();
        setActiveTab('upcoming');
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'AR' ? 'فشل إتمام الحجز. يرجى المحاولة لاحقاً.' : 'Failed to complete booking. Please try again later.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleDeleteChainItem = (idxToDelete) => {
    const updated = offlineChain.filter((_, idx) => idx !== idxToDelete);
    setOfflineChain(updated);
    localStorage.setItem('clearpath_trip_chain', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdate'));
  };

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
        ) : (
          <>
            {/* Elegant Premium Tab Bar */}
            <div className="tw-flex tw-justify-center tw-mb-8 tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-md tw-p-1.5 tw-rounded-xl tw-border tw-border-slate-200/50 dark:tw-border-slate-800/80 tw-max-w-md tw-mx-auto tw-shadow-lg">
              <button 
                onClick={() => setActiveTab('upcoming')}
                style={{ border: 'none', cursor: 'pointer' }}
                className={`tw-flex-1 tw-py-2.5 tw-px-6 tw-rounded-lg tw-text-xs tw-font-bold tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-center tw-gap-2 ${
                  activeTab === 'upcoming' 
                    ? 'tw-bg-amber-500 tw-text-black tw-shadow-[0_4px_12px_rgba(245,158,11,0.2)]' 
                    : 'tw-bg-transparent tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-slate-900 dark:hover:tw-text-white'
                }`}
              >
                <i className="fa-solid fa-plane-circle-check"></i>
                {lang === 'AR' ? 'الرحلات المؤكدة والمدفوعة' : 'Paid & Confirmed Trips'}
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                style={{ border: 'none', cursor: 'pointer' }}
                className={`tw-flex-1 tw-py-2.5 tw-px-6 tw-rounded-lg tw-text-xs tw-font-bold tw-transition-all tw-duration-200 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-relative ${
                  activeTab === 'saved' 
                    ? 'tw-bg-amber-500 tw-text-black tw-shadow-[0_4px_12px_rgba(245,158,11,0.2)]' 
                    : 'tw-bg-transparent tw-text-slate-600 dark:tw-text-slate-400 hover:tw-text-slate-900 dark:hover:tw-text-white'
                }`}
              >
                <i className="fa-solid fa-folder-open"></i>
                {lang === 'AR' ? 'الرحلات المعلقة والمسارات' : 'Saved & Pending'}
                {offlineChain.length > 0 && (
                  <span className="tw-absolute tw-top-1 tw-right-2 tw-w-2 tw-h-2 tw-bg-rose-500 tw-rounded-full tw-animate-ping"></span>
                )}
              </button>
            </div>

            {/* Tab 1: Upcoming/Paid Trips */}
            {activeTab === 'upcoming' && (
              <div className="tw-flex tw-flex-col tw-gap-8">
                {bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length === 0 ? (
                  <div className="tw-flex tw-justify-center tw-py-16">
                    <div className="tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-12 tw-text-center tw-max-w-lg tw-w-full tw-shadow-xl">
                      <div className="tw-text-6xl tw-text-slate-300 dark:tw-text-slate-700 tw-mb-6"><i className="fa-solid fa-plane-departure"></i></div>
                      <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">{lang === 'AR' ? 'لا يوجد رحلات مؤكدة' : 'No confirmed trips'}</h3>
                      <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-leading-relaxed tw-mb-8">{lang === 'AR' ? 'لم تقم بحجز أو دفع أي رحلات بعد. استكشف باقاتنا الرائعة وابدأ السفر الآن!' : 'You do not have any paid or confirmed bookings yet. Explore our packages and start booking!'}</p>
                      <button className="tw-w-full tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-slate-900 tw-font-bold tw-py-3 tw-px-8 tw-rounded-md tw-transition-colors tw-border-none tw-cursor-pointer" onClick={() => navigate('/experiences')}>
                        {lang === 'AR' ? 'استكشف الرحلات والباقات' : 'Explore Packages'}
                      </button>
                    </div>
                  </div>
                ) : (
                  bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').map((booking) => {
                    const isCustom = !!booking.customTrip;
                    const expObj = booking.experience || booking.customTrip?.experience;
                    const title = expObj?.name || (isCustom ? (lang === 'AR' ? 'رحلة مخصصة' : 'Custom Trip') : (lang === 'AR' ? 'باقة سياحية مميزة' : 'Premium Package'));
                    const image = expObj?.images?.[0] || expObj?.image || '/logo-dark.png';
                    const locationName = expObj?.destination?.name || (lang === 'AR' ? 'مصر' : 'Egypt');
                    
                    const bookingDate = booking.booking_date
                      ? new Date(booking.booking_date).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                      : '—';

                    const guests = booking.numberOfGuests || 1;
                    const status = booking.status || 'Pending';
                    
                    let statusClasses = "tw-border-amber-500/40 tw-text-amber-600 dark:tw-text-amber-500 tw-bg-amber-500/10";
                    let statusText = lang === 'AR' ? 'مؤكد' : 'CONFIRMED';
                    
                    if (status === 'Completed') {
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
                          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between sm:tw-items-center tw-mb-4 tw-gap-3">
                            <div className="tw-flex tw-gap-2 tw-flex-wrap">
                              <div className={`tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-border ${statusClasses} tw-text-[10px] tw-font-semibold tw-tracking-widest tw-uppercase tw-w-fit`}>
                                {statusText}
                              </div>
                              {booking.parentBooking && (
                                <div className="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-border tw-border-amber-500/30 tw-text-amber-500 tw-bg-amber-500/5 tw-text-[10px] tw-font-semibold tw-tracking-widest tw-uppercase tw-w-fit" title="Chained/sequential package booking">
                                  ⛓️ {lang === 'AR' ? 'حجز متسلسل' : 'CHAINED'}
                                </div>
                              )}
                            </div>
                            <div className="tw-text-slate-500 dark:tw-text-[#666666] tw-text-xs tw-font-medium">
                              Booking ID: <span className="tw-font-mono">{booking._id.substring(0,8).toUpperCase()}</span>
                            </div>
                          </div>

                          <h2 className="tw-font-serif tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4 tw-leading-tight">
                            {title}
                          </h2>

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

                          <div className="tw-mt-auto tw-flex tw-flex-wrap tw-items-center tw-gap-4">
                            {status !== 'Completed' ? (
                              <>
                                <button 
                                  className="tw-bg-[#ffd700] hover:tw-bg-[#e5c100] tw-text-black tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-shadow-sm tw-flex tw-items-center tw-gap-2 tw-border-none tw-cursor-pointer"
                                  onClick={() => expObj?._id && navigate(`/package-details/${expObj._id}`)}
                                >
                                  {lang === 'AR' ? 'عرض التفاصيل' : 'View Itinerary'}
                                  <i className="fa-solid fa-chevron-down tw-text-xs"></i>
                                </button>
                                <button 
                                  className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-cursor-pointer"
                                  onClick={() => dispatch(setChatOpen(true))}
                                >
                                  {lang === 'AR' ? 'الدعم الفني' : 'Support'}
                                </button>
                                <button 
                                  className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-red-500 hover:tw-text-red-500 dark:hover:tw-border-red-500 dark:hover:tw-text-red-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-ml-auto tw-cursor-pointer"
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
                                  className="tw-bg-transparent tw-border tw-border-amber-500/30 tw-text-amber-600 dark:tw-text-amber-500 hover:tw-bg-amber-500/10 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-flex tw-items-center tw-gap-2 tw-cursor-pointer"
                                  onClick={() => toggleExpandPlan(booking._id)}
                                >
                                  {lang === 'AR' ? 'عرض الذكريات' : 'View Memories'}
                                </button>
                                <button 
                                  className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-cursor-pointer"
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
                  })
                )}
              </div>
            )}

            {/* Tab 2: Saved / Pending Itineraries */}
            {activeTab === 'saved' && (
              <div className="tw-flex tw-flex-col tw-gap-8">
                
                {/* 🌟 Glowing Alert for Incomplete offline localStorage Chain */}
                {offlineChain.length > 0 && (
                  <div className="tw-bg-gradient-to-r tw-from-amber-500/10 tw-via-amber-500/5 tw-to-transparent tw-border-l-4 tw-border-amber-500 tw-rounded-r-2xl tw-p-6 tw-mb-4 tw-shadow-[0_4px_20px_rgba(245,158,11,0.08)]">
                    <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-gap-4">
                      <div className="tw-flex-1">
                        <h4 className="tw-text-lg tw-font-bold tw-text-amber-500 tw-flex tw-items-center tw-gap-2 tw-mb-1.5">
                          <i className="fa-solid fa-triangle-exclamation"></i>
                          {lang === 'AR' ? 'عندك رحلة غير مكتملة، كمل الدفع الآن!' : 'You have an incomplete trip chain! Complete payment now.'}
                        </h4>
                        <p className="tw-text-xs tw-text-slate-600 dark:tw-text-slate-400 tw-mb-4">
                          {lang === 'AR' 
                            ? 'لقد قمت بتجميع باقات رحلات مسبقاً ولم تكتمل عملية الدفع بعد. يمكنك استكمال الدفع وحجز كامل السلسلة بضغطة زر واحدة.'
                            : 'You have compiled trip packages that are still pending payment. Secure all packages in your itinerary chain instantly.'}
                        </p>
                        
                        {/* Mini Chain list */}
                        <div className="tw-flex tw-flex-col tw-gap-3 tw-bg-black/35 tw-p-4 tw-rounded-xl tw-border tw-border-slate-800/80">
                          {offlineChain.map((item, idx) => (
                            <div key={idx} className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-text-xs">
                              <span className="tw-text-white tw-font-semibold tw-flex tw-items-center tw-gap-2">
                                <i className="fa-solid fa-link tw-text-amber-500/80"></i>
                                {item.name} ({item.guestCount} {lang === 'AR' ? 'مسافر' : 'Guests'})
                              </span>
                              <div className="tw-flex tw-items-center tw-gap-3">
                                <span className="tw-text-amber-500 tw-font-bold">{item.totalPrice} EGP</span>
                                <button 
                                  onClick={() => handleDeleteChainItem(idx)}
                                  className="tw-bg-transparent tw-border-none tw-text-rose-500 hover:tw-text-rose-400 tw-cursor-pointer"
                                  title="Delete"
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                          <div className="tw-flex tw-justify-between tw-items-center tw-pt-3 tw-border-t tw-border-slate-800/80 tw-text-sm tw-font-bold">
                            <span className="tw-text-slate-400">{lang === 'AR' ? 'المجموع الكلي للسلسلة:' : 'Total Chain Price:'}</span>
                            <span className="tw-text-amber-500 tw-text-lg">{offlineChain.reduce((sum, item) => sum + item.totalPrice, 0)} EGP</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckoutChain}
                        disabled={checkoutLoading}
                        className="tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-black tw-font-extrabold tw-py-4 tw-px-8 tw-rounded-xl tw-transition-colors tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-border-none tw-cursor-pointer tw-text-sm tw-flex-shrink-0 tw-h-fit"
                      >
                        {checkoutLoading ? (
                          <><i className="fa-solid fa-circle-notch fa-spin"></i> {lang === 'AR' ? 'جاري الحجز...' : 'Booking...'}</>
                        ) : (
                          <><i className="fa-solid fa-credit-card"></i> {lang === 'AR' ? 'حجز وإتمام الدفع للسلسلة' : 'Book & Pay Chain'}</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Database Pending Bookings List */}
                {bookings.filter(b => b.status === 'Pending' || b.status === 'Cancelled').length === 0 && offlineChain.length === 0 ? (
                  <div className="tw-flex tw-justify-center tw-py-16">
                    <div className="tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-12 tw-text-center tw-max-w-lg tw-w-full tw-shadow-xl">
                      <div className="tw-text-6xl tw-text-slate-300 dark:tw-text-slate-700 tw-mb-6"><i className="fa-solid fa-folder-open"></i></div>
                      <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">{lang === 'AR' ? 'لا توجد حجوزات معلقة' : 'No pending itineraries'}</h3>
                      <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-leading-relaxed tw-mb-8">{lang === 'AR' ? 'لا توجد أي حجوزات معلقة أو مسارات رحلات محفوظة حالياً.' : 'You have no pending bookings or saved trip itineraries at the moment.'}</p>
                    </div>
                  </div>
                ) : (
                  bookings.filter(b => b.status === 'Pending' || b.status === 'Cancelled').map((booking) => {
                    const isCustom = !!booking.customTrip;
                    const expObj = booking.experience || booking.customTrip?.experience;
                    const title = expObj?.name || (isCustom ? (lang === 'AR' ? 'رحلة مخصصة' : 'Custom Trip') : (lang === 'AR' ? 'باقة سياحية مميزة' : 'Premium Package'));
                    const image = expObj?.images?.[0] || expObj?.image || '/logo-dark.png';
                    const locationName = expObj?.destination?.name || (lang === 'AR' ? 'مصر' : 'Egypt');
                    
                    const bookingDate = booking.booking_date
                      ? new Date(booking.booking_date).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                      : '—';

                    const guests = booking.numberOfGuests || 1;
                    const status = booking.status || 'Pending';
                    
                    let statusClasses = "tw-border-slate-500 tw-text-slate-500 tw-bg-slate-500/10";
                    let statusText = lang === 'AR' ? 'قيد الانتظار' : 'PENDING';
                    
                    if (status === 'Cancelled') {
                      statusClasses = "tw-border-slate-500/40 tw-text-slate-500 dark:tw-text-slate-500 tw-bg-slate-500/10";
                      statusText = lang === 'AR' ? 'ملغي' : 'CANCELLED';
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
                          <div className="tw-flex tw-flex-col sm:tw-flex-row sm:tw-justify-between sm:tw-items-center tw-mb-4 tw-gap-3">
                            <div className="tw-flex tw-gap-2 tw-flex-wrap">
                              <div className={`tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-border ${statusClasses} tw-text-[10px] tw-font-semibold tw-tracking-widest tw-uppercase tw-w-fit`}>
                                {statusText}
                              </div>
                            </div>
                            <div className="tw-text-slate-500 dark:tw-text-[#666666] tw-text-xs tw-font-medium">
                              Booking ID: <span className="tw-font-mono">{booking._id.substring(0,8).toUpperCase()}</span>
                            </div>
                          </div>

                          <h2 className="tw-font-serif tw-text-2xl md:tw-text-3xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4 tw-leading-tight">
                            {title}
                          </h2>

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

                          <div className="tw-mt-auto tw-flex tw-flex-wrap tw-items-center tw-gap-4">
                            {status === 'Pending' && (
                              <>
                                <button 
                                  className="tw-bg-[#ffd700] hover:tw-bg-[#e5c100] tw-text-black tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-shadow-sm tw-flex tw-items-center tw-gap-2 tw-border-none tw-cursor-pointer"
                                  onClick={() => {
                                    localStorage.setItem('currentBookingId', booking._id);
                                    navigate('/payment');
                                  }}
                                >
                                  {lang === 'AR' ? 'دفع قيمة الرحلة' : 'Pay Now'}
                                  <i className="fa-solid fa-credit-card tw-text-xs"></i>
                                </button>
                                <button 
                                  className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-cursor-pointer"
                                  onClick={() => dispatch(setChatOpen(true))}
                                >
                                  {lang === 'AR' ? 'الدعم الفني' : 'Support'}
                                </button>
                              </>
                            )}
                            {status === 'Cancelled' && (
                              <button 
                                className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-border-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-cursor-pointer"
                                onClick={() => expObj?._id && navigate(`/package-details/${expObj._id}`)}
                              >
                                {lang === 'AR' ? 'احجز مجدداً' : 'Book Again'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
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
