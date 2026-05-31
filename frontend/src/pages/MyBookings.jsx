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

  const [activeTab, setActiveTab] = useState('paid');
  const [tripChain, setTripChain] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'pending' || tabParam === 'saved') {
      setActiveTab('pending');
    }
  }, []);

  const loadTripChain = () => {
    const chain = JSON.parse(localStorage.getItem('clearpath_trip_chain') || '[]');
    setTripChain(chain);
  };

  useEffect(() => {
    loadTripChain();
    window.addEventListener('tripChainUpdated', loadTripChain);
    return () => window.removeEventListener('tripChainUpdated', loadTripChain);
  }, []);

  const handleRemoveFromChain = (index) => {
    const newChain = [...tripChain];
    newChain.splice(index, 1);
    localStorage.setItem('clearpath_trip_chain', JSON.stringify(newChain));
    setTripChain(newChain);
    window.dispatchEvent(new Event('tripChainUpdated'));
  };

  const handleBookAndPayChain = async () => {
    if (tripChain.length === 0) return;
    try {
      setBookingLoading(true);
      let bookingId = null;
      for (const item of tripChain) {
        let res;
        if (item.isCustomized && item.customTripId) {
          res = await createBooking({ customTrip: item.customTripId, numberOfGuests: item.guestCount, selectedAddons: item.selectedAddons });
        } else {
          res = await createBooking({ experienceId: item.id, numberOfGuests: item.guestCount, selectedAddons: item.selectedAddons });
        }
        const booking = res.data || res.booking || res;
        if (booking && booking._id) {
          bookingId = booking._id;
        }
      }
      
      localStorage.removeItem('clearpath_trip_chain');
      setTripChain([]);
      window.dispatchEvent(new Event('tripChainUpdated'));
      
      if (bookingId) {
        localStorage.setItem('currentBookingId', bookingId);
        window.location.href = '/payment';
      } else {
        alert(lang === 'AR' ? 'تم إنشاء الحجوزات بنجاح!' : 'Bookings created successfully!');
        fetchBookings();
        setActiveTab('paid');
      }
    } catch (err) {
      console.error('Failed to book chain', err);
      alert(err.message || 'Failed to book the trip chain.');
    } finally {
      setBookingLoading(false);
    }
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
      setLoading(true);
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
            {/* Elegant Two-Tab Selector */}
            <div className="tw-flex tw-justify-center tw-mb-8 tw-border-b tw-border-slate-200 dark:tw-border-slate-800 tw-pb-4 tw-gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('paid')}
                className={`tw-pb-2 tw-px-4 tw-text-base tw-font-bold tw-transition-all tw-border-b-2 tw-bg-transparent tw-border-none tw-cursor-pointer ${
                  activeTab === 'paid'
                    ? 'tw-text-amber-500 tw-border-amber-500'
                    : 'tw-text-slate-400 tw-border-transparent hover:tw-text-slate-300'
                }`}
              >
                💼 {lang === 'AR' ? 'الرحلات المؤكدة والمدفوعة' : 'Paid & Confirmed Trips'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`tw-pb-2 tw-px-4 tw-text-base tw-font-bold tw-transition-all tw-border-b-2 tw-bg-transparent tw-border-none tw-cursor-pointer tw-relative ${
                  activeTab === 'pending'
                    ? 'tw-text-amber-500 tw-border-amber-500'
                    : 'tw-text-slate-400 tw-border-transparent hover:tw-text-slate-300'
                }`}
              >
                🔗 {lang === 'AR' ? 'الرحلات المعلقة والمسارات' : 'Saved & Pending'}
                {tripChain.length > 0 && (
                  <span className="tw-absolute -tw-top-1 -tw-right-3 tw-bg-amber-500 tw-text-slate-950 tw-text-[10px] tw-font-black tw-w-4 tw-h-4 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                    {tripChain.length}
                  </span>
                )}
              </button>
            </div>

            {activeTab === 'paid' ? (
              (() => {
                const paidBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed');
                return paidBookings.length === 0 ? (
                  <div className="tw-flex tw-justify-center tw-py-16">
                    <div className="tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-12 tw-text-center tw-max-w-lg tw-w-full tw-shadow-xl">
                      <div className="tw-text-6xl tw-text-slate-300 dark:tw-text-slate-700 tw-mb-6"><i className="fa-solid fa-plane-departure"></i></div>
                      <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">{lang === 'AR' ? 'لا يوجد حجوزات مدفوعة' : 'No paid bookings found'}</h3>
                      <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-leading-relaxed tw-mb-8">{lang === 'AR' ? 'لم تقم بحجز أو دفع قيمة أي رحلة بعد. كمل حجوزاتك وعيش المغامرة!' : 'You have no confirmed or completed bookings at the moment. Complete your adventure today!'}</p>
                      <button className="tw-w-full tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-slate-950 tw-font-bold tw-py-3 tw-px-8 tw-rounded-md tw-transition-colors" onClick={() => navigate('/experiences')}>
                        {lang === 'AR' ? 'استكشف الرحلات والباقات' : 'Explore Packages'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="tw-flex tw-flex-col tw-gap-8">
                    {paidBookings.map((booking) => {
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
                          <div className="tw-relative md:tw-w-1/3 tw-h-56 md:tw-h-auto">
                            <img src={image} alt={title} className="tw-w-full tw-h-full tw-object-cover" />
                            <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/60 tw-to-transparent md:tw-hidden"></div>
                          </div>

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
                              <button 
                                className="tw-bg-[#ffd700] hover:tw-bg-[#e5c100] tw-text-black tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-shadow-sm tw-flex tw-items-center tw-gap-2 tw-border-none tw-cursor-pointer"
                                onClick={() => expObj?._id && navigate(`/package-details/${expObj._id}`)}
                              >
                                {lang === 'AR' ? 'عرض التفاصيل' : 'View Itinerary'}
                                <i className="fa-solid fa-chevron-down tw-text-xs"></i>
                              </button>
                              
                              <button 
                                className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-text-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-cursor-pointer"
                                onClick={() => dispatch(setChatOpen(true))}
                              >
                                {lang === 'AR' ? 'الدعم الفني' : 'Support'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              <div>
                {/* 1. Trip Chain (localStorage) Section */}
                {tripChain.length > 0 && (
                  <div className="tw-mb-12">
                    <div className="tw-bg-amber-500/5 tw-border-2 tw-border-dashed tw-border-amber-500/30 tw-rounded-2xl tw-p-6 tw-mb-8 tw-text-center tw-animate-pulse tw-shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                      <h3 className="tw-text-xl tw-font-bold tw-text-amber-500 tw-mb-2">
                        ⚠️ {lang === 'AR' ? 'عندك رحلة غير مكتملة، كمل الدفع الآن!' : 'You have an incomplete trip chain! Complete payment now.'}
                      </h3>
                      <p className="tw-text-slate-300 tw-text-sm">
                        {lang === 'AR' 
                          ? 'لديك باقات سياحية مضافة في سلسلة الرحلات ولم تقم بحجزها بعد. أكمل السلسلة الآن للاستفادة من الرحلات المترابطة.' 
                          : 'You have travel packages assembled in your trip chain that are still pending. Secure them together in one click.'}
                      </p>
                    </div>

                    <div className="tw-flex tw-flex-col tw-gap-6 tw-mb-8">
                      {tripChain.map((item, idx) => (
                        <div key={idx} className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-slate-200 dark:tw-border-[#1f1f1f] tw-rounded-lg tw-overflow-hidden tw-shadow-sm hover:tw-shadow-xl tw-transition-all tw-flex tw-flex-col md:tw-flex-row tw-relative">
                          <div className="tw-relative md:tw-w-1/3 tw-h-48 md:tw-h-auto">
                            <img src={item.image} alt={item.name} className="tw-w-full tw-h-full tw-object-cover" />
                            <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/60 tw-to-transparent md:tw-hidden"></div>
                          </div>

                          <div className="md:tw-w-2/3 tw-p-6 tw-flex tw-flex-col">
                            <div className="tw-flex tw-justify-between tw-items-center tw-mb-2">
                              <span className="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-border tw-border-amber-500/30 tw-text-amber-500 tw-bg-amber-500/5 tw-text-[10px] tw-font-semibold tw-tracking-widest tw-uppercase tw-w-fit">
                                ⛓️ {item.isCustomized ? (lang === 'AR' ? 'رحلة مخصصة تجميعية' : 'CUSTOMIZED CHAIN ITEM') : (lang === 'AR' ? 'باقة تجميعية' : 'CHAIN ITEM')}
                              </span>
                              <button 
                                onClick={() => handleRemoveFromChain(idx)}
                                className="tw-text-red-500 hover:tw-text-red-600 tw-bg-transparent tw-border-none tw-cursor-pointer tw-text-sm"
                              >
                                <i className="fa-solid fa-trash-can tw-mr-1"></i> {lang === 'AR' ? 'حذف' : 'Remove'}
                              </button>
                            </div>

                            <h3 className="tw-font-serif tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-3">
                              {item.name}
                            </h3>

                            <div className="tw-flex tw-flex-wrap tw-gap-x-6 tw-gap-y-2 tw-mb-4 tw-text-sm tw-text-slate-600 dark:tw-text-[#cccccc]">
                              <div className="tw-flex tw-items-center tw-gap-2">
                                <i className="fa-solid fa-user-group tw-text-amber-500"></i>
                                <span>{item.guestCount} {item.guestCount === 1 ? (lang === 'AR' ? 'فرد' : 'Guests') : (lang === 'AR' ? 'أفراد' : 'Guests')}</span>
                              </div>
                            </div>

                            <div className="tw-mt-auto tw-flex tw-justify-between tw-items-center">
                              <span className="tw-text-xs tw-text-slate-400">{lang === 'AR' ? 'السعر المحسوب بدقة:' : 'Precise Price:'}</span>
                              <span className="tw-text-lg tw-font-black tw-text-amber-500">{item.price.toLocaleString()} EGP</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="tw-bg-slate-900/60 tw-border tw-border-slate-800/80 tw-rounded-2xl tw-p-6 tw-mb-8">
                      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
                        <span className="tw-text-slate-400 tw-font-bold">{lang === 'AR' ? 'المجموع الكلي للسلسلة بالكامل:' : 'Total Cost of Whole Chain:'}</span>
                        <span className="tw-text-2xl tw-font-black tw-text-amber-500">
                          {tripChain.reduce((sum, item) => sum + item.price, 0).toLocaleString()} EGP
                        </span>
                      </div>

                      <button
                        onClick={handleBookAndPayChain}
                        disabled={bookingLoading}
                        className="tw-w-full tw-bg-gradient-to-r tw-from-amber-500 tw-to-amber-600 hover:tw-from-amber-600 hover:tw-to-amber-700 tw-text-slate-950 tw-font-extrabold tw-py-4 tw-px-6 tw-rounded-xl tw-transition-all tw-shadow-[0_6px_25px_rgba(245,158,11,0.3)] tw-border-none tw-text-base tw-flex tw-items-center tw-justify-center tw-gap-2 tw-cursor-pointer"
                      >
                        {bookingLoading ? (
                          <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري إنشاء حجز السلسلة...' : 'Sequentially Booking Trip Chain...'}</>
                        ) : (
                          <><i className="fa-solid fa-wallet"></i> {lang === 'AR' ? 'حجز وإتمام الدفع للسلسلة' : 'Book & Pay Chain'}</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Database Pending & Cancelled Bookings Section */}
                <div>
                  <h3 className="tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-6 tw-border-b tw-border-slate-800/80 tw-pb-3">
                    💾 {lang === 'AR' ? 'حجوزات معلقة أو ملغاة من قاعدة البيانات' : 'Saved Bookings & History'}
                  </h3>
                  {(() => {
                    const dbPending = bookings.filter(b => b.status === 'Pending' || b.status === 'Cancelled');
                    return dbPending.length === 0 && tripChain.length === 0 ? (
                      <div className="tw-flex tw-justify-center tw-py-16">
                        <div className="tw-bg-white/80 dark:tw-bg-[#15171a]/80 tw-backdrop-blur-md tw-border tw-border-slate-200 dark:tw-border-slate-800 tw-rounded-2xl tw-p-12 tw-text-center tw-max-w-lg tw-w-full tw-shadow-xl">
                          <div className="tw-text-6xl tw-text-slate-300 dark:tw-text-slate-700 tw-mb-6"><i className="fa-solid fa-link-slash"></i></div>
                          <h3 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">{lang === 'AR' ? 'لا توجد حجوزات معلقة' : 'No Pending Itineraries'}</h3>
                          <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-leading-relaxed tw-mb-8">{lang === 'AR' ? 'ليست لديك أي باقات غير مكتملة أو حجوزات معلقة حالياً.' : 'You have no pending bookings or saved trip itineraries at the moment.'}</p>
                          <button className="tw-w-full tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-slate-900 tw-font-bold tw-py-3 tw-px-8 tw-rounded-md tw-transition-colors" onClick={() => navigate('/experiences')}>
                            {lang === 'AR' ? 'استكشف الباقات' : 'Explore Packages'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="tw-flex tw-flex-col tw-gap-8">
                        {dbPending.map((booking) => {
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
                              <div className="tw-relative md:tw-w-1/3 tw-h-56 md:tw-h-auto">
                                <img src={image} alt={title} className="tw-w-full tw-h-full tw-object-cover" />
                                <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/60 tw-to-transparent md:tw-hidden"></div>
                              </div>

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
                        })}
                      </div>
                    );
                  })()}
                </div>
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
