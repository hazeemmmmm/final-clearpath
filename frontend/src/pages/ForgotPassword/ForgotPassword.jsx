import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../utils/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
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
      setSuccess('A 6-digit password reset OTP has been sent to your email.');
      setPhase('reset');
    } catch (err) {
      setError(err.message || 'Failed to request reset OTP. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ email, otp, newPassword });
      navigate('/login', { state: { message: 'Password reset successfully! You can now log in with your new password.' } });
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please check your OTP and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper">
      <div className="mainpage">
        <div className="forgotform">
          <div className="forgotr d-flex justify-content-center align-items-center">
            <div className="formholder">
              
              {phase === 'request' ? (
                <form className="form" onSubmit={handleRequestOTP}>
                  <p className="title">Reset Password</p>
                  <p className="subtitle" style={{ textAlign: 'center', color: '#e2e8f0', margin: '0 0 15px 0', fontSize: '0.88rem', opacity: 0.8 }}>
                    Enter your email address and we will send you a 6-digit OTP code to recover your account.
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
                    <span>Email Address</span>
                  </label>

                  <button className="submit" type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Send Reset Code'}
                  </button>
                  
                  <p className="signin">
                    Remember your password? <Link className="loginBtn btn btn-primary" to="/login">Log In</Link>
                  </p>
                </form>
              ) : (
                <form className="form" onSubmit={handleResetPassword}>
                  <p className="title">New Password</p>
                  <p className="subtitle" style={{ textAlign: 'center', color: '#e2e8f0', margin: '0 0 15px 0', fontSize: '0.88rem', opacity: 0.8 }}>
                    Please enter the 6-digit OTP code sent to your inbox and define your new login credentials.
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
                    <span>6-Digit Verification Code</span>
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
                    <span>New Password</span>
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
                    <span>Confirm New Password</span>
                  </label>

                  <button className="submit" type="submit" disabled={isLoading}>
                    {isLoading ? 'Resetting Password...' : 'Save Credentials'}
                  </button>
                  
                  <p className="signin">
                    Go back to <Link className="loginBtn btn btn-primary" to="/login">Login</Link>
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
