import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getUserBookings, cancelBooking, createBooking, combineDestination } from '../utils/api';
import { LanguageContext } from '../context/LanguageContext';
import { setChatOpen } from '../store/authSlice';

const isPaidBooking = (booking) =>
  booking?.status === 'Confirmed' ||
  booking?.status === 'Completed' ||
  booking?.payment_status === 'completed';

const bookingIdStr = (id) => (id?._id || id)?.toString?.() || '';

const resolveCombinedExperiences = (booking) => {
  const seen = new Set();
  const items = [];
  const add = (sub) => {
    if (!sub) return;
    const id = (sub._id || sub.packageId)?.toString?.() || String(sub.name);
    if (seen.has(id)) return;
    seen.add(id);
    items.push(sub);
  };
  (booking.customTrip?.combinedExperiences || []).forEach(add);
  (booking.snapshot?.combinedPackages || []).forEach((p) =>
    add({
      _id: p.packageId,
      name: p.title,
      image: p.image,
      base_price: p.base_price,
      price: p.base_price,
    })
  );
  return items;
};

const resolveChainItems = (booking, allBookings = []) => {
  const seen = new Set();
  const items = [];
  const add = (sub) => {
    if (!sub) return;
    const id = bookingIdStr(sub._id || sub.packageId) || String(sub.name);
    if (!id || seen.has(id)) return;
    seen.add(id);
    items.push(sub);
  };

  resolveCombinedExperiences(booking).forEach(add);

  (booking.sequentialBookings || []).forEach((seq) => {
    if (!seq || typeof seq !== 'object') return;
    add({
      _id: seq._id,
      name: seq.snapshot?.title || seq.experience?.name || seq.customTrip?.experience?.name,
      title: seq.snapshot?.title,
      image: seq.snapshot?.image || seq.experience?.images?.[0] || seq.experience?.image,
      base_price: seq.total_amount,
      price: seq.total_amount,
      destination: seq.experience?.destination,
    });
  });

  allBookings.forEach((child) => {
    const parentId = bookingIdStr(child.parentBooking);
    if (parentId && parentId === bookingIdStr(booking._id)) {
      add({
        _id: child._id,
        name: child.snapshot?.title || child.experience?.name || child.customTrip?.experience?.name,
        title: child.snapshot?.title,
        image: child.snapshot?.image || child.experience?.images?.[0] || child.experience?.image,
        base_price: child.total_amount,
        price: child.total_amount,
        destination: child.experience?.destination,
      });
    }
  });

  return items;
};

const isChildOfPaidParent = (booking, paidBookings) => {
  const parentId = bookingIdStr(booking.parentBooking);
  if (!parentId) return false;
  return paidBookings.some((p) => bookingIdStr(p._id) === parentId);
};

