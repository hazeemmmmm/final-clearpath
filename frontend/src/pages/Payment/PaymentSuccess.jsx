import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { confirmPayment } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Payment.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);
  const { lang } = useContext(LanguageContext);
  
  const sessionId = searchParams.get('session_id');

  // How many more trips remain in the chain after this payment
  const [remainingChainCount, setRemainingChainCount] = useState(0);

  useEffect(() => {
    const verifyAndCapture = async () => {
      if (!sessionId) {
        setError(lang === 'AR' ? 'رمز جلسة الدفع مفقود.' : 'Missing payment session reference.');
        setLoading(false);
        return;
      }

      try {
        await confirmPayment(sessionId);
        setLoading(false);
        // Clean up current booking id
        localStorage.removeItem('currentBookingId');

        // Check if there are more bookings left in a chain
        const pendingRaw = localStorage.getItem('pendingChainBookingIds');
        const pendingIds = pendingRaw ? JSON.parse(pendingRaw) : [];

        if (pendingIds.length > 0) {
          // Pop the next booking from the pending list
          const [nextId, ...rest] = pendingIds;
          localStorage.setItem('currentBookingId', nextId);
          if (rest.length > 0) {
            localStorage.setItem('pendingChainBookingIds', JSON.stringify(rest));
          } else {
            localStorage.removeItem('pendingChainBookingIds');
          }
          setRemainingChainCount(pendingIds.length);

          // Give the user a moment to see the success message, then redirect to pay next
          let count = 3;
          const interval = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count === 0) {
              clearInterval(interval);
              navigate('/payment');
            }
          }, 1000);
        } else {
          // No more pending chain bookings — go to my-bookings
          localStorage.removeItem('pendingChainBookingIds');
          let count = 3;
          const interval = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count === 0) {
              clearInterval(interval);
              navigate('/my-bookings');
            }
          }, 1000);
        }

      } catch (err) {
        console.error(err);
        setError(err.message || (lang === 'AR' ? 'فشلنا في التحقق من عملية الدفع. يرجى التواصل مع الدعم الفني.' : 'We could not verify your payment. Please contact support.'));
        setLoading(false);
      }
    };

    verifyAndCapture();
  }, [sessionId, lang, navigate]);

  return (
    <div className={`payment-page-wrapper ${lang === 'AR' ? 'lang-ar' : ''}`} style={{ background: '#0b0f14', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar lang={lang} isScrolled={true} />
      
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '120px 20px 60px' }}>
        <div style={{ background: '#151d2b', border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '24px', padding: '45px 40px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 45px rgba(0,0,0,0.6)' }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div className="stripe-spinner" style={{ width: '45px', height: '45px', border: '3px solid rgba(212, 175, 55, 0.1)', borderTopColor: '#d4af37' }}></div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#d4af37' }}>
                {lang === 'AR' ? 'جاري التحقق من عملية الدفع...' : 'Verifying Payment...'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
                {lang === 'AR' ? 'برجاء الانتظار ثوانٍ معدودة لتأكيد وتأمين حجزك المفضل.' : 'Please wait while we secure your booking reservation.'}
              </p>
            </div>
          )}

          {!loading && error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3.8rem', color: '#ef4444' }}></i>
              <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#ef4444' }}>
                {lang === 'AR' ? 'فشل تأكيد الدفع' : 'Payment Error'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>{error}</p>
              <button 
                onClick={() => navigate('/payment')} 
                style={{ 
                  marginTop: '10px', 
                  background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                  color: '#fff', 
                  padding: '13px 24px', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: '700', 
                  cursor: 'pointer', 
                  width: '100%',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                }}
              >
                {lang === 'AR' ? 'إعادة محاولة الدفع' : 'Retry Checkout'}
              </button>
            </div>
          )}

          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '3.2rem', color: '#10b981' }}></i>
              </div>

              <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#10b981' }}>
                {lang === 'AR' ? 'تم تأكيد الحجز بنجاح!' : 'Booking Confirmed!'}
              </h2>

              {remainingChainCount > 0 ? (
                <>
                  <div style={{
                    background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '14px', padding: '14px 18px', width: '100%', textAlign: 'center'
                  }}>
                    <i className="fa-solid fa-link" style={{ color: '#f59e0b', marginBottom: '6px', display: 'block', fontSize: '1.4rem' }}></i>
                    <p style={{ color: '#f59e0b', fontWeight: '700', margin: '0 0 4px 0', fontSize: '0.95rem' }}>
                      {lang === 'AR'
                        ? `تبقّى ${remainingChainCount} ${remainingChainCount === 1 ? 'رحلة' : 'رحلات'} في السلسلة`
                        : `${remainingChainCount} more trip${remainingChainCount > 1 ? 's' : ''} remaining in your chain`}
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                      {lang === 'AR' ? 'سيتم توجيهك لإتمام دفع الرحلة التالية.' : 'You will be redirected to complete payment for the next trip.'}
                    </p>
                  </div>

                  <p style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '700', background: 'rgba(245,158,11,0.1)', padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(245,158,11,0.25)', marginTop: '4px' }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i>
                    {lang === 'AR'
                      ? `الانتقال للدفع التالي خلال ${countdown} ثوانٍ...`
                      : `Moving to next payment in ${countdown} seconds...`}
                  </p>
                </>
              ) : (
                <>
                  <p style={{ color: '#94a3b8', fontSize: '0.98rem', lineHeight: '1.6' }}>
                    {lang === 'AR'
                      ? 'تم استلام الدفعة المالية بنجاح. تفاصيل الحجز والبرنامج السياحي مؤكدة بالكامل الآن!'
                      : 'Your payment was received successfully. Your experience booking is now fully Confirmed.'}
                  </p>

                  <p style={{ color: '#d4af37', fontSize: '0.9rem', fontWeight: '700', background: 'rgba(212, 175, 55, 0.1)', padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.2)', marginTop: '8px', animation: 'pulse-gold 2s infinite' }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: lang === 'AR' ? '0' : '8px', marginLeft: lang === 'AR' ? '8px' : '0' }}></i>
                    {lang === 'AR'
                      ? `سيتم توجيهك تلقائياً لصفحة حسابك وحجوزاتك خلال ${countdown} ثوانٍ...`
                      : `Redirecting you to your bookings page in ${countdown} seconds...`}
                  </p>
                </>
              )}

              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', width: '100%', margin: '15px 0' }}></div>
              
              <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
                <button 
                  onClick={() => navigate('/my-bookings')} 
                  style={{ 
                    flex: 1, 
                    background: 'linear-gradient(135deg, #d4af37, #aa8c2c)', 
                    color: '#0b0f19', 
                    padding: '12px', 
                    border: 'none', 
                    borderRadius: '10px', 
                    fontWeight: '700', 
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  {lang === 'AR' ? 'حجوزاتي' : 'My Bookings'}
                </button>
                <button 
                  onClick={() => navigate('/')} 
                  style={{ 
                    flex: 1, 
                    background: 'rgba(255,255,255,0.04)', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    padding: '12px', 
                    borderRadius: '10px', 
                    fontWeight: '700', 
                    cursor: 'pointer' 
                  }}
                >
                  {lang === 'AR' ? 'الرئيسية' : 'Go Home'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
