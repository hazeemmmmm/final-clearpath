import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure, clearError } from '../../store/authSlice';
import { login } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Login.css';

const Login = () => {
  const { lang } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginStart());

    try {
      const response = await login({ email, password });
      // Depending on API structure, token might be inside data
      const token = response.data?.accessToken || response.accessToken;
      const user = response.data?.user || response.user;
      dispatch(loginSuccess({ token, user }));
      console.log('Login successful');
      navigate('/');
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      dispatch(loginFailure(errorMessage));
      console.error('Login error:', err);
    }
  };

  return (
    <div className={`login-wrapper ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <div className="container">
        <div className="login-box">
          <h2>{lang === 'AR' ? 'تسجيل الدخول' : 'LOGIN'}</h2>
          
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {error && <div className="alert alert-error">{lang === 'AR' ? 'فشل تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور.' : error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">{lang === 'AR' ? 'البريد الإلكتروني' : 'Email'}</label>
              <i className="ri-mail-line"></i>
            </div>
            
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">{lang === 'AR' ? 'كلمة المرور' : 'Password'}</label>
              <i 
                className={showPassword ? "ri-eye-line" : "ri-eye-off-line"} 
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer' }}
              ></i>
              <Link to="/forgot-password" className="forgot">{lang === 'AR' ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?'}</Link>
            </div>
            
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">{lang === 'AR' ? 'تذكرني' : 'Remember Me'}</label>
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (lang === 'AR' ? 'جاري الدخول...' : 'Logging in...') : (lang === 'AR' ? 'دخول' : 'Login')}
            </button>
            
            <div className="register-link">
              <span>{lang === 'AR' ? 'ليس لديك حساب؟ ' : "Don't have an Account? "}</span>
              <Link to="/register">{lang === 'AR' ? 'سجل الآن' : 'Register'}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;