const buildFlattenedPaidCards = (paidBookings, allBookings = []) => {
  const allPaidCards = [];
  const rootPaidBookings = paidBookings.filter((b) => !isChildOfPaidParent(b, paidBookings));

  rootPaidBookings.forEach((booking) => {
    const snapshot = booking.snapshot || {};
    const expObj = booking.experience || booking.customTrip?.experience;
    const chainItems = resolveChainItems(booking, allBookings);
    const chainSum = chainItems.reduce(
      (sum, sub) => sum + (Number(sub.base_price) || Number(sub.price) || 0),
      0
    );

    const parentDisplayPrice = Number(booking.total_amount) || Number(expObj?.price) || 0;

    allPaidCards.push({
      ...booking,
      cardKey: `${bookingIdStr(booking._id)}-parent`,
      displayTitle: snapshot.title || expObj?.name || 'Premium Package',
      displayImage: snapshot.image || expObj?.images?.[0] || expObj?.image || '/logo-dark.png',
      displayPrice: parentDisplayPrice,
      displayLocation: expObj?.destination?.name || 'Egypt',
      isChainedChild: false,
      isCustomizedParent: !!booking.customTrip || chainItems.length > 0,
      chainCombinedCount: chainItems.length,
    });

    chainItems.forEach((subExp, idx) => {
      allPaidCards.push({
        ...booking,
        cardKey: `${bookingIdStr(subExp._id) || idx}-${bookingIdStr(booking._id)}`,
        displayTitle: subExp.name || subExp.title || 'Chained Trip',
        displayImage: subExp.image || subExp.images?.[0] || '/logo-dark.png',
        displayPrice: Number(subExp.base_price) || Number(subExp.price) || 0,
        displayLocation: subExp.destination?.name || expObj?.destination?.name || 'Egypt',
        isChainedChild: true,
        isCustomizedParent: false,
        chainCombinedCount: 0,
      });
    });
  });

  return allPaidCards;
};

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
  
  // Cancellation Policy Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingItem, setCancelBookingItem] = useState(null);
  const [cancelPolicy, setCancelPolicy] = useState({ feePercent: 0, feeAmount: 0 });
  const [expandedBookingId, setExpandedBookingId] = useState(null);

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
      const createdBookingIds = [];
      const firstItem = tripChain[0];

      let previousBookingId = null;
      for (const item of tripChain) {
        let payload;
        if (item.isCustomized && item.customTripId) {
          payload = {
            customTrip: item.customTripId,
            numberOfGuests: item.guestCount,
            selectedAddons: item.selectedAddons || [],
            parentBookingId: previousBookingId,
          };
        } else {
          payload = {
            experienceId: item.id,
            numberOfGuests: item.guestCount,
            selectedAddons: item.selectedAddons || [],
            parentBookingId: previousBookingId,
          };
        }
        const res = await createBooking(payload);
        const booking = res.booking || res.data || res;
        if (booking?._id) {
          createdBookingIds.push(booking._id);
          previousBookingId = booking._id;
        }
      }

      localStorage.removeItem('clearpath_trip_chain');
      setTripChain([]);
      window.dispatchEvent(new Event('tripChainUpdated'));

      if (createdBookingIds.length > 0) {
        localStorage.setItem('currentChainBookingIds', JSON.stringify(createdBookingIds));
        localStorage.setItem('currentBookingId', createdBookingIds[0]);
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

  const initiateCancellation = (booking) => {
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

    setCancelBookingItem(booking);
    setCancelPolicy({ feePercent, feeAmount });
    setShowCancelModal(true);
  };

  const executeCancelBooking = async () => {
    if (!cancelBookingItem) return;
    setActionLoadingId(cancelBookingItem._id);
    try {
      await cancelBooking(cancelBookingItem._id);
      await fetchBookings();
      setShowCancelModal(false);
      setCancelBookingItem(null);
      alert(lang === 'AR' ? 'تم إلغاء الحجز بنجاح وتحديث القائمة.' : 'Booking cancelled successfully and list updated.');
    } catch (err) {
      const errorMsg = lang === 'AR'
        ? 'فشل إلغاء الحجز. حاول مرة أخرى أو تواصل مع الدعم.'
        : (err.message || 'Failed to cancel the booking. Try again or contact support.');
      alert(errorMsg);
    } finally {
      setActionLoadingId(null);
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
                const paidBookings = bookings.filter(isPaidBooking);
                const allPaidCards = buildFlattenedPaidCards(paidBookings, bookings);

                const chainTotals = paidBookings.reduce((acc, b) => {
                  if (resolveChainItems(b, bookings).length > 0) {
                    acc[bookingIdStr(b._id)] = Number(b.total_amount) || 0;
                  }
                  return acc;
                }, {});

                return allPaidCards.length === 0 ? (
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
                  <div className="tw-flex tw-flex-col tw-gap-6">
                    {allPaidCards.map((card) => {
                      const booking = card;
                      const guests = booking.numberOfGuests || 1;
                      const bookingDate = booking.booking_date
                        ? new Date(booking.booking_date).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                        : '—';
                      const expObj = booking.experience || booking.customTrip?.experience;
                      const snapshot = booking.snapshot || {};

                      return (
                        <div key={card.cardKey} className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-slate-200 dark:tw-border-[#1f1f1f] tw-rounded-lg tw-overflow-hidden tw-shadow-sm hover:tw-shadow-xl tw-transition-all tw-flex tw-flex-col">
                          <div className="tw-flex tw-flex-col md:tw-flex-row">
                          <div className="tw-relative md:tw-w-1/3 tw-h-48 md:tw-h-auto tw-min-h-[180px]">
                            <img src={card.displayImage} alt={card.displayTitle} className="tw-w-full tw-h-full tw-object-cover" />
                            <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/60 tw-to-transparent md:tw-hidden"></div>
                          </div>

                          <div className="md:tw-w-2/3 tw-p-6 tw-flex tw-flex-col">
                            <div className="tw-flex tw-justify-between tw-items-start tw-mb-3 tw-gap-3">
                              <span className={`tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-border tw-text-[10px] tw-font-semibold tw-tracking-widest tw-uppercase ${
                                card.isChainedChild
                                  ? 'tw-border-amber-500/40 tw-text-amber-500 tw-bg-amber-500/10'
                                  : card.isCustomizedParent
                                  ? 'tw-border-amber-500/40 tw-text-amber-500 tw-bg-amber-500/10'
                                  : 'tw-border-emerald-500/40 tw-text-emerald-500 tw-bg-emerald-500/10'
                              }`}>
                                {card.isChainedChild
                                  ? (lang === 'AR' ? '⛓️ رحلة تابعة متصلة' : '⛓️ CHAIN ITEM')
                                  : card.isCustomizedParent
                                  ? (lang === 'AR' ? '⛓️ رحلة مخصصة تجميعية' : '⛓️ CUSTOMIZED CHAIN ITEM')
                                  : (lang === 'AR' ? '✅ مدفوع ومؤكد' : '✅ PAID & CONFIRMED')}
                              </span>
                              {!card.isChainedChild && bookingIdStr(booking._id) && (
                                <span className="tw-text-slate-500 dark:tw-text-[#666] tw-text-xs tw-font-mono">
                                  #{bookingIdStr(booking._id).substring(0, 8).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <h2 className="tw-font-serif tw-text-xl md:tw-text-2xl tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-3 tw-leading-tight">
                              {card.displayTitle}
                            </h2>

                            <div className="tw-flex tw-flex-wrap tw-gap-x-6 tw-gap-y-2 tw-mb-4 tw-text-sm tw-text-slate-600 dark:tw-text-[#cccccc]">
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
                                <span>{card.displayLocation}</span>
                              </div>
                            </div>

                            <div className="tw-mt-auto tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-4">
                              <div className="tw-flex tw-flex-wrap tw-gap-3">
                                {!card.isChainedChild && (
                                  <>
                                    <button
                                      className="tw-bg-[#ffd700] hover:tw-bg-[#e5c100] tw-text-black tw-font-medium tw-py-2.5 tw-px-6 tw-rounded-sm tw-text-sm tw-border-none tw-cursor-pointer"
                                      onClick={() => setExpandedBookingId(expandedBookingId === card.cardKey ? null : card.cardKey)}
                                    >
                                      {lang === 'AR' ? 'عرض التفاصيل' : 'View Details'}
                                      <i className={`fa-solid ${expandedBookingId === card.cardKey ? 'fa-chevron-up' : 'fa-chevron-down'} tw-ml-2 tw-text-xs`}></i>
                                    </button>
                                    <button
                                      className="tw-bg-transparent tw-border tw-border-[#333] tw-text-[#aaa] hover:tw-border-amber-500 hover:tw-text-amber-500 tw-font-medium tw-py-2.5 tw-px-6 tw-rounded-sm tw-text-sm tw-cursor-pointer"
                                      onClick={() => initiateCancellation(booking)}
                                    >
                                      {lang === 'AR' ? 'إلغاء' : 'Cancel'}
                                    </button>
                                  </>
                                )}
                              </div>
                              <div className="tw-text-right">
                                <span className="tw-block tw-text-xs tw-text-slate-400 tw-mb-1">
                                  {lang === 'AR' ? 'السعر المحسوب بدقة:' : 'Precise Price:'}
                                </span>
                                <span className="tw-text-2xl tw-font-black tw-text-amber-500">
                                  {Number(card.displayPrice).toLocaleString()} EGP
                                </span>
                              </div>
                            </div>
                          </div>
                          </div>

                          {!card.isChainedChild && expandedBookingId === card.cardKey && (
                            <div className="tw-w-full tw-p-6 md:tw-p-8 tw-bg-slate-50 dark:tw-bg-[#0d0e10] tw-border-t tw-border-slate-200 dark:tw-border-[#1f1f1f]">
                              <h3 className="tw-text-lg tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4">
                                📋 {lang === 'AR' ? 'تفاصيل الحجز المؤكدة' : 'Confirmed Booking Details'}
                              </h3>
                              <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-3 tw-gap-4 tw-mb-6">
                                <div className="tw-bg-[#15171a] tw-p-4 tw-rounded-xl tw-border tw-border-slate-800">
                                  <span className="tw-block tw-text-[10px] tw-text-slate-400 tw-font-bold tw-uppercase tw-mb-1">💰 {lang === 'AR' ? 'إجمالي السلسلة' : 'CHAIN TOTAL'}</span>
                                  <span className="tw-text-sm tw-font-black tw-text-amber-500">
                                    {(chainTotals[bookingIdStr(booking._id)] ?? booking.total_amount)?.toLocaleString()} EGP
                                  </span>
                                </div>
                                <div className="tw-bg-[#15171a] tw-p-4 tw-rounded-xl tw-border tw-border-slate-800">
                                  <span className="tw-block tw-text-[10px] tw-text-slate-400 tw-font-bold tw-uppercase tw-mb-1">🏨 {lang === 'AR' ? 'الفندق' : 'HOTEL'}</span>
                                  <span className="tw-text-sm tw-font-semibold tw-text-white">{snapshot.hotel || '5-Star Premium Hotel'}</span>
                                </div>
                                <div className="tw-bg-[#15171a] tw-p-4 tw-rounded-xl tw-border tw-border-slate-800">
                                  <span className="tw-block tw-text-[10px] tw-text-slate-400 tw-font-bold tw-uppercase tw-mb-1">🚗 {lang === 'AR' ? 'النقل' : 'TRANSPORT'}</span>
                                  <span className="tw-text-sm tw-font-semibold tw-text-white">{snapshot.transportation || 'Private AC Sedan'}</span>
                                </div>
                              </div>
                              {(snapshot.itinerary || expObj?.itinerary || []).slice(0, 3).map((day, dIdx) => (
                                <div key={dIdx} className="tw-bg-[#15171a] tw-p-4 tw-rounded-xl tw-border tw-border-slate-800 tw-mb-3">
                                  <span className="tw-text-xs tw-font-bold tw-text-amber-500">
                                    {lang === 'AR' ? `اليوم ${day.day_number || dIdx + 1}` : `Day ${day.day_number || dIdx + 1}`}
                                  </span>
                                  <h5 className="tw-text-sm tw-font-bold tw-text-white">{day.title}</h5>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {Object.keys(chainTotals).length > 0 && (
                      <div className="tw-bg-slate-900/60 tw-border tw-border-slate-800/80 tw-rounded-2xl tw-p-6 tw-mt-2">
                        <div className="tw-flex tw-justify-between tw-items-center">
                          <span className="tw-text-slate-400 tw-font-bold">
                            {lang === 'AR' ? 'المجموع الكلي للسلسلة بالكامل:' : 'Total Cost of Whole Chain:'}
                          </span>
                          <span className="tw-text-2xl tw-font-black tw-text-amber-500">
                            {Object.values(chainTotals).reduce((a, b) => a + b, 0).toLocaleString()} EGP
                          </span>
                        </div>
                      </div>
                    )}
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
                            <div key={booking._id} className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-slate-200 dark:tw-border-[#1f1f1f] tw-rounded-lg tw-overflow-hidden tw-shadow-sm hover:tw-shadow-xl tw-transition-all tw-flex tw-flex-col">
                              <div className="tw-flex tw-flex-col md:tw-flex-row">
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
                                          className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-text-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-cursor-pointer"
                                          onClick={() => dispatch(setChatOpen(true))}
                                        >
                                          {lang === 'AR' ? 'الدعم الفني' : 'Support'}
                                        </button>
                                        <button 
                                          className="tw-bg-transparent tw-border tw-border-red-500/30 hover:tw-border-red-500 tw-text-red-500 hover:tw-bg-red-500/10 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-cursor-pointer"
                                          onClick={() => initiateCancellation(booking)}
                                        >
                                          {lang === 'AR' ? 'إلغاء الرحلة' : 'Cancel'}
                                        </button>
                                      </>
                                    )}
                                    {status === 'Cancelled' && (
                                      <button 
                                        className="tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-amber-500 hover:tw-text-amber-500 dark:hover:tw-border-amber-500 dark:hover:tw-text-amber-500 tw-font-medium tw-py-2.5 tw-px-8 tw-rounded-sm tw-text-sm tw-transition-colors tw-cursor-pointer"
                                        onClick={() => expObj?._id && navigate(`/package-details/${expObj._id}`)}
                                      >
                                        {lang === 'AR' ? 'احجز مجدداً' : 'Book Again'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Chained Trips / Extensions under primary card */}
                              {booking.customTrip?.combinedExperiences && booking.customTrip.combinedExperiences.length > 0 && (
                                <div className="tw-px-6 tw-pb-6 tw-bg-slate-50/50 dark:tw-bg-[#0b0c0d] tw-border-t tw-border-slate-100 dark:tw-border-slate-800 tw-pt-4">
                                  <h4 className="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-3 tw-flex tw-items-center tw-gap-1.5">
                                    <i className="fa-solid fa-link tw-text-amber-500"></i>
                                    {lang === 'AR' ? 'رحلات تابعة ممتدة (Chained Extensions):' : 'Chained Trip Extensions:'}
                                  </h4>
                                  <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
                                    {booking.customTrip.combinedExperiences.map((subExp, subIdx) => {
                                      const subTitle = subExp.name || (lang === 'AR' ? 'رحلة تابعة' : 'Extension Trip');
                                      const subImg = subExp.image || (subExp.images && subExp.images[0]) || '/logo-dark.png';
                                      const subPrice = subExp.base_price || subExp.price || 0;
                                      return (
                                        <div key={subIdx} className="tw-flex tw-items-center tw-gap-3 tw-bg-white dark:tw-bg-[#15171a] tw-p-3 tw-rounded-xl tw-border tw-border-slate-200 dark:tw-border-slate-800">
                                          <img src={subImg} alt={subTitle} className="tw-w-14 tw-h-14 tw-rounded-lg tw-object-cover tw-border tw-border-slate-200 dark:tw-border-slate-800" />
                                          <div className="tw-flex-grow tw-min-w-0">
                                            <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                              <span className="tw-inline-flex tw-items-center tw-px-1.5 tw-py-0.5 tw-rounded tw-border tw-border-amber-500/30 tw-text-amber-500 tw-bg-amber-500/5 tw-text-[9px] tw-font-extrabold tw-tracking-wide tw-uppercase">
                                                ⛓️ {lang === 'AR' ? 'رحلة تابعة' : 'CHAINED TRIP'}
                                              </span>
                                            </div>
                                            <span className="tw-block tw-text-xs tw-font-bold tw-text-slate-950 dark:tw-text-white tw-truncate">{subTitle}</span>
                                            <span className="tw-block tw-text-[10px] tw-text-slate-400">{lang === 'AR' ? `السعر الأساسي: ${subPrice} ج.م` : `Base Price: ${subPrice} EGP`}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Snapshot Combined Packages under primary card in pending tab */}
                              {booking.snapshot?.combinedPackages && booking.snapshot.combinedPackages.length > 0 && (
                                <div className="tw-px-6 tw-pb-6 tw-bg-slate-50/50 dark:tw-bg-[#0b0c0d] tw-border-t tw-border-slate-100 dark:tw-border-slate-800 tw-pt-4">
                                  <h4 className="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-3 tw-flex tw-items-center tw-gap-1.5">
                                    <i className="fa-solid fa-link tw-text-amber-500"></i>
                                    {lang === 'AR' ? 'رحلات تابعة ممتدة (Chained Extensions):' : 'Chained Trip Extensions:'}
                                  </h4>
                                  <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
                                    {booking.snapshot.combinedPackages.map((subPkg, subIdx) => {
                                      const subTitle = subPkg.title || (lang === 'AR' ? 'رحلة تابعة' : 'Extension Trip');
                                      const subImg = subPkg.image || '/logo-dark.png';
                                      const subPrice = subPkg.base_price || 0;
                                      return (
                                        <div key={subIdx} className="tw-flex tw-items-center tw-gap-3 tw-bg-white dark:tw-bg-[#15171a] tw-p-3 tw-rounded-xl tw-border tw-border-slate-200 dark:tw-border-slate-800">
                                          <img src={subImg} alt={subTitle} className="tw-w-14 tw-h-14 tw-rounded-lg tw-object-cover tw-border tw-border-slate-200 dark:tw-border-slate-800" />
                                          <div className="tw-flex-grow tw-min-w-0">
                                            <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                              <span className="tw-inline-flex tw-items-center tw-px-1.5 tw-py-0.5 tw-rounded tw-border tw-border-amber-500/30 tw-text-amber-500 tw-bg-amber-500/5 tw-text-[9px] tw-font-extrabold tw-tracking-wide tw-uppercase">
                                                ⛓️ {lang === 'AR' ? 'رحلة تابعة' : 'CHAINED TRIP'}
                                              </span>
                                            </div>
                                            <span className="tw-block tw-text-xs tw-font-bold tw-text-slate-950 dark:tw-text-white tw-truncate">{subTitle}</span>
                                            <span className="tw-block tw-text-[10px] tw-text-slate-400">{lang === 'AR' ? `السعر الإجمالي: ${subPrice} ج.م` : `Total Price: ${subPrice} EGP`}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Sequential Bookings under primary card */}
                              {booking.sequentialBookings && booking.sequentialBookings.length > 0 && (
                                <div className="tw-px-6 tw-pb-6 tw-bg-slate-50/50 dark:tw-bg-[#0b0c0d] tw-border-t tw-border-slate-100 dark:tw-border-slate-800 tw-pt-4">
                                  <h4 className="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-3 tw-flex tw-items-center tw-gap-1.5">
                                    <i className="fa-solid fa-link tw-text-amber-500"></i>
                                    {lang === 'AR' ? 'رحلات متسلسلة مرتبطة (Sequential Bookings):' : 'Linked Chained Bookings (Sequential):'}
                                  </h4>
                                  <div className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-gap-4">
                                    {booking.sequentialBookings.map((seqBooking, seqIdx) => {
                                      const seqIsCustom = !!seqBooking.customTrip;
                                      const seqExpObj = seqBooking.experience || seqBooking.customTrip?.experience;
                                      const seqSnapshot = seqBooking.snapshot || {};
                                      
                                      const seqTitle = seqSnapshot.title || seqExpObj?.name || (seqIsCustom ? (lang === 'AR' ? 'رحلة مخصصة تابعة' : 'Custom Extension') : (lang === 'AR' ? 'رحلة تابعة' : 'Extension Trip'));
                                      const seqImg = seqSnapshot.image || seqExpObj?.images?.[0] || seqExpObj?.image || '/logo-dark.png';
                                      const seqPrice = seqBooking.total_amount || 0;
                                      
                                      return (
                                        <div key={seqBooking._id || seqIdx} className="tw-flex tw-items-center tw-gap-3 tw-bg-white dark:tw-bg-[#15171a] tw-p-3 tw-rounded-xl tw-border tw-border-slate-200 dark:tw-border-slate-800">
                                          <img src={seqImg} alt={seqTitle} className="tw-w-14 tw-h-14 tw-rounded-lg tw-object-cover tw-border tw-border-slate-200 dark:tw-border-slate-800" />
                                          <div className="tw-flex-grow tw-min-w-0">
                                            <div className="tw-flex tw-items-center tw-gap-1.5 tw-mb-0.5">
                                              <span className="tw-inline-flex tw-items-center tw-px-1.5 tw-py-0.5 tw-rounded tw-border tw-border-amber-500/30 tw-text-amber-500 tw-bg-amber-500/5 tw-text-[9px] tw-font-extrabold tw-tracking-wide tw-uppercase">
                                                ⛓️ {lang === 'AR' ? 'رحلة متسلسلة' : 'SEQUENTIAL TRIP'}
                                              </span>
                                            </div>
                                            <span className="tw-block tw-text-xs tw-font-bold tw-text-slate-950 dark:tw-text-white tw-truncate">{seqTitle}</span>
                                            <span className="tw-block tw-text-[10px] tw-text-slate-400">{lang === 'AR' ? `إجمالي المدفوع: ${seqPrice} ج.م` : `Total Paid: ${seqPrice} EGP`}</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
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

      {/* ⚠️ Cancellation Policy Modal Overlay */}
      {showCancelModal && cancelBookingItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #0e0f14 0%, #151720 100%)',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '520px',
            padding: '30px',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(239, 68, 68, 0.15)',
            boxSizing: 'border-box',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {/* Warning Icon */}
            <div style={{
              textAlign: 'center',
              marginBottom: '15px'
            }}>
              <i className="fa-solid fa-circle-exclamation" style={{
                fontSize: '3rem',
                color: '#ef4444',
                filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))'
              }}></i>
            </div>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h3 style={{
                fontSize: '1.6rem',
                fontWeight: '900',
                margin: '0 0 6px 0',
                color: '#fff'
              }}>
                {lang === 'AR' ? 'سياسة الإلغاء والاسترداد' : 'Cancellation Policy'}
              </h3>
              <p style={{
                color: '#94a3b8',
                fontSize: '0.85rem',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {lang === 'AR' ? 'إلغاء حجز:' : 'Cancelling:'}{' '}
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  {cancelBookingItem.experience?.name || cancelBookingItem.customTrip?.experience?.name || (lang === 'AR' ? 'رحلة مخصصة تجميعية' : 'Custom Trip')}
                </span>
              </p>
            </div>

            {/* Policy Items (Rows matching the mockup perfectly) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {/* Row 1: Free Cancellation */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1.5px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fa-solid fa-check" style={{ color: '#10b981', fontSize: '0.85rem' }}></i>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 'bold', color: '#fff' }}>
                      {lang === 'AR' ? 'خلال أول 24 ساعة' : 'Within First 24 Hours'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                      {lang === 'AR' ? 'استرداد كامل القيمة - بدون رسوم إلغاء' : 'Full refund — no charges at all'}
                    </p>
                  </div>
                </div>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontSize: '0.72rem',
                  fontWeight: '900',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>{lang === 'AR' ? 'مجاني' : 'FREE'}</span>
              </div>

              {/* Row 2: 10% Deduction */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1.5px solid #f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fa-regular fa-clock" style={{ color: '#f59e0b', fontSize: '0.85rem' }}></i>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 'bold', color: '#fff' }}>
                      {lang === 'AR' ? 'بعد أسبوع من الحجز' : 'After 1 Week of Booking'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                      {lang === 'AR' ? 'خصم 10% من إجمالي المبلغ المدفوع' : '10% deduction from total paid amount'}
                    </p>
                  </div>
                </div>
                <span style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#f59e0b',
                  fontSize: '0.72rem',
                  fontWeight: '900',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>-10%</span>
              </div>

              {/* Row 3: 50% Deduction */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1.5px solid #ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fa-regular fa-calendar-minus" style={{ color: '#ef4444', fontSize: '0.85rem' }}></i>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 'bold', color: '#fff' }}>
                      {lang === 'AR' ? 'قبل يومين من الرحلة' : '2 Days Before Trip'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                      {lang === 'AR' ? 'خصم 50% من إجمالي قيمة الحجز (نصف السعر)' : '50% deduction from total amount (half the price)'}
                    </p>
                  </div>
                </div>
                <span style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '0.72rem',
                  fontWeight: '900',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>-50%</span>
              </div>
            </div>

            {/* Row 4: Information Info Row */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '25px'
            }}>
              <i className="fa-solid fa-circle-info" style={{ color: '#3b82f6', fontSize: '0.9rem', marginTop: '2px' }}></i>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
                {lang === 'AR'
                  ? `سيتم إرجاع المبالغ المستردة المعتمدة إلى وسيلة الدفع الأصلية في غضون 5-10 أيام عمل بعد التأكيد النهائي. رسوم الإلغاء المحسوبة لرحلتك حالياً هي: ${cancelPolicy.feePercent}% (${cancelPolicy.feeAmount} EGP).`
                  : `Refunds will be credited to your original payment method within 5-10 business days after confirmation. Calculated fee for this booking: ${cancelPolicy.feePercent}% (${cancelPolicy.feeAmount} EGP).`}
              </span>
            </div>

            {/* Bottom Actions */}
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelBookingItem(null);
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '12px 20px',
                  borderRadius: '30px',
                  fontSize: '0.88rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {lang === 'AR' ? 'الرجوع للخلف' : 'Go Back'}
              </button>

              <button
                onClick={executeCancelBooking}
                disabled={actionLoadingId !== null}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '30px',
                  fontSize: '0.88rem',
                  fontWeight: 'extrabold',
                  cursor: actionLoadingId !== null ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => { if (actionLoadingId === null) e.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseLeave={(e) => { if (actionLoadingId === null) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {actionLoadingId !== null ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> {lang === 'AR' ? 'جاري الإلغاء...' : 'Cancelling...'}</>
                ) : (
                  <><i className="fa-solid fa-circle-minus"></i> {lang === 'AR' ? 'تأكيد إلغاء الرحلة' : 'Confirm Cancellation'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyBookings;
