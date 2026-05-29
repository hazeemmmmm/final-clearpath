import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getBookingDetails, cancelBooking } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';

const CancelConfirm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, setLang } = useContext(LanguageContext);
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [countdown, setCountdown] = useState(6);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className={`tw-min-h-screen tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-font-sans tw-flex tw-flex-col ${lang === 'AR' ? 'tw-dir-rtl' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={true} />
      <div className="tw-flex-grow tw-flex tw-flex-col tw-items-center tw-justify-center">
        <i className="fa-solid fa-circle-notch fa-spin tw-text-4xl tw-text-amber-500 tw-mb-4"></i>
        <p className="tw-text-slate-600 dark:tw-text-slate-400 tw-font-medium">{lang === 'AR' ? 'جاري جلب تفاصيل الحجز...' : 'Loading booking details...'}</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`tw-min-h-screen tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-font-sans tw-flex tw-flex-col ${lang === 'AR' ? 'tw-dir-rtl' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={true} />
      <div className="tw-flex-grow tw-flex tw-justify-center tw-items-center tw-p-4">
        <div className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-red-200 dark:tw-border-red-900/30 tw-rounded-2xl tw-p-10 tw-text-center tw-max-w-lg tw-w-full tw-shadow-xl">
          <i className="fa-solid fa-triangle-exclamation tw-text-5xl tw-text-red-500 tw-mb-6"></i>
          <p className="tw-text-slate-700 dark:tw-text-slate-300 tw-mb-6">{error}</p>
          <button 
            className="tw-bg-amber-500 hover:tw-bg-amber-600 tw-text-slate-900 tw-font-bold tw-py-3 tw-px-8 tw-rounded-sm tw-transition-colors"
            onClick={() => navigate(-1)}
          >
            {lang === 'AR' ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    </div>
  );

  const { feePercent, feeAmount, refundedAmount } = computeFee(booking || {});

  return (
    <div className={`tw-min-h-screen tw-bg-slate-50 dark:tw-bg-[#0a0b0d] tw-font-sans tw-flex tw-flex-col ${lang === 'AR' ? 'tw-dir-rtl' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={true} />
      
      <main className="tw-flex-grow tw-flex tw-justify-center tw-items-center tw-px-4 tw-py-32">
        <div className="tw-bg-white dark:tw-bg-[#111111] tw-border tw-border-slate-200 dark:tw-border-[#1f1f1f] tw-shadow-xl tw-rounded-xl tw-p-8 md:tw-p-10 tw-w-full tw-max-w-2xl">
          
          {successInfo ? (
            /* Success Screen */
            <div className="tw-text-center tw-py-4">
              <div className="tw-w-20 tw-h-20 tw-bg-emerald-500/10 tw-border tw-border-emerald-500/30 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-6">
                <i className="fa-solid fa-circle-check tw-text-4xl tw-text-emerald-500"></i>
              </div>

              <h2 className="tw-text-2xl tw-font-serif tw-font-bold tw-text-emerald-500 tw-mb-6">
                {lang === 'AR' ? 'تم إلغاء الحجز بنجاح!' : 'Booking Cancelled Successfully!'}
              </h2>

              <div className="tw-bg-slate-50 dark:tw-bg-white/5 tw-border tw-border-slate-200 dark:tw-border-white/10 tw-rounded-lg tw-p-6 tw-mb-8 tw-text-left">
                <div className="tw-flex tw-justify-between tw-text-sm tw-text-slate-500 dark:tw-text-slate-400 tw-mb-3">
                  <span>{lang === 'AR' ? 'حالة الإلغاء:' : 'Status:'}</span>
                  <span className="tw-text-red-500 tw-font-bold">{lang === 'AR' ? 'ملغي' : 'Cancelled'}</span>
                </div>

                <div className="tw-flex tw-justify-between tw-text-sm tw-text-slate-500 dark:tw-text-slate-400 tw-mb-4">
                  <span>{lang === 'AR' ? 'رسوم الإلغاء:' : 'Cancellation Fee:'}</span>
                  <span className="tw-text-slate-900 dark:tw-text-white tw-font-bold">{successInfo.feeAmount} EGP</span>
                </div>

                <div className="tw-border-t tw-border-slate-200 dark:tw-border-white/10 tw-my-4"></div>

                {successInfo.autoCharged ? (
                  <p className="tw-text-emerald-500 tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2 tw-m-0">
                    <i className="fa-solid fa-credit-card"></i>
                    {lang === 'AR' 
                      ? `تم خصم رسوم الإلغاء (${successInfo.feeAmount} EGP) تلقائياً من بطاقتك الائتمانية.` 
                      : `Cancellation fee of ${successInfo.feeAmount} EGP was charged automatically from your card.`}
                  </p>
                ) : (
                  <p className="tw-text-amber-500 tw-text-sm tw-font-bold tw-flex tw-items-center tw-gap-2 tw-m-0 tw-leading-relaxed">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {lang === 'AR' 
                      ? `تم إلغاء الحجز. لم يتم خصم رسوم الإلغاء تلقائياً: ${successInfo.chargeReason || 'حساب تجريبي'}` 
                      : `Booking cancelled. Cancellation fee was not charged automatically: ${successInfo.chargeReason || 'Test session'}`}
                  </p>
                )}
              </div>

              <p className="tw-inline-flex tw-items-center tw-gap-2 tw-bg-amber-500/10 tw-border tw-border-amber-500/20 tw-text-amber-600 dark:tw-text-amber-500 tw-py-2 tw-px-5 tw-rounded-full tw-text-sm tw-font-bold tw-animate-pulse">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                {lang === 'AR' 
                  ? `سيتم توجيهك تلقائياً لصفحة حجوزاتك خلال ${countdown} ثوانٍ...` 
                  : `Redirecting you to your bookings page in ${countdown} seconds...`}
              </p>
            </div>
          ) : (
            /* Main Cancellation Form */
            <>
              <h2 className="tw-text-3xl tw-font-serif tw-font-bold tw-text-slate-900 dark:tw-text-amber-500 tw-mb-6">
                {lang === 'AR' ? 'تأكيد إلغاء الحجز' : 'Confirm Booking Cancellation'}
              </h2>

              <div className="tw-text-slate-600 dark:tw-text-slate-300 tw-mb-8 tw-leading-relaxed">
                <p className="tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-3 tw-text-lg">
                  {lang === 'AR' ? 'الشروط وقواعد الإلغاء:' : 'Policy & Cancellation Rules:'}
                </p>
                <ul className={`tw-flex tw-flex-col tw-gap-2 tw-text-sm ${lang === 'AR' ? 'tw-pr-5' : 'tw-pl-5'} tw-list-disc`}>
                  <li>{lang === 'AR' ? 'أول 24 ساعة بعد الحجز مباشرة: مجاني بالكامل (0%).' : 'First 24 hours after booking: Fully Free (0% fee).'}</li>
                  <li>{lang === 'AR' ? 'بعد مرور 24 ساعة (وقبل أكثر من أسبوع من الرحلة): خصم 5% رسوم إلغاء.' : 'After 24 hours (and more than 7 days before travel): 5% cancellation fee.'}</li>
                  <li>{lang === 'AR' ? 'خلال الأسبوع الأخير وحتى يومين قبل الرحلة: خصم 10% رسوم إلغاء.' : 'Within the last week up to 2 days before travel: 10% cancellation fee.'}</li>
                  <li>{lang === 'AR' ? 'قبل يومين (48 ساعة) أو أقل من موعد الرحلة: خصم 50% رسوم إلغاء.' : '2 days (48 hours) or less before travel: 50% cancellation fee.'}</li>
                </ul>
              </div>

              <div className="tw-bg-slate-50 dark:tw-bg-white/5 tw-border tw-border-slate-200 dark:tw-border-white/10 tw-rounded-lg tw-p-5 tw-mb-6">
                <p className="tw-font-bold tw-text-slate-900 dark:tw-text-white tw-mb-4 tw-flex tw-items-center tw-gap-2">
                  <i className="fa-solid fa-receipt tw-text-amber-500"></i>
                  {lang === 'AR' ? 'تفاصيل الحجز الحالي' : 'Booking Details'}
                </p>
                <div className="tw-flex tw-flex-col tw-gap-3 tw-text-sm tw-text-slate-600 dark:tw-text-slate-400">
                  <div className="tw-flex tw-justify-between">
                    <span>{lang === 'AR' ? 'رقم مرجع الحجز:' : 'Booking ID:'}</span>
                    <strong className="tw-text-slate-900 dark:tw-text-white tw-font-mono">#{booking._id.slice(-8).toUpperCase()}</strong>
                  </div>
                  <div className="tw-flex tw-justify-between">
                    <span>{lang === 'AR' ? 'تاريخ السفر:' : 'Travel Date:'}</span>
                    <strong className="tw-text-slate-900 dark:tw-text-white">
                      {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString(lang === 'AR' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (lang === 'AR' ? 'غير محدد' : 'N/A')}
                    </strong>
                  </div>
                  <div className="tw-flex tw-justify-between">
                    <span>{lang === 'AR' ? 'المبلغ الكلي المدفوع:' : 'Total Amount Paid:'}</span>
                    <strong className="tw-text-emerald-600 dark:tw-text-emerald-500">{booking.total_amount || 0} EGP</strong>
                  </div>
                </div>
              </div>

              <div className="tw-bg-amber-500/10 tw-border tw-border-amber-500/20 tw-rounded-lg tw-p-5 tw-mb-8">
                <p className="tw-font-bold tw-text-amber-600 dark:tw-text-amber-500 tw-mb-4">
                  {lang === 'AR' ? 'الحساب المالي للإلغاء الفعلي' : 'Calculated Cancellation Fee'}
                </p>
                <div className="tw-flex tw-flex-col tw-gap-3 tw-text-sm tw-text-slate-600 dark:tw-text-slate-400">
                  <div className="tw-flex tw-justify-between">
                    <span>{lang === 'AR' ? 'نسبة رسوم الإلغاء المحتسبة:' : 'Applicable Penalty Rate:'}</span>
                    <strong className="tw-text-slate-900 dark:tw-text-white">{feePercent}%</strong>
                  </div>
                  <div className="tw-flex tw-justify-between">
                    <span>{lang === 'AR' ? 'مبلغ رسوم الإلغاء المحتجز:' : 'Cancellation Fee Amount:'}</span>
                    <strong className="tw-text-red-500">{feeAmount} EGP</strong>
                  </div>
                  <div className="tw-border-t tw-border-amber-500/20 tw-my-2"></div>
                  <div className="tw-flex tw-justify-between tw-items-baseline">
                    <strong className="tw-text-slate-900 dark:tw-text-white">{lang === 'AR' ? 'المبلغ المسترد المتوقع:' : 'Expected Refund Amount:'}</strong>
                    <strong className="tw-text-emerald-600 dark:tw-text-emerald-500 tw-text-xl">{refundedAmount} EGP</strong>
                  </div>
                </div>
              </div>

              <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-4">
                <button 
                  onClick={() => navigate(-1)} 
                  className="tw-flex-1 tw-bg-transparent tw-border tw-border-slate-300 dark:tw-border-[#333333] tw-text-slate-700 dark:tw-text-[#aaaaaa] hover:tw-border-slate-400 hover:tw-text-slate-900 dark:hover:tw-border-slate-500 dark:hover:tw-text-white tw-font-bold tw-py-3 tw-rounded-sm tw-transition-colors tw-text-sm"
                >
                  {lang === 'AR' ? 'تراجع عن الإلغاء' : 'Go Back'}
                </button>
                <button 
                  onClick={handleConfirm} 
                  disabled={processing} 
                  className="tw-flex-1 tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-font-bold tw-py-3 tw-rounded-sm tw-transition-colors tw-text-sm tw-shadow-md"
                >
                  {processing ? (
                    <><i className="fa-solid fa-spinner fa-spin tw-mr-2"></i> {lang === 'AR' ? 'جاري الإلغاء...' : 'Cancelling...'}</>
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
