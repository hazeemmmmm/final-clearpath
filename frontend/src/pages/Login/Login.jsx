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
    <div className={`tw-h-screen tw-w-full tw-flex ${lang === 'AR' ? 'tw-flex-row-reverse tw-text-right' : 'tw-flex-row tw-text-left'} tw-bg-[#0f1014] tw-overflow-hidden`}>
      
      {/* Image Half */}
      <div className="tw-hidden md:tw-block tw-w-1/2 tw-h-full tw-relative">
        <div 
          className="tw-absolute tw-inset-0 tw-bg-cover tw-bg-center tw-bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1920&auto=format&fit=crop")' }}
        ></div>
        {/* Gradient Overlay to blend with form */}
        <div className={`tw-absolute tw-inset-0 tw-bg-gradient-to-b md:tw-bg-gradient-to-r tw-from-black/40 tw-via-black/60 tw-to-[#0f1014]`}></div>
        
        {/* Brand Text over Image */}
        <div className="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-12 tw-text-center">
          <Link to="/" className="tw-text-6xl lg:tw-text-7xl tw-font-serif tw-font-bold tw-text-white tw-tracking-[0.05em] tw-mb-4 hover:tw-text-[#d4af37] tw-transition-colors">
            CLEARPATH
          </Link>
          <p className="tw-text-[#d4af37] tw-tracking-[0.2em] tw-uppercase tw-text-sm tw-font-semibold tw-mb-4">
            {lang === 'AR' ? 'استكشف عظمة التاريخ' : 'Discover Ancient Majesty'}
          </p>
          <div className="tw-w-12 tw-h-[1px] tw-bg-[#d4af37]"></div>
        </div>
      </div>

      {/* Form Half */}
      <div className="tw-w-full md:tw-w-1/2 tw-h-full tw-flex tw-flex-col tw-justify-center tw-px-8 md:tw-px-16 lg:tw-px-28 tw-py-12 tw-relative tw-overflow-y-auto tw-bg-[#0f1014]">
        
        {/* Home Link for Mobile */}
        <div className="md:tw-hidden tw-absolute tw-top-8 tw-flex tw-justify-center tw-w-full">
           <Link to="/" className="tw-text-2xl tw-font-serif tw-font-bold tw-text-white tw-tracking-[0.05em]">
            CLEARPATH
          </Link>
        </div>

        <div className="tw-w-full tw-max-w-md tw-mx-auto tw-mt-12 md:tw-mt-0">
          <div className="tw-mb-12">
            <h2 className="tw-text-4xl tw-font-serif tw-font-bold tw-text-white tw-tracking-wider tw-mb-3">
              {lang === 'AR' ? 'تسجيل الدخول' : 'LOGIN'}
            </h2>
            <p className="tw-text-sm tw-text-slate-400 tw-font-light">
              {lang === 'AR' ? 'أدخل تفاصيل حسابك للمتابعة' : 'Enter your details to continue'}
            </p>
          </div>

          {successMessage && <div className="tw-bg-emerald-500/10 tw-text-emerald-400 tw-p-3 tw-rounded-sm tw-text-sm tw-mb-6 tw-border tw-border-emerald-500/20 tw-text-center">{successMessage}</div>}
          {error && <div className="tw-bg-rose-500/10 tw-text-rose-400 tw-p-3 tw-rounded-sm tw-text-sm tw-mb-6 tw-border tw-border-rose-500/20 tw-text-center">{lang === 'AR' ? 'فشل تسجيل الدخول. يرجى التأكد من البيانات.' : error}</div>}
          
          <form onSubmit={handleLogin} className="tw-flex tw-flex-col tw-gap-8">
            
            <div className="tw-flex tw-flex-col">
              <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                {lang === 'AR' ? 'البريد الإلكتروني' : 'EMAIL'}
              </label>
              <div className="tw-relative tw-flex tw-items-center">
                <i className={`fa-regular fa-envelope tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm ${lang === 'AR' ? 'tw-pr-10 tw-pl-2' : 'tw-pl-10 tw-pr-2'}`}
                  placeholder="curated@luxurytravel.com"
                />
              </div>
            </div>

            <div className="tw-flex tw-flex-col">
              <div className="tw-flex tw-justify-between tw-items-center tw-mb-3">
                <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase">
                  {lang === 'AR' ? 'كلمة المرور' : 'PASSWORD'}
                </label>
                <Link to="/forgot-password" className="tw-text-[11px] tw-text-slate-500 hover:tw-text-[#d4af37] tw-transition-colors tw-italic">
                  {lang === 'AR' ? 'نسيت كلمة المرور؟' : 'forgot password?'}
                </Link>
              </div>
              <div className="tw-relative tw-flex tw-items-center">
                <i className={`fa-solid fa-lock tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm tw-tracking-[0.2em] ${lang === 'AR' ? 'tw-pr-10 tw-pl-10' : 'tw-pl-10 tw-pr-10'}`}
                  placeholder="••••••••"
                />
                <i 
                  className={`fa-solid ${showPassword ? 'fa-eye' : 'fa-eye-slash'} tw-absolute tw-text-slate-500 tw-cursor-pointer hover:tw-text-white tw-transition-colors tw-text-sm ${lang === 'AR' ? 'tw-left-2' : 'tw-right-2'}`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
            </div>

            <div className="tw-flex tw-items-center tw-gap-3 tw-mt-2">
              <div className="tw-relative tw-flex tw-items-center tw-justify-center tw-w-4 tw-h-4">
                <input type="checkbox" id="remember" className="tw-peer tw-appearance-none tw-w-4 tw-h-4 tw-border tw-border-slate-600 tw-rounded-sm tw-bg-transparent checked:tw-bg-transparent checked:tw-border-[#d4af37] focus:tw-outline-none focus:tw-ring-0 tw-cursor-pointer tw-transition-colors" />
                <i className="fa-solid fa-check tw-absolute tw-text-[#d4af37] tw-text-[10px] tw-opacity-0 peer-checked:tw-opacity-100 tw-pointer-events-none tw-transition-opacity"></i>
              </div>
              <label htmlFor="remember" className="tw-text-sm tw-text-slate-300 tw-font-light tw-cursor-pointer">{lang === 'AR' ? 'تذكرني' : 'Remember Me'}</label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="tw-w-full tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-py-3.5 tw-rounded-sm tw-mt-4 tw-transition-all hover:tw-shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:tw-opacity-50"
            >
              {isLoading ? (lang === 'AR' ? 'جاري الدخول...' : 'LOGGING IN...') : (lang === 'AR' ? 'دخول' : 'LOGIN')}
            </button>

            <div className="tw-text-center tw-text-sm tw-text-slate-300 tw-mt-8 tw-font-light">
              <span>{lang === 'AR' ? 'ليس لديك حساب؟ ' : "Don't have an Account? "}</span>
              <Link to="/register" className="tw-text-white tw-font-semibold tw-border-b tw-border-white hover:tw-text-[#d4af37] hover:tw-border-[#d4af37] tw-pb-0.5 tw-transition-colors">
                {lang === 'AR' ? 'سجل الآن' : 'Register'}
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Login;