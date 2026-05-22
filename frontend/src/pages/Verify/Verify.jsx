import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyAccount } from '../../utils/api';
import './Verify.css';

const Verify = () => {
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
      navigate('/login', { state: { message: 'Account verified successfully! You can now log in.' } });
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-container">
      <form onSubmit={handleVerify}>
        <h2>Verify Account</h2>
        <p className="subtitle">An OTP has been sent to your email.</p>
        
        {message && <p className="success-msg">{message}</p>}
        {error && <p className="error-msg">{error}</p>}
        
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          readOnly={!!location.state?.email}
          className={location.state?.email ? 'readonly-input' : ''}
        />
        <input
          type="text"
          placeholder="Enter OTP (e.g. 12345)"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Account'}
        </button>
        <p>
          Already verified? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Verify;
