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
  const [bookingData, setBookingData] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('EGP'); 
  const [message, setMessage] = useState('');
  
  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);

  const token = useSelector((state) => state.auth?.token) || localStorage.getItem('clearpath_access_token') || localStorage.getItem('token');
  const bookingId = localStorage.getItem('currentBookingId');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!token) {
      navigate('/login');
      return;
    }
    if (!bookingId) {
      setBookingLoading(false);
      return;
    }
    fetchBookingInfo();
  }, [bookingId, token]);

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

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      if (promoCode.toUpperCase().startsWith('LUXURY')) {
        const pct = parseInt(promoCode.substring(6, 8));
        if (!isNaN(pct)) {
          setDiscountPercent(pct);
          alert(`Promo code applied! ${pct}% discount.`);
        } else {
          alert('Invalid promo code.');
        }
      } else {
        alert('Invalid promo code.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage(lang === 'AR' ? 'يرجى تسجيل الدخول أولاً للمتابعة.' : 'Please log in to proceed with payment.');
      return;
    }

    if (!bookingId) {
      setMessage(lang === 'AR' ? 'لم يتم العثور على أي حجز. يرجى اختيار تجربة وحجزها أولاً.' : 'No booking selected. Please choose a package before paying.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await processPayment(bookingId, selectedCurrency);
      if (response.approvalUrl) {
        window.location.href = response.approvalUrl;
      } else {
        setMessage(lang === 'AR' ? 'تم إنشاء جلسة الدفع، ولكن لم يتم إرجاع رابط التوجيه.' : 'Payment session created successfully, but no redirect URL was returned.');
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || (lang === 'AR' ? 'فشلت عملية إطلاق بوابة الدفع. يرجى المحاولة لاحقاً.' : 'Payment initiation failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const originalEgp = bookingData?.total_amount || bookingData?.totalPrice || bookingData?.price || 0;
  const discountedEgp = originalEgp - (originalEgp * (discountPercent / 100));
  const finalEgp = discountedEgp;
  const calculatedUsd = parseFloat((finalEgp / 50).toFixed(2));

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
          ) : !bookingId ? (
            <div className="payment-error-toast" style={{ justifyContent: 'center' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              {lang === 'AR' ? 'لم يتم تحديد حجز حالي!' : 'No booking selected!'}
            </div>
          ) : (
            <form onSubmit={handlePayment}>
              
              <div className="booking-summary-box">
                <div className="summary-title-main">
                  <i className="fa-solid fa-receipt"></i>
                  {lang === 'AR' ? 'ملخص الحجز والتفاصيل' : 'Booking & Trip Summary'}
                </div>

                <div className="summary-detail-row">
                  <span>{lang === 'AR' ? 'رقم مرجع الحجز:' : 'Booking Ref:'}</span>
                  <span className="detail-val">#{bookingId.slice(-6).toUpperCase()}</span>
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

                <div className="price-summary-box">
                  {bookingData?.ai_discount_applied && (
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
                  {discountPercent > 0 && !bookingData?.ai_discount_applied && (
                    <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold' }}>
                      <span><i className="fa-solid fa-ticket"></i> {lang === 'AR' ? 'خصم البرومو كود:' : 'Promo Discount:'}</span>
                      <span>- {discountPercent}%</span>
                    </div>
                  )}
                  
                  <div className="summary-row total-row" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <span className="total-lbl">{lang === 'AR' ? 'الإجمالي المستحق للدفع:' : 'Total Amount Payable:'}</span>
                    <strong className="total-val">
                      {selectedCurrency === 'EGP' ? `${finalEgp} EGP` : `$${calculatedUsd} USD`}
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
                    {lang === 'AR' ? 'جاري التوجيه لبوابة Stripe...' : 'Redirecting...'}
                  </>
                ) : (
                  <>
                    <i className="fa-brands fa-stripe" style={{ fontSize: '2rem', marginRight: '4px' }}></i>
                    {lang === 'AR' ? `ادفع ${selectedCurrency === 'EGP' ? 'الجنيه' : 'الدولار'} عبر Stripe` : `Pay in ${selectedCurrency} via Stripe`}
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

      <Footer />
    </div>
  );
};

export default Payment;
