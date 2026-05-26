import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getBookingDetails, cancelBooking } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './CancelConfirm.css';

const CancelConfirm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null); // { feeAmount, autoCharged, chargeReason }
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBookingDetails(id);
        const data = res.booking || res.data?.booking || res.data || res;
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const computeFee = (b) => {
    const now = new Date();
    const createdAt = b.createdAt || b.booking_date || null;
    const hoursSinceBooking = createdAt ? (now - new Date(createdAt)) / (1000 * 60 * 60) : Infinity;
    const daysUntilTravel = b.travel_date ? (new Date(b.travel_date) - now) / (1000 * 60 * 60 * 24) : Infinity;

    let feePercent = 0;
    if (hoursSinceBooking <= 24) feePercent = 0;
    else if (daysUntilTravel <= 2) feePercent = 50;
    else if (daysUntilTravel <= 7) feePercent = 10;
    else feePercent = 5;

    const feeAmount = Number(((b.total_amount || 0) * (feePercent / 100)).toFixed(2));
    const refundedAmount = Number(((b.total_amount || 0) - feeAmount).toFixed(2));
    return { feePercent, feeAmount, refundedAmount };
  };

  const handleConfirm = async () => {
    if (!booking) return;
    setProcessing(true);
    try {
      const res = await cancelBooking(booking._id);
      const updated = res.booking || res.data?.booking || res.data || res;
      const info = updated.cancellationInfo || {};
      
      setSuccessInfo({
        feeAmount: info.feeAmount || 0,
        autoCharged: !!info.autoCharged,
        chargeReason: info.chargeReason || ''
      });

      // Start automatic redirect countdown
      let count = 6;
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          navigate('/my-bookings');
        }
      }, 1000);

    } catch (err) {
      alert(err.message || (lang === 'AR' ? 'فشل الإلغاء. حاول مرة أخرى.' : 'Cancellation failed. Try again.'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div style={{ padding: '140px 20px', textAlign: 'center', background: '#081018', minHeight: '100vh', color: '#fff' }}>
      <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '30px', color: '#d4af37' }}></i>
      <p style={{ marginTop: '15px' }}>{lang === 'AR' ? 'جاري جلب تفاصيل الحجز...' : 'Loading booking details...'}</p>
    </div>
  );

  if (error) return (
    <div style={{ padding: '140px 20px', textAlign: 'center', background: '#081018', minHeight: '100vh', color: '#fff' }}>
      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '30px', color: '#ef4444' }}></i>
      <p style={{ marginTop: '15px', color: '#cbd5e1' }}>{error}</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: '12px', background: '#d4af37', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
        {lang === 'AR' ? 'العودة' : 'Go Back'}
      </button>
    </div>
  );

  const { feePercent, feeAmount, refundedAmount } = computeFee(booking || {});

  return (
    <div className={`cancel-confirm-page ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar isScrolled={true} />
      <main style={{ padding: '120px 20px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '720px', width: '100%', background: '#0f1724', padding: '35px', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.15)', boxShadow: '0 20px 45px rgba(0,0,0,0.6)' }}>
          
          {successInfo ? (
            /* 🟢 Beautiful Success Screen */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
                <i className="fa-solid fa-circle-check" style={{ fontSize: '3.2rem', color: '#10b981' }}></i>
              </div>

              <h2 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#10b981', marginBottom: '15px' }}>
                {lang === 'AR' ? 'تم إلغاء الحجز بنجاح!' : 'Booking Cancelled Successfully!'}
              </h2>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '24px', textAlign: lang === 'AR' ? 'right' : 'left', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <span>{lang === 'AR' ? 'حالة الإلغاء:' : 'Status:'}</span>
                  <span style={{ color: '#ef4444', fontWeight: '700' }}>{lang === 'AR' ? 'ملغي' : 'Cancelled'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <span>{lang === 'AR' ? 'رسوم الإلغاء:' : 'Cancellation Fee:'}</span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{successInfo.feeAmount} EGP</span>
                </div>

                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '15px 0' }}></div>

                {successInfo.autoCharged ? (
                  <p style={{ color: '#10b981', fontSize: '0.92rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fa-solid fa-credit-card"></i>
                    {lang === 'AR' 
                      ? `تم خصم رسوم الإلغاء (${successInfo.feeAmount} EGP) تلقائياً من بطاقتك الائتمانية.` 
                      : `Cancellation fee of ${successInfo.feeAmount} EGP was charged automatically from your card.`}
                  </p>
                ) : (
                  <p style={{ color: '#f59e0b', fontSize: '0.92rem', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.5' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {lang === 'AR' 
                      ? `تم إلغاء الحجز. لم يتم خصم رسوم الإلغاء تلقائياً: ${successInfo.chargeReason || 'حساب تجريبي'}` 
                      : `Booking cancelled. Cancellation fee was not charged automatically: ${successInfo.chargeReason || 'Test session'}`}
                  </p>
                )}
              </div>

              <p style={{ color: '#d4af37', fontSize: '0.9rem', fontWeight: '700', background: 'rgba(212, 175, 55, 0.1)', padding: '8px 18px', borderRadius: '20px', border: '1px solid rgba(212, 175, 55, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px', animation: 'pulse-gold 2s infinite' }}>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                {lang === 'AR' 
                  ? `سيتم توجيهك تلقائياً لصفحة حجوزاتك خلال ${countdown} ثوانٍ...` 
                  : `Redirecting you to your bookings page in ${countdown} seconds...`}
              </p>
            </div>
          ) : (
            /* 🔴 Main Cancellation Confirm Form */
            <>
              <h2 style={{ color: '#d4af37', marginBottom: '10px', fontSize: '1.8rem', fontWeight: '800' }}>
                {lang === 'AR' ? 'تأكيد إلغاء الحجز' : 'Confirm Booking Cancellation'}
              </h2>

              <div style={{ color: '#cbd5e1', marginBottom: '20px', lineHeight: '1.6' }}>
                <p style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff', marginBottom: '10px' }}>
                  {lang === 'AR' ? 'الشروط وقواعد الإلغاء:' : 'Policy & Cancellation Rules:'}
                </p>
                <ul style={{ paddingLeft: lang === 'AR' ? '0' : '20px', paddingRight: lang === 'AR' ? '20px' : '0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.92rem' }}>
                  <li>{lang === 'AR' ? 'أول 24 ساعة بعد الحجز مباشرة: مجاني بالكامل (0%).' : 'First 24 hours after booking: Fully Free (0% fee).'}</li>
                  <li>{lang === 'AR' ? 'بعد مرور 24 ساعة (وقبل أكثر من أسبوع من الرحلة): خصم 5% رسوم إلغاء.' : 'After 24 hours (and more than 7 days before travel): 5% cancellation fee.'}</li>
                  <li>{lang === 'AR' ? 'خلال الأسبوع الأخير وحتى يومين قبل الرحلة: خصم 10% رسوم إلغاء.' : 'Within the last week up to 2 days before travel: 10% cancellation fee.'}</li>
                  <li>{lang === 'AR' ? 'قبل يومين (48 ساعة) أو أقل من موعد الرحلة: خصم 50% رسوم إلغاء.' : '2 days (48 hours) or less before travel: 50% cancellation fee.'}</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <p style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fa-solid fa-receipt" style={{ color: '#d4af37' }}></i>
                  {lang === 'AR' ? 'تفاصيل الحجز الحالي' : 'Booking Details'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{lang === 'AR' ? 'رقم مرجع الحجز:' : 'Booking ID:'}</span>
                    <strong style={{ color: '#fff' }}>#{booking._id.slice(-8).toUpperCase()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{lang === 'AR' ? 'تاريخ السفر:' : 'Travel Date:'}</span>
                    <strong style={{ color: '#fff' }}>
                      {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (lang === 'AR' ? 'غير محدد' : 'N/A')}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{lang === 'AR' ? 'المبلغ الكلي المدفوع:' : 'Total Amount Paid:'}</span>
                    <strong style={{ color: '#10b981' }}>{booking.total_amount || 0} EGP</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', padding: '18px', borderRadius: '14px', marginBottom: '25px' }}>
                <p style={{ fontWeight: '800', color: '#d4af37', fontSize: '1.05rem', marginBottom: '10px' }}>
                  {lang === 'AR' ? 'الحساب المالي للإلغاء الفعلي' : 'Calculated Cancellation Fee'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.92rem', color: '#cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{lang === 'AR' ? 'نسبة رسوم الإلغاء المحتسبة:' : 'Applicable Penalty Rate:'}</span>
                    <span style={{ color: '#fff', fontWeight: '700' }}>{feePercent}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{lang === 'AR' ? 'مبلغ رسوم الإلغاء المحتجز:' : 'Cancellation Fee Amount:'}</span>
                    <span style={{ color: '#ef4444', fontWeight: '700' }}>{feeAmount} EGP</span>
                  </div>
                  <div style={{ borderTop: '1px dashed rgba(212,175,55,0.15)', margin: '6px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: '#fff', fontWeight: '700' }}>{lang === 'AR' ? 'المبلغ المسترد المتوقع:' : 'Expected Refund Amount:'}</span>
                    <strong style={{ color: '#10b981', fontSize: '1.25rem' }}>{refundedAmount} EGP</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => navigate(-1)} 
                  style={{ 
                    flex: 1, 
                    padding: '14px', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.04)', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontWeight: '700',
                    fontSize: '0.95rem'
                  }}
                >
                  {lang === 'AR' ? 'تراجع عن الإلغاء' : 'Go Back'}
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={processing} 
                  style={{ 
                    flex: 1, 
                    padding: '14px', 
                    borderRadius: '12px', 
                    background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
                    color: '#fff', 
                    border: 'none', 
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {processing ? (
                    <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> {lang === 'AR' ? 'جاري الإلغاء...' : 'Cancelling...'}</>
                  ) : (
                    <>{lang === 'AR' ? 'تأكيد إلغاء الحجز' : 'Confirm Cancellation'}</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CancelConfirm;
