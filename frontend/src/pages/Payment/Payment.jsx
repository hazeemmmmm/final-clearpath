import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { processPayment, getBookingDetails, applyCoupon } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Payment.css';

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);         // single booking
  const [chainBookings, setChainBookings] = useState([]);       // multiple bookings (chain)
  const [selectedCurrency, setSelectedCurrency] = useState('EGP');
  const [message, setMessage] = useState('');

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);

  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('clearpath_access_token') || localStorage.getItem('token');
  const bookingId = localStorage.getItem('currentBookingId');

  // Detect chain booking mode
  const chainIdsRaw = localStorage.getItem('currentChainBookingIds');
  const chainBookingIds = chainIdsRaw ? JSON.parse(chainIdsRaw) : null;
  const isChainPayment = chainBookingIds && chainBookingIds.length > 1;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!token) {
      navigate('/login');
      return;
    }
    if (isChainPayment) {
      fetchAllChainBookings(chainBookingIds);
    } else if (bookingId) {
      fetchBookingInfo();
    } else {
      setBookingLoading(false);
    }
  }, [bookingId, token]);

  // Load a single booking
  const fetchBookingInfo = async () => {
    try {
      setBookingLoading(true);
      const res = await getBookingDetails(bookingId);
      const booking = res.booking || res.data || res;
      setBookingData(booking);
    } catch (err) {
      console.error('Failed to load booking details', err);
      setMessage(lang === 'AR' ? 'فشل في تحميل تفاصيل الحجز.' : 'Failed to load booking details.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Load ALL bookings in the chain
  const fetchAllChainBookings = async (ids) => {
    try {
      setBookingLoading(true);
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await getBookingDetails(id);
          return res.booking || res.data || res;
        })
      );
      const validBookings = results.filter(Boolean);
      setChainBookings(validBookings);

      // Sync local storage cart to match the real booked prices
      try {
        const chain = JSON.parse(localStorage.getItem('clearpath_trip_chain') || '[]');
        let updatedChain = false;
        const newChain = chain.map(item => {
          const matchedBooking = validBookings.find(b => {
            const bExpId = b.experience?._id || b.experience;
            const bCustomId = b.customTrip?._id || b.customTrip;
            return (bExpId && bExpId.toString() === item.id?.toString()) ||
                   (bCustomId && bCustomId.toString() === item.customTripId?.toString());
          });
          if (matchedBooking) {
            const realPrice = matchedBooking.total_amount || matchedBooking.totalPrice || matchedBooking.price || 0;
            if (item.price !== realPrice) {
              item.price = realPrice;
              updatedChain = true;
            }
          }
          return item;
        });
        if (updatedChain) {
          localStorage.setItem('clearpath_trip_chain', JSON.stringify(newChain));
          window.dispatchEvent(new Event('tripChainUpdated'));
        }
      } catch (storageErr) {
        console.error('Failed to sync trip chain storage:', storageErr);
      }

    } catch (err) {
      console.error('Failed to load chain booking details', err);
      setMessage(lang === 'AR' ? 'فشل في تحميل تفاصيل الحجوزات.' : 'Failed to load booking details.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    const targetId = isChainPayment ? chainBookingIds[0] : bookingId;
    if (!promoCode || !targetId) return;
    try {
      const res = await applyCoupon(targetId, promoCode.trim().toUpperCase());
      if (res?.discount || res?.discountPercent || res?.data?.discountPercent) {
        const pct = res.discountPercent || res.data?.discountPercent || res.discount || 0;
        setDiscountPercent(pct);
        alert(`✅ Promo code applied! ${pct}% discount.`);
      } else {
        alert('✅ Coupon applied! Refreshing booking...');
        if (isChainPayment) fetchAllChainBookings(chainBookingIds);
        else fetchBookingInfo();
      }
    } catch (err) {
      console.error(err);
      alert(lang === 'AR' ? 'كود الخصم غير صحيح أو منتهي الصلاحية.' : 'Invalid or expired promo code.');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage(lang === 'AR' ? 'يرجى تسجيل الدخول أولاً للمتابعة.' : 'Please log in to proceed with payment.');
      return;
    }

    if (!bookingId && !isChainPayment) {
      setMessage(lang === 'AR' ? 'لم يتم العثور على أي حجز. يرجى اختيار تجربة وحجزها أولاً.' : 'No booking selected. Please choose a package before paying.');
      return;
    }

    if (paymentMethod === 'bank') {
      alert(lang === 'AR' ? 'تم اختيار التحويل البنكي! سيتم التواصل معك عبر البريد الإلكتروني بتفاصيل الحساب.' : 'Bank Transfer selected! We will email you the account details.');
      setTimeout(() => navigate('/profile?tab=bookings'), 2000);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      if (isChainPayment) {
        // Pay for all chain bookings combined in a single transaction on the backend!
        const firstId = chainBookingIds[0];
        localStorage.removeItem('pendingChainBookingIds'); // Prevent sequential multi-payment loops
        localStorage.removeItem('currentChainBookingIds');
        localStorage.setItem('currentBookingId', firstId);

        const response = await processPayment(firstId, selectedCurrency);
        if (response.approvalUrl) {
          window.location.href = response.approvalUrl;
        } else {
          setMessage(lang === 'AR' ? 'تم إنشاء جلسة الدفع، ولكن لم يتم إرجاع رابط التوجيه.' : 'Payment session created, but no redirect URL was returned.');
        }
      } else {
        const response = await processPayment(bookingId, selectedCurrency);
        if (response.approvalUrl) {
          window.location.href = response.approvalUrl;
        } else {
          setMessage(lang === 'AR' ? 'تم إنشاء جلسة الدفع، ولكن لم يتم إرجاع رابط التوجيه.' : 'Payment session created successfully, but no redirect URL was returned.');
        }
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || (lang === 'AR' ? 'فشلت عملية إطلاق بوابة الدفع. يرجى المحاولة لاحقاً.' : 'Payment initiation failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Price calculations ──────────────────────────────────────────────────────
  let originalEgp, finalEgp;
  if (isChainPayment && chainBookings.length > 0) {
    originalEgp = chainBookings.reduce((sum, b) => sum + (b?.total_amount || b?.totalPrice || b?.price || 0), 0);
  } else {
    originalEgp = bookingData?.total_amount || bookingData?.totalPrice || bookingData?.price || 0;
  }
  finalEgp = originalEgp - (originalEgp * (discountPercent / 100));
  const calculatedUsd = parseFloat((finalEgp / 50).toFixed(2));

  // ── Primary booking ref display ─────────────────────────────────────────────
  const primaryId = isChainPayment ? chainBookingIds?.[0] : bookingId;
  const hasBooking = isChainPayment ? chainBookingIds?.length > 0 : !!bookingId;

  return (
    <div className={`payment-page-wrapper ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} isScrolled={true} />

      <main className="payment-main-content">
        <div className="payment-card-premium">
          <div className="payment-badge-secure">
            <i className="fa-solid fa-lock"></i>
            {lang === 'AR' ? 'دفع آمن 256-بت' : 'Secure 256-bit SSL'}
          </div>

          <div className="payment-icon-shield">
            <i className="fa-solid fa-shield-halved"></i>
          </div>

          <h2>{lang === 'AR' ? 'بوابة الدفع الآمنة' : 'Secure Checkout'}</h2>
          <p className="payment-desc">
            {lang === 'AR'
              ? 'راجع تفاصيل حجزك واختر العملة المفضلة لديك أدناه. سيتم توجيهك بأمان إلى صفحة الدفع الخاصة بـ Stripe لإتمام الدفع.'
              : 'Verify your booking details and select your preferred currency below. You will be securely redirected to Stripe Hosted Checkout.'}
          </p>

          {bookingLoading ? (
            <div style={{ padding: '30px 0', color: '#d4af37' }}>
              <i className="stripe-spinner" style={{ display: 'block', margin: '0 auto 10px' }}></i>
              <span>{lang === 'AR' ? 'جاري تحميل تفاصيل الحجز...' : 'Loading booking details...'}</span>
            </div>
          ) : !hasBooking ? (
            <div className="payment-error-toast" style={{ justifyContent: 'center' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              {lang === 'AR' ? 'لم يتم تحديد حجز حالي!' : 'No booking selected!'}
            </div>
          ) : (
            <form onSubmit={handlePayment}>

              <div className="booking-summary-box">
                <div className="summary-title-main">
                  <i className="fa-solid fa-receipt"></i>
                  {isChainPayment
                    ? (lang === 'AR' ? 'ملخص سلسلة الرحلات' : 'Trip Chain Summary')
                    : (lang === 'AR' ? 'ملخص الحجز والتفاصيل' : 'Booking & Trip Summary')}
                </div>

                {/* ── Chain Mode: list every trip ─────────────────────────── */}
                {isChainPayment ? (
                  <>
                    {/* Chain badge */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.4)',
                      borderRadius: '20px', padding: '4px 12px', marginBottom: '16px',
                      color: '#f59e0b', fontSize: '0.78rem', fontWeight: '700', letterSpacing: '0.05em'
                    }}>
                      <i className="fa-solid fa-link"></i>
                      {lang === 'AR' ? `${chainBookings.length} رحلات مرتبطة` : `${chainBookings.length} Chained Trips`}
                    </div>

                    {/* Booking ref of primary */}
                    <div className="summary-detail-row">
                      <span>{lang === 'AR' ? 'رقم مرجع الحجز الرئيسي:' : 'Primary Booking Ref:'}</span>
                      <span className="detail-val">#{primaryId?.slice(-6).toUpperCase()}</span>
                    </div>

                    {/* Individual trip rows */}
                    <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {chainBookings.map((b, idx) => {
                        const expName = b?.experience?.name || b?.customTrip?.experience?.name
                          || (lang === 'AR' ? 'باقة سياحية' : 'Travel Package');
                        const amt = b?.total_amount || b?.totalPrice || b?.price || 0;
                        const guests = b?.numberOfGuests || 1;
                        return (
                          <div key={b?._id || idx} style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,158,11,0.2)',
                            borderRadius: '12px', padding: '12px 16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{
                                  background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                                  borderRadius: '50%', width: '22px', height: '22px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.7rem', fontWeight: '900', flexShrink: 0
                                }}>{idx + 1}</span>
                                <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {expName}
                                </span>
                              </div>
                              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                                {guests} {lang === 'AR' ? 'مسافر' : 'Guests'}
                                {b?._id && <span style={{ marginLeft: '8px', opacity: 0.6 }}>· #{b._id.slice(-6).toUpperCase()}</span>}
                              </span>
                            </div>
                            <span style={{ color: '#f59e0b', fontWeight: '900', fontSize: '0.95rem', flexShrink: 0 }}>
                              {amt.toLocaleString()} EGP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* ── Single booking mode ───────────────────────────────── */
                  <>
                    <div className="summary-detail-row">
                      <span>{lang === 'AR' ? 'رقم مرجع الحجز:' : 'Booking Ref:'}</span>
                      <span className="detail-val">#{bookingId?.slice(-6).toUpperCase()}</span>
                    </div>

                    <div className="summary-detail-row">
                      <span>{lang === 'AR' ? 'الرحلة / التجربة:' : 'Experience:'}</span>
                      <span className="detail-val">
                        {bookingData?.experience?.name || bookingData?.customTrip?.experience?.name || (lang === 'AR' ? 'باقة سياحية مميزة' : 'Premium Package')}
                      </span>
                    </div>

                    <div className="summary-detail-row">
                      <span>{lang === 'AR' ? 'عدد المسافرين:' : 'Guests:'}</span>
                      <span className="detail-val">
                        {bookingData?.numberOfGuests || 1} {lang === 'AR' ? 'أفراد' : 'Guests'}
                      </span>
                    </div>
                  </>
                )}

                {/* Promo code */}
                <div className="promo-section" style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '8px' }}>Have a Promo Code?</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. LUXURY15"
                      style={{ flex: 1, padding: '10px 15px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(212, 175, 55, 0.3)', color: '#fff', borderRadius: '8px', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      style={{ background: '#d4af37', color: '#000', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Apply
                    </button>
                  </div>
                  {discountPercent > 0 && (
                    <div style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '10px' }}>
                      <i className="fa-solid fa-check-circle"></i> {discountPercent}% discount applied!
                    </div>
                  )}
                </div>

                {/* Price summary */}
                <div className="price-summary-box">
                  {/* AI discount (single booking only) */}
                  {!isChainPayment && bookingData?.ai_discount_applied && (
                    <>
                      <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', textDecoration: 'line-through' }}>
                        <span>{lang === 'AR' ? 'السعر الأصلي:' : 'Original Price:'}</span>
                        <span>{selectedCurrency === 'EGP' ? `${bookingData.original_amount} EGP` : `$${parseFloat((bookingData.original_amount / 50).toFixed(2))} USD`}</span>
                      </div>
                      <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold' }}>
                        <span><i className="fa-solid fa-wand-magic-sparkles"></i> {lang === 'AR' ? 'خصم باقة الذكاء الاصطناعي:' : 'AI Bundle Discount:'}</span>
                        <span>- {selectedCurrency === 'EGP' ? `${bookingData.discount_amount} EGP` : `$${parseFloat((bookingData.discount_amount / 50).toFixed(2))} USD`}</span>
                      </div>
                    </>
                  )}

                  {discountPercent > 0 && (
                    <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold' }}>
                      <span><i className="fa-solid fa-ticket"></i> {lang === 'AR' ? 'خصم البرومو كود:' : 'Promo Discount:'}</span>
                      <span>- {discountPercent}%</span>
                    </div>
                  )}

                  {/* Chain payment info note */}
                  {isChainPayment && (
                    <div style={{
                      background: 'rgba(245,158,11,0.07)', border: '1px dashed rgba(245,158,11,0.3)',
                      borderRadius: '10px', padding: '10px 14px', marginTop: '12px',
                      color: '#94a3b8', fontSize: '0.78rem', lineHeight: '1.5'
                    }}>
                      <i className="fa-solid fa-circle-info" style={{ color: '#f59e0b', marginRight: '6px' }}></i>
                      {lang === 'AR'
                        ? 'سيتم معالجة الدفع لجميع الرحلات معاً دفعة واحدة في معاملة آمنة وموحدة.'
                        : 'All trips in the chain will be processed and paid together in a single secure transaction.'}
                    </div>
                  )}

                  <div className="summary-row total-row" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="total-lbl">{lang === 'AR' ? 'الإجمالي المستحق للدفع:' : 'Total Amount Payable:'}</span>
                    <strong className="total-val">
                      {selectedCurrency === 'EGP' ? `${finalEgp.toLocaleString()} EGP` : `$${calculatedUsd} USD`}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="payment-btn-stripe"
              >
                {loading ? (
                  <>
                    <div className="stripe-spinner"></div>
                    {lang === 'AR' ? 'جاري المعالجة...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <i className="fa-brands fa-stripe" style={{ fontSize: '2rem', marginRight: '4px' }}></i>
                    {isChainPayment
                      ? (lang === 'AR' ? `ادفع ${chainBookings.length} رحلات عبر Stripe` : `Pay for ${chainBookings.length} Trips via Stripe`)
                      : (lang === 'AR' ? `ادفع ${selectedCurrency === 'EGP' ? 'الجنيه' : 'الدولار'} عبر Stripe` : `Pay in ${selectedCurrency} via Stripe`)}
                  </>
                )}
              </button>
            </form>
          )}

          {message && (
            <div className="payment-error-toast">
              <i className="fa-solid fa-circle-exclamation"></i>
              {message}
            </div>
          )}

          {/* Stripe Security Badges and Icons */}
          <div className="stripe-logos-footer">
            <span>{lang === 'AR' ? 'بوابات دفع آمنة 100%' : '100% Secure Payments'}</span>
            <div className="stripe-cards-icons">
              <i className="fa-brands fa-cc-visa" title="Visa"></i>
              <i className="fa-brands fa-cc-mastercard" title="Mastercard"></i>
              <i className="fa-brands fa-cc-stripe" title="Stripe"></i>
              <i className="fa-solid fa-credit-card" title="Credit Card"></i>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Payment;
