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

          {!loading && !error && (() => {
            const chainRaw = localStorage.getItem('clearpath_trip_chain_completed');
            const completedChain = chainRaw ? JSON.parse(chainRaw) : [];
            
            return (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: '3.2rem', color: '#10b981' }}></i>
                  </div>

                  <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#10b981' }}>
                    {lang === 'AR' ? 'تم تأكيد الحجز بنجاح!' : 'Booking Confirmed!'}
                  </h2>

                  {completedChain && completedChain.length > 0 && (
                    <div style={{ width: '100%', textAlign: 'left', margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                        {lang === 'AR' ? 'تفاصيل باقات السفر المؤكدة:' : 'Confirmed Travel Experiences:'}
                      </h3>
                      {completedChain.map((item, idx) => (
                        <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '14px', position: 'relative' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: '700', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                              </h4>
                              <div style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <span>{item.guestCount} {lang === 'AR' ? 'مسافر' : 'Guests'}</span>
                                <span>•</span>
                                <span>{item.isCustomized ? (lang === 'AR' ? 'مخصصة' : 'Customized') : (lang === 'AR' ? 'عادية' : 'Standard')}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                              {lang === 'AR' ? 'المجموع شامل:' : 'Total (Inclusive):'}
                            </span>
                            <span style={{ color: '#f59e0b', fontSize: '0.95rem', fontWeight: '900' }}>
                              {Number(item.price).toLocaleString()} EGP
                            </span>
                          </div>
                        </div>
                      ))}

                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(16, 185, 129, 0.3)', marginTop: '8px' }}>
                        <strong style={{ color: '#fff', fontSize: '0.95rem' }}>
                          {lang === 'AR' ? 'المبلغ الإجمالي المدفوع:' : 'Total Amount Paid:'}
                        </strong>
                        <span style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: '900' }}>
                          {completedChain.reduce((sum, item) => sum + (Number(item.price) || 0), 0).toLocaleString()} EGP
                        </span>
                      </div>
                    </div>
                  )}

                  <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.5' }}>
                    {lang === 'AR'
                      ? 'تم استلام الدفعة المالية بنجاح. تم تأكيد البرنامج السياحي بالكامل وسيتم التنسيق معك قريباً.'
                      : 'Your payment was received successfully. Your experiences are now fully Confirmed and ready.'}
                  </p>

                  <p style={{ color: '#d4af37', fontSize: '0.85rem', fontWeight: '700', background: 'rgba(212, 175, 55, 0.1)', padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.2)', marginTop: '8px' }}>
                    <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: lang === 'AR' ? '0' : '8px', marginLeft: lang === 'AR' ? '8px' : '0' }}></i>
                    {lang === 'AR'
                      ? `سيتم توجيهك تلقائياً لصفحة حجوزاتك خلال ${countdown} ثوانٍ...`
                      : `Redirecting you to your bookings page in ${countdown} seconds...`}
                  </p>
                </div>
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
              </>
            );
          })()}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
