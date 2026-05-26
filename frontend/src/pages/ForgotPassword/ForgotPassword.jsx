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
    <div className={`forgot-wrapper ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <div className="mainpage">
        <div className="forgotform">
          <div className="forgotr d-flex justify-content-center align-items-center">
            <div className="formholder">
              
              {phase === 'request' ? (
                <form className="form" onSubmit={handleRequestOTP}>
                  <p className="title">{lang === 'AR' ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}</p>
                  <p className="subtitle" style={{ textAlign: 'center', color: '#e2e8f0', margin: '0 0 15px 0', fontSize: '0.88rem', opacity: 0.8 }}>
                    {lang === 'AR' ? 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رمز OTP مكون من 6 أرقام لاستعادة حسابك.' : 'Enter your email address and we will send you a 6-digit OTP code to recover your account.'}
                  </p>
                  
                  {error && <div className="alert alert-error-custom">{error}</div>}
                  {success && <div className="alert alert-success-custom">{success}</div>}
                  
                  <label htmlFor="email">
                    <input
                      type="email"
                      placeholder=""
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input"
                      id="email"
                    />
                    <span>{lang === 'AR' ? 'عنوان البريد الإلكتروني' : 'Email Address'}</span>
                  </label>

                  <button className="submit" type="submit" disabled={isLoading}>
                    {isLoading ? (lang === 'AR' ? 'جاري الإرسال...' : 'Sending OTP...') : (lang === 'AR' ? 'إرسال رمز إعادة التعيين' : 'Send Reset Code')}
                  </button>
                  
                  <p className="signin">
                    {lang === 'AR' ? 'هل تتذكر كلمة المرور؟ ' : 'Remember your password? '} 
                    <Link className="loginBtn btn btn-primary" to="/login">{lang === 'AR' ? 'تسجيل الدخول' : 'Log In'}</Link>
                  </p>
                </form>
              ) : (
                <form className="form" onSubmit={handleResetPassword}>
                  <p className="title">{lang === 'AR' ? 'كلمة مرور جديدة' : 'New Password'}</p>
                  <p className="subtitle" style={{ textAlign: 'center', color: '#e2e8f0', margin: '0 0 15px 0', fontSize: '0.88rem', opacity: 0.8 }}>
                    {lang === 'AR' ? 'يرجى إدخال رمز التحقق المكون من 6 أرقام المرسل إلى بريدك الإلكتروني وتحديد كلمة المرور الجديدة.' : 'Please enter the 6-digit OTP code sent to your inbox and define your new login credentials.'}
                  </p>
                  
                  {error && <div className="alert alert-error-custom">{error}</div>}
                  {success && <div className="alert alert-success-custom">{success}</div>}
                  
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
                    <span>{lang === 'AR' ? 'رمز التحقق المكون من 6 أرقام' : '6-Digit Verification Code'}</span>
                  </label>

                  <label htmlFor="newPassword">
                    <input
                      type="password"
                      placeholder=""
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="input"
                      id="newPassword"
                    />
                    <span>{lang === 'AR' ? 'كلمة المرور الجديدة' : 'New Password'}</span>
                  </label>

                  <label htmlFor="confirmPassword">
                    <input
                      type="password"
                      placeholder=""
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="input"
                      id="confirmPassword"
                    />
                    <span>{lang === 'AR' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</span>
                  </label>

                  <button className="submit" type="submit" disabled={isLoading}>
                    {isLoading ? (lang === 'AR' ? 'جاري تعيين كلمة المرور...' : 'Resetting Password...') : (lang === 'AR' ? 'حفظ البيانات' : 'Save Credentials')}
                  </button>
                  
                  <p className="signin">
                    {lang === 'AR' ? 'الرجوع إلى ' : 'Go back to '} 
                    <Link className="loginBtn btn btn-primary" to="/login">{lang === 'AR' ? 'تسجيل الدخول' : 'Login'}</Link>
                  </p>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
