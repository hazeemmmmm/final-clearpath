import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { lang } = useContext(LanguageContext);
  const navigate = useNavigate();
  
  // State for phase management: 'request' or 'reset'
  const [phase, setPhase] = useState('request'); 
  
  // Inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UX States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await forgotPassword({ email });
      setSuccess(lang === 'AR' ? 'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني.' : 'A 6-digit password reset OTP has been sent to your email.');
      setPhase('reset');
    } catch (err) {
      setError(lang === 'AR' ? 'فشل إرسال رمز التحقق. يرجى التأكد من البريد الإلكتروني.' : (err.message || 'Failed to request reset OTP. Please check your email.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError(lang === 'AR' ? 'كلمات المرور الجديدة غير متطابقة.' : 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, otp, newPassword });
      navigate('/login', { state: { message: lang === 'AR' ? 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.' : 'Password reset successfully! You can now log in with your new password.' } });
    } catch (err) {
      setError(lang === 'AR' ? 'فشل إعادة تعيين كلمة المرور. يرجى التحقق من رمز OTP المدخل والمحاولة مجدداً.' : (err.message || 'Failed to reset password. Please check your OTP and try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`tw-h-screen tw-w-full tw-flex tw-flex-col tw-bg-[#0f1014] ${lang === 'AR' ? 'tw-text-right' : 'tw-text-left'} tw-relative tw-overflow-hidden`}>
      
      {/* Background Image & Overlay */}
      <div className="tw-absolute tw-inset-0 tw-z-0">
        <div 
          className="tw-absolute tw-inset-0 tw-bg-cover tw-bg-center tw-bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1920&auto=format&fit=crop")' }}
        ></div>
        <div className="tw-absolute tw-inset-0 tw-bg-black/85"></div>
      </div>

      {/* Return Link (Top Corner) */}
      <div className={`tw-absolute tw-top-8 ${lang === 'AR' ? 'tw-left-8' : 'tw-right-8'} tw-z-20`}>
        <button onClick={() => navigate('/login')} className="tw-text-[#dcae44] hover:tw-text-white tw-transition-colors tw-font-bold tw-text-xs tw-tracking-[0.2em] tw-uppercase tw-flex tw-items-center tw-gap-2">
          {lang === 'AR' ? (
            <><i className="fa-solid fa-arrow-left"></i> العودة</>
          ) : (
            <>RETURN <i className="fa-solid fa-arrow-right"></i></>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="tw-relative tw-z-10 tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-px-6 tw-py-12 tw-overflow-y-auto">
        <div className="tw-w-full tw-max-w-md tw-flex tw-flex-col">
          
          <div className="tw-mb-12 tw-text-center">
            <h1 className="tw-text-3xl md:tw-text-4xl tw-font-serif tw-font-bold tw-text-white tw-tracking-wider tw-mb-4">
              {phase === 'request' 
                ? (lang === 'AR' ? 'استعادة الحساب' : 'FORGOT PASSWORD') 
                : (lang === 'AR' ? 'كلمة مرور جديدة' : 'RESET PASSWORD')}
            </h1>
            <p className="tw-text-slate-400 tw-text-sm tw-font-light tw-leading-relaxed">
              {phase === 'request'
                ? (lang === 'AR' ? 'أدخل بريدك الإلكتروني وسنرسل لك رمز استعادة الحساب.' : 'Enter your email address and we will send you a 6-digit recovery code.')
                : (lang === 'AR' ? 'أدخل الرمز المكون من 6 أرقام وقم بتعيين كلمة مرور جديدة.' : 'Please enter the 6-digit code sent to your inbox and define your new password.')}
            </p>
          </div>

          {error && (
            <div className="tw-w-full tw-bg-rose-950/30 tw-border tw-border-rose-900 tw-rounded-sm tw-p-4 tw-mb-8 tw-text-center">
              <p className="tw-text-rose-500 tw-text-sm tw-font-medium">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="tw-w-full tw-bg-[#0a1f14] tw-border tw-border-[#1b3a26] tw-rounded-sm tw-p-4 tw-mb-8 tw-text-center">
              <p className="tw-text-[#2ecc71] tw-text-sm tw-font-medium">{success}</p>
            </div>
          )}

          {phase === 'request' ? (
            <form onSubmit={handleRequestOTP} className="tw-flex tw-flex-col tw-gap-8">
              <div className="tw-flex tw-flex-col">
                <label className="tw-text-[#dcae44] tw-text-[11px] tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-regular fa-envelope tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-800 tw-text-white tw-py-3 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#dcae44] tw-transition-colors tw-text-base ${lang === 'AR' ? 'tw-pr-10' : 'tw-pl-10'}`}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="tw-w-full tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-py-4 tw-rounded-sm tw-mt-4 tw-transition-all hover:tw-shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:tw-opacity-50"
              >
                {isLoading ? (lang === 'AR' ? 'جاري الإرسال...' : 'SENDING...') : (lang === 'AR' ? 'إرسال الرمز' : 'SEND RECOVERY CODE')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="tw-flex tw-flex-col tw-gap-8">
              <div className="tw-flex tw-flex-col">
                <label className="tw-text-[#dcae44] tw-text-[11px] tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'رمز التحقق (6 أرقام)' : '6-DIGIT CODE'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-solid fa-key tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    autoComplete="off"
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-800 tw-text-white tw-py-3 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#dcae44] tw-transition-colors tw-text-xl tw-tracking-[0.3em] tw-font-semibold ${lang === 'AR' ? 'tw-pr-10' : 'tw-pl-10'}`}
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className="tw-flex tw-flex-col">
                <label className="tw-text-[#dcae44] tw-text-[11px] tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'كلمة المرور الجديدة' : 'NEW PASSWORD'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-solid fa-lock tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-800 tw-text-white tw-py-3 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#dcae44] tw-transition-colors tw-text-base tw-tracking-[0.2em] ${lang === 'AR' ? 'tw-pr-10' : 'tw-pl-10'}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="tw-flex tw-flex-col">
                <label className="tw-text-[#dcae44] tw-text-[11px] tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'تأكيد كلمة المرور' : 'CONFIRM PASSWORD'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-solid fa-lock tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-800 tw-text-white tw-py-3 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#dcae44] tw-transition-colors tw-text-base tw-tracking-[0.2em] ${lang === 'AR' ? 'tw-pr-10' : 'tw-pl-10'}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="tw-w-full tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-py-4 tw-rounded-sm tw-mt-4 tw-transition-all hover:tw-shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:tw-opacity-50"
              >
                {isLoading ? (lang === 'AR' ? 'جاري الحفظ...' : 'SAVING...') : (lang === 'AR' ? 'حفظ البيانات' : 'RESET PASSWORD')}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
