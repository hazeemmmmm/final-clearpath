import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getPaymentHistory, getBookingDetails } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Payment.css';

const PaymentMockCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  // Form states
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCheckoutDetails = async () => {
      if (!sessionId) {
        setError(lang === 'AR' ? 'رمز جلسة الدفع مفقود.' : 'Missing payment session reference.');
        setLoading(false);
        return;
      }

      try {
        // Retrieve payments to find the current pending payment matching this session
        const historyRes = await getPaymentHistory();
        const payments = historyRes.payments || historyRes.data?.payments || [];
        const currentPayment = payments.find(p => p.stripeSessionId === sessionId);

        if (!currentPayment) {
          setError(lang === 'AR' ? 'تعذر العثور على سجل الدفع.' : 'Payment record not found.');
          setLoading(false);
          return;
        }

        setPaymentAmount(currentPayment.amount || 0);

        // Fetch full booking details (to display experience names, etc.)
        const bookingId = currentPayment.booking?._id || currentPayment.booking;
        const bookingRes = await getBookingDetails(bookingId);
        const booking = bookingRes.booking || bookingRes.data || bookingRes;
        
        setBookingData(booking);

        // Prefill email and name if user details exist
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setEmail(parsed.email || '');
          setCardholderName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim());
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load checkout details:', err);
        setError(lang === 'AR' ? 'فشل تحميل بيانات الدفع. يرجى المحاولة لاحقاً.' : 'Failed to load checkout details. Please try again.');
        setLoading(false);
      }
    };

    fetchCheckoutDetails();
  }, [sessionId, lang]);

  const handleMockPay = (e) => {
    e.preventDefault();
    setPaying(true);
    // Simulate short gateway processing delay
    setTimeout(() => {
      setPaying(false);
      navigate(`/payment/success?session_id=${sessionId}`);
    }, 1500);
  };

  const handleCancel = () => {
    navigate('/payment/cancel');
  };

  // UI labels based on language
  const labels = {
    title: lang === 'AR' ? 'محاكاة بوابة الدفع Stripe' : 'Stripe Payment Simulation',
    testMode: lang === 'AR' ? 'وضع التجربة والمحاكاة' : 'TEST MODE SIMULATION',
    experience: lang === 'AR' ? 'الرحلة / الباقة' : 'Experience',
    guests: lang === 'AR' ? 'عدد المسافرين' : 'Guests',
    amount: lang === 'AR' ? 'المبلغ المطلوب دفعه' : 'Amount to Pay',
    emailLabel: lang === 'AR' ? 'البريد الإلكتروني' : 'Email Address',
    cardLabel: lang === 'AR' ? 'معلومات البطاقة' : 'Card Information',
    cardholderLabel: lang === 'AR' ? 'اسم حامل البطاقة' : 'Cardholder Name',
    countryLabel: lang === 'AR' ? 'البلد أو المنطقة' : 'Country or Region',
    countryVal: lang === 'AR' ? 'مصر' : 'Egypt',
    payBtn: lang === 'AR' ? `تأكيد ودفع ${paymentAmount.toLocaleString()} EGP` : `Confirm & Pay ${paymentAmount.toLocaleString()} EGP`,
    cancelBtn: lang === 'AR' ? 'إلغاء عملية الدفع والرجوع' : 'Cancel & Return',
    secNote: lang === 'AR' ? 'تنبيه: هذه عملية دفع تجريبية لمشروعك، لن يتم خصم أي أموال حقيقية.' : 'Notice: This is a simulation payment portal for testing purposes. No real money will be charged.',
    loading: lang === 'AR' ? 'جاري تحميل تفاصيل الدفع...' : 'Loading checkout details...',
    processing: lang === 'AR' ? 'جاري معالجة الدفع...' : 'Processing Payment...',
    errorTitle: lang === 'AR' ? 'خطأ في إعداد الدفع' : 'Checkout Setup Error'
  };

  return (
    <div className={`payment-page-wrapper ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} isScrolled={true} />

      <main className="payment-main-content" style={{ padding: '120px 20px 80px' }}>
        <div className="payment-card-premium" style={{ maxWidth: '520px' }}>
          
          <div className="payment-badge-secure" style={{ background: '#635bff', color: '#fff', boxShadow: '0 4px 15px rgba(99, 91, 255, 0.4)' }}>
            <i className="fa-brands fa-stripe" style={{ fontSize: '1.2rem' }}></i>
            {labels.testMode}
          </div>

          <h2 style={{ color: 'var(--payment-text-main)', fontSize: '1.7rem', fontWeight: '800', margin: '20px 0 5px' }}>{labels.title}</h2>
          <p className="payment-desc" style={{ fontSize: '0.88rem', color: 'var(--payment-text-muted)', marginBottom: '25px' }}>{labels.secNote}</p>

          {loading ? (
            <div style={{ padding: '40px 0', color: '#d4af37', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <div className="stripe-spinner" style={{ width: '35px', height: '35px', border: '3px solid rgba(212, 175, 55, 0.1)', borderTopColor: '#d4af37' }}></div>
              <span>{labels.loading}</span>
            </div>
          ) : error ? (
            <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#ef4444' }}></i>
              <h3 style={{ color: '#ef4444', margin: 0 }}>{labels.errorTitle}</h3>
              <p style={{ color: 'var(--payment-text-muted)', fontSize: '0.92rem' }}>{error}</p>
              <button onClick={() => navigate('/payment')} style={{ background: '#ef4444', color: '#fff', width: '100%', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
                {lang === 'AR' ? 'رجوع' : 'Go Back'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleMockPay} style={{ textAlign: 'left' }}>
              {/* Trip & Amount Summary */}
              <div style={{ background: 'var(--payment-box-bg)', border: '1px solid var(--payment-box-border)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px dashed var(--payment-divider)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--payment-text-muted)', fontSize: '0.85rem' }}>{labels.experience}:</span>
                  <span style={{ color: 'var(--payment-text-main)', fontSize: '0.88rem', fontWeight: '700', maxWidth: '60%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {bookingData?.experience?.name || bookingData?.customTrip?.experience?.name || (lang === 'AR' ? 'رحلة مخصصة' : 'Custom Trip')}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--payment-text-muted)', fontSize: '0.85rem' }}>{labels.guests}:</span>
                  <span style={{ color: 'var(--payment-text-main)', fontSize: '0.88rem', fontWeight: '700' }}>
                    {bookingData?.numberOfGuests || 1}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--payment-divider)' }}>
                  <strong style={{ color: 'var(--payment-text-main)', fontSize: '0.9rem' }}>{labels.amount}:</strong>
                  <strong style={{ color: '#10b981', fontSize: '1.3rem', fontWeight: '800' }}>
                    {paymentAmount.toLocaleString()} EGP
                  </strong>
                </div>
              </div>

              {/* Email field */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', color: 'var(--payment-text-muted)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                  {labels.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--payment-input-bg)', border: '1px solid var(--payment-input-border)', color: 'var(--payment-text-main)', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Card info card-like component */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', color: 'var(--payment-text-muted)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                  {labels.cardLabel}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--payment-input-bg)', border: '1px solid var(--payment-input-border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <input
                    type="text"
                    required
                    readOnly
                    value={cardNumber}
                    className="stripe-card-input"
                    style={{ border: 'none', borderBottom: '1px solid var(--payment-divider)', borderRadius: 0, padding: '12px 14px', background: 'transparent', width: '100%', boxSizing: 'border-box', color: 'var(--payment-text-main)' }}
                  />
                  <div style={{ display: 'flex' }}>
                    <input
                      type="text"
                      required
                      readOnly
                      value={cardExpiry}
                      className="stripe-card-input"
                      style={{ border: 'none', borderRight: '1px solid var(--payment-divider)', borderRadius: 0, padding: '12px 14px', background: 'transparent', width: '50%', boxSizing: 'border-box', color: 'var(--payment-text-main)' }}
                    />
                    <input
                      type="text"
                      required
                      readOnly
                      value={cardCvc}
                      className="stripe-card-input"
                      style={{ border: 'none', borderRadius: 0, padding: '12px 14px', background: 'transparent', width: '50%', boxSizing: 'border-box', color: 'var(--payment-text-main)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Name on Card field */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', color: 'var(--payment-text-muted)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                  {labels.cardholderLabel}
                </label>
                <input
                  type="text"
                  required
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--payment-input-bg)', border: '1px solid var(--payment-input-border)', color: 'var(--payment-text-main)', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Country Selection */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', color: 'var(--payment-text-muted)', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                  {labels.countryLabel}
                </label>
                <input
                  type="text"
                  readOnly
                  value={labels.countryVal}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--payment-input-bg)', border: '1px solid var(--payment-input-border)', color: 'var(--payment-text-main)', borderRadius: '8px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={paying}
                style={{
                  background: 'linear-gradient(135deg, #635bff, #4f46e5)',
                  color: '#fff',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '10px',
                  fontSize: '1.02rem',
                  fontWeight: '700',
                  width: '100%',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(99, 91, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifycontent: 'center', // Wait: esbuild needs alignItems/justifyContent in camelCase
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {paying ? (
                  <>
                    <div className="stripe-spinner"></div>
                    {labels.processing}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock"></i>
                    {labels.payBtn}
                  </>
                )}
              </button>

              {/* Return Button */}
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  marginTop: '12px',
                  background: 'transparent',
                  color: 'var(--payment-text-muted)',
                  border: '1px solid var(--payment-input-border)',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {labels.cancelBtn}
              </button>
            </form>
          )}

          {/* Secure Branding */}
          <div className="stripe-logos-footer" style={{ marginTop: '25px' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>POWERED BY STRIPE SIMULATION</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentMockCheckout;
