import React, { useState, useRef, useContext, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyAccount } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';

const Verify = () => {
  const { lang } = useContext(LanguageContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;

    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedData.length, 5);
      inputRefs.current[nextIndex].focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    
    if (finalOtp.length < 6) {
      setError(lang === 'AR' ? 'يرجى إدخال الرمز المكون من 6 أرقام بالكامل.' : 'Please enter the full 6-digit code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await verifyAccount({ email, otp: finalOtp });
      navigate('/login', { state: { message: lang === 'AR' ? 'تم تفعيل الحساب بنجاح! يمكنك الآن تسجيل الدخول.' : 'Account verified successfully! You can now log in.' } });
    } catch (err) {
      setError(lang === 'AR' ? 'فشل تفعيل الحساب. الرمز غير صحيح.' : (err.message || 'Verification failed. Please check your OTP.'));
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

      {/* Back Arrow */}
      <div className="tw-absolute tw-top-8 tw-left-8 tw-z-20">
        <button onClick={() => navigate(-1)} className="tw-text-white hover:tw-text-[#dcae44] tw-transition-colors">
          <i className="fa-solid fa-arrow-left tw-text-2xl"></i>
        </button>
      </div>

      {/* Content */}
      <div className="tw-relative tw-z-10 tw-w-full tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center tw-px-6 tw-py-12 tw-overflow-y-auto">
        <div className="tw-w-full tw-max-w-sm tw-flex tw-flex-col tw-items-center">
          
          <h1 className="tw-text-3xl tw-font-bold tw-text-white tw-mb-4 tw-text-center">
            {lang === 'AR' ? 'تفعيل حسابك' : 'Verify Your Account'}
          </h1>
          <p className="tw-text-slate-300 tw-text-center tw-mb-8 tw-leading-relaxed tw-font-light">
            {lang === 'AR' ? "لقد أرسلنا رمز تفعيل مكون من 6 أرقام إلى بريدك الإلكتروني." : "We've sent a 6-digit verification code to your email address."}
          </p>

          {message && (
            <div className="tw-w-full tw-bg-[#0a1f14] tw-border tw-border-[#1b3a26] tw-rounded-xl tw-p-4 tw-mb-8 tw-text-center">
              <p className="tw-text-[#2ecc71] tw-text-sm tw-font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="tw-w-full tw-bg-rose-950/30 tw-border tw-border-rose-900 tw-rounded-xl tw-p-4 tw-mb-8 tw-text-center">
              <p className="tw-text-rose-500 tw-text-sm tw-font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="tw-w-full tw-flex tw-flex-col tw-gap-8">
            
            <div className="tw-flex tw-flex-col">
              <label className="tw-text-[#dcae44] tw-text-[11px] tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                {lang === 'AR' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!!location.state?.email}
                className="tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-800 tw-text-white tw-py-3 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#dcae44] tw-transition-colors tw-text-base"
                placeholder="name@example.com"
              />
            </div>

            <div className="tw-flex tw-flex-col tw-mt-2">
              <label className="tw-text-[#dcae44] tw-text-[11px] tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-mb-4 tw-text-center">
                {lang === 'AR' ? 'أدخل الرمز' : 'ENTER CODE'}
              </label>
              
              {/* Modern 6 Box OTP Input */}
              <div className="tw-flex tw-justify-between tw-gap-2 tw-mb-6" dir="ltr">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="6"
                    ref={el => inputRefs.current[index] = el}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="tw-w-10 tw-h-12 sm:tw-w-12 sm:tw-h-14 tw-bg-white/10 tw-border-0 tw-border-b-2 tw-border-slate-600 tw-rounded-t-md tw-text-white tw-text-xl tw-font-semibold tw-text-center focus:tw-outline-none focus:tw-bg-white/20 focus:tw-border-[#dcae44] tw-transition-all"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || otp.join('').length < 6}
              className="tw-w-full tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-tracking-[0.1em] tw-uppercase tw-py-4 tw-rounded-full tw-transition-all hover:tw-shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:tw-opacity-50"
            >
              {isLoading ? (lang === 'AR' ? 'جاري التحقق...' : 'VERIFYING...') : (lang === 'AR' ? 'تأكيد' : 'VERIFY ACCOUNT')}
            </button>

            <div className="tw-text-center tw-text-slate-400 tw-text-sm tw-mt-4">
              <span>{lang === 'AR' ? 'تم التفعيل بالفعل؟ ' : 'Already verified? '}</span>
              <Link to="/login" className="tw-text-[#dcae44] tw-font-medium tw-border-b tw-border-[#dcae44] hover:tw-text-white hover:tw-border-white tw-pb-0.5 tw-transition-colors">
                {lang === 'AR' ? 'سجل الدخول هنا' : 'Log in here'}
              </Link>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
};

export default Verify;
