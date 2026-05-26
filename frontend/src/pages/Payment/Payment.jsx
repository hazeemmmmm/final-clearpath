import React, { useState, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { processPayment, getBookingDetails } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Payment.css';

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('EGP'); // 'EGP' or 'USD'
  const [message, setMessage] = useState('');
  
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
        // Redirect to Stripe Hosted Checkout
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
  const calculatedUsd = parseFloat((originalEgp / 50).toFixed(2));

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
              
              {/* 💵 Stunning Interactive Currency Selector */}
              <div className="currency-selector-container" style={{
                marginBottom: '25px',
                padding: '6px',
                background: 'rgba(11, 15, 25, 0.6)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                borderRadius: '14px',
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('EGP')}
                  style={{
                    flex: 1,
                    padding: '12px 10px',
                    border: 'none',
                    borderRadius: '10px',
                    background: selectedCurrency === 'EGP' ? 'linear-gradient(135deg, #d4af37, #aa8c2c)' : 'transparent',
                    color: selectedCurrency === 'EGP' ? '#0b0f19' : '#94a3b8',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                  }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{lang === 'AR' ? 'الجنيه المصري' : 'Egyptian Pound'}</span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>EGP (🇪🇬)</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedCurrency('USD')}
                  style={{
                    flex: 1,
                    padding: '12px 10px',
                    border: 'none',
                    borderRadius: '10px',
                    background: selectedCurrency === 'USD' ? 'linear-gradient(135deg, #d4af37, #aa8c2c)' : 'transparent',
                    color: selectedCurrency === 'USD' ? '#0b0f19' : '#94a3b8',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                  }}
                >
                  <span style={{ fontSize: '0.95rem' }}>{lang === 'AR' ? 'الدولار الأمريكي' : 'US Dollar'}</span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>USD (🇺🇸)</span>
                </button>
              </div>

              {/* Detailed Booking Summary Card */}
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
                  <span>{lang === 'AR' ? 'الوجهة السياحية:' : 'Destination:'}</span>
                  <span className="detail-val">
                    {bookingData?.experience?.destination?.name || bookingData?.customTrip?.experience?.destination?.name || (lang === 'AR' ? 'مصر' : 'Egypt')}
                  </span>
                </div>

                <div className="summary-detail-row">
                  <span>{lang === 'AR' ? 'عدد المسافرين:' : 'Guests:'}</span>
                  <span className="detail-val">
                    {bookingData?.numberOfGuests || 1} {lang === 'AR' ? 'أفراد' : 'Guests'}
                  </span>
                </div>

                {bookingData?.customTrip && (
                  <div className="summary-detail-row" style={{ color: '#d4af37' }}>
                    <span>{lang === 'AR' ? 'تخصيص البرنامج:' : 'Plan Type:'}</span>
                    <span className="detail-val" style={{ color: '#d4af37' }}>
                      <i className="fa-solid fa-sparkles" style={{ marginRight: '4px' }}></i>
                      {lang === 'AR' ? 'برنامج مخصص نشط' : 'Custom Plan Active'}
                    </span>
                  </div>
                )}

                <div className="summary-divider-dashed"></div>

                <div className="summary-price-payable">
                  <span className="total-lbl">{lang === 'AR' ? 'الإجمالي المستحق للدفع:' : 'Total Amount Payable:'}</span>
                  <strong className="total-val">
                    {selectedCurrency === 'EGP' ? `${originalEgp} EGP` : `$${calculatedUsd} USD`}
                  </strong>
                </div>
              </div>

              {/* Action Stripe Button */}
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
                    {lang === 'AR' ? `ادفع الآن بـ ${selectedCurrency === 'EGP' ? 'الجنيه' : 'الدولار'} عبر Stripe` : `Pay Now in ${selectedCurrency} via Stripe`}
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
