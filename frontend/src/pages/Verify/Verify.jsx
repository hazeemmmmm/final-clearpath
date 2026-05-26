import React, { useState, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyAccount } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Verify.css';

const Verify = () => {
  const { lang } = useContext(LanguageContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from location state, or empty string if not passed
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await verifyAccount({ email, otp });
      // Verification successful, redirect to login
      navigate('/login', { state: { message: lang === 'AR' ? 'تم تفعيل الحساب بنجاح! يمكنك الآن تسجيل الدخول.' : 'Account verified successfully! You can now log in.' } });
    } catch (err) {
      setError(lang === 'AR' ? 'فشل تفعيل الحساب. يرجى التحقق من الرمز والبريد الإلكتروني.' : (err.message || 'Verification failed. Please check your OTP.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`verify-wrapper ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <div className="mainpage">
        <div className="verifyform">
          <div className="verifyr d-flex justify-content-center align-items-center">
            <div className="formholder">
              <form className="form" onSubmit={handleVerify}>
                <p className="title">{lang === 'AR' ? 'تفعيل الحساب' : 'Verify Account'}</p>
                <p className="subtitle" style={{ textAlign: 'center', color: '#e2e8f0', margin: '0 0 15px 0', fontSize: '0.88rem', opacity: 0.8 }}>
                  {lang === 'AR' ? 'تم إرسال رمز تفعيل OTP إلى عنوان بريدك الإلكتروني.' : 'An OTP verification code has been dispatched to your email address.'}
                </p>
                
                {message && <div className="alert alert-success-custom">{message}</div>}
                {error && <div className="alert alert-error-custom">{error}</div>}
                
                <label htmlFor="email">
                  <input
                    type="email"
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    readOnly={!!location.state?.email}
                    className={`input ${location.state?.email ? 'readonly-input' : ''}`}
                    id="email"
                  />
                  <span>{lang === 'AR' ? 'عنوان البريد الإلكتروني' : 'Email Address'}</span>
                </label>

                <label htmlFor="otp">
                  <input
                    type="text"
                    placeholder=""
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="input"
                    id="otp"
                    autoComplete="off"
                  />
                  <span>{lang === 'AR' ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter 6-Digit OTP'}</span>
                </label>

                <button className="submit" type="submit" disabled={isLoading}>
                  {isLoading ? (lang === 'AR' ? 'جاري التحقق...' : 'Verifying...') : (lang === 'AR' ? 'تفعيل الرمز' : 'Verify OTP')}
                </button>
                
                <p className="signin">
                  {lang === 'AR' ? 'تم تفعيل حسابك بالفعل؟ ' : 'Already verified? '} 
                  <Link className="loginBtn btn btn-primary" to="/login">{lang === 'AR' ? 'تسجيل الدخول هنا' : 'Login here'}</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
