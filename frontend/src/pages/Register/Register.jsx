import React, { useState, useContext } from 'react';
import { toast } from '../../utils/toast';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerFailure, clearError } from '../../store/authSlice';
import { register } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Register.css';

const countries = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentinean", "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini", "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese", "Bhutanese", "Bolivian", "Bosnian", "Brazilian", "British", "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian", "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian", "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican", "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djibouti", "Dominican", "Dutch", "Ecuadorean", "Egyptian", "Emirian", "Equatorial Guinean", "Eritrean", "Estonian", "Ethiopian", "Fijian", "Filipino", "Finnish", "French", "Gabonese", "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan", "Guinean", "Guyanese", "Haitian", "Honduran", "Hungarian", "Icelander", "Indian", "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian", "Jamaican", "Japanese", "Jordanian", "Kazakhstani", "Kenyan", "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan", "Liechtensteiner", "Lithuanian", "Luxembourger", "Macedonian", "Malagasy", "Malawian", "Malaysian", "Maldivan", "Malian", "Maltese", "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monacan", "Mongolian", "Moroccan", "Mozambican", "Namibian", "Nauruan", "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", "North Korean", "Norwegian", "Omani", "Pakistani", "Palauan", "Panamanian", "Paraguayan", "Peruvian", "Polish", "Portuguese", "Qatari", "Romanian", "Russian", "Rwandan", "Salvadoran", "Samoan", "San Marinese", "Saudi", "Scottish", "Senegalese", "Serbian", "Seychellois", "Sierra Leonean", "Singaporean", "Slovakian", "Slovenian", "Somali", "South African", "South Korean", "Spanish", "Sri Lankan", "Sudanese", "Surinamer", "Swazi", "Swedish", "Swiss", "Syrian", "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan", "Trinidadian", "Tunisian", "Turkish", "Tuvaluan", "Ugandan", "Ukrainian", "Uruguayan", "Uzbekistani", "Venezuelan", "Vietnamese", "Welsh", "Yemenite", "Zambian", "Zimbabwean"
];

const Register = () => {
  const { lang } = useContext(LanguageContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ageDate, setAgeDate] = useState('');
  const [nationality, setNationality] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim() || firstName.trim().length < 3) {
      setFormError(lang === 'AR' ? 'الاسم الأول يجب أن يكون 3 أحرف على الأقل.' : 'First name must be at least 3 characters.');
      return;
    }
    if (!lastName.trim() || lastName.trim().length < 3) {
      setFormError(lang === 'AR' ? 'اسم العائلة يجب أن يكون 3 أحرف على الأقل.' : 'Last name must be at least 3 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError(lang === 'AR' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.');
      return;
    }
    if (!nationality) {
      setFormError(lang === 'AR' ? 'يرجى إدخال الجنسية الخاصة بك.' : 'Please enter your nationality.');
      return;
    }

    dispatch(clearError());
    setIsLoading(true);

    try {
      await register({ firstName: firstName.trim(), lastName: lastName.trim(), email, password, phoneNumber, nationality, ageDate });
      navigate('/verify', { state: { email, message: 'Registration successful! Please check your email for the OTP.' } });
    } catch (err) {
      dispatch(registerFailure(err.message || 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`tw-h-screen tw-w-full tw-flex ${lang === 'AR' ? 'tw-flex-row-reverse tw-text-right' : 'tw-flex-row tw-text-left'} tw-bg-[#0f1014] tw-overflow-hidden`}>
      
      {/* Image Half */}
      <div className="tw-hidden lg:tw-block tw-w-1/2 tw-h-full tw-relative">
        <div 
          className="tw-absolute tw-inset-0 tw-bg-cover tw-bg-center tw-bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=1920&auto=format&fit=crop")' }}
        ></div>
        <div className={`tw-absolute tw-inset-0 tw-bg-gradient-to-b lg:tw-bg-gradient-to-r tw-from-black/40 tw-via-black/60 tw-to-[#0f1014]`}></div>
        
        <div className="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-12 tw-text-center">
          <Link to="/" className="tw-text-6xl xl:tw-text-7xl tw-font-serif tw-font-bold tw-text-white tw-tracking-[0.05em] tw-mb-4 hover:tw-text-[#d4af37] tw-transition-colors">
            CLEARPATH
          </Link>
          <p className="tw-text-[#d4af37] tw-tracking-[0.2em] tw-uppercase tw-text-sm tw-font-semibold tw-mb-4">
            {lang === 'AR' ? 'استكشف عظمة التاريخ' : 'Discover Ancient Majesty'}
          </p>
          <div className="tw-w-12 tw-h-[1px] tw-bg-[#d4af37]"></div>
        </div>
      </div>

      {/* Form Half */}
      <div className="tw-w-full lg:tw-w-1/2 tw-h-full tw-flex tw-flex-col tw-justify-center tw-px-8 lg:tw-px-16 xl:tw-px-24 tw-py-12 tw-relative tw-overflow-y-auto tw-bg-[#0f1014] tw-scrollbar-thin tw-scrollbar-thumb-[#d4af37]/20 tw-scrollbar-track-transparent hover:tw-scrollbar-thumb-[#d4af37]/40">
        
        <div className="lg:tw-hidden tw-absolute tw-top-8 tw-flex tw-justify-center tw-w-full">
           <Link to="/" className="tw-text-2xl tw-font-serif tw-font-bold tw-text-white tw-tracking-[0.05em]">
            CLEARPATH
          </Link>
        </div>

        <div className="tw-w-full tw-max-w-xl tw-mx-auto tw-mt-12 lg:tw-mt-0">
          <div className="tw-mb-10">
            <h2 className="tw-text-4xl tw-font-serif tw-font-bold tw-text-white tw-tracking-wider tw-mb-3">
              {lang === 'AR' ? 'إنشاء حساب' : 'REGISTER'}
            </h2>
            <p className="tw-text-sm tw-text-slate-400 tw-font-light">
              {lang === 'AR' ? 'أدخل تفاصيلك للانضمام إلينا' : 'Enter your details to join us'}
            </p>
          </div>

          {(formError || error) && (() => {
            const raw = formError || error || '';
            let msg = raw;
            try {
              const t = raw.trim();
              if (t.startsWith('[') || t.startsWith('{')) {
                const p = JSON.parse(t);
                if (Array.isArray(p)) msg = p.map(e => e.message || e.msg || String(e)).join('. ');
                else if (p?.message) msg = p.message;
              }
            } catch {}
            return (
              <div className="tw-bg-rose-500/10 tw-text-rose-400 tw-p-3 tw-rounded-sm tw-text-sm tw-mb-2 tw-border tw-border-rose-500/20 tw-flex tw-items-center tw-gap-2">
                <i className="fa-solid fa-circle-exclamation tw-flex-shrink-0"></i>
                <span>{msg}</span>
              </div>
            );
          })()}
          
          <form onSubmit={handleRegister} className="tw-flex tw-flex-col tw-gap-8">
            
            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-8 sm:tw-gap-6">
              <div className="tw-flex-1 tw-flex tw-flex-col">
                <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'الاسم الأول' : 'FIRST NAME'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-regular fa-user tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm ${lang === 'AR' ? 'tw-pr-10 tw-pl-2' : 'tw-pl-10 tw-pr-2'}`}
                  />
                </div>
              </div>

              <div className="tw-flex-1 tw-flex tw-flex-col">
                <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'الاسم الأخير' : 'LAST NAME'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-regular fa-user tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm ${lang === 'AR' ? 'tw-pr-10 tw-pl-2' : 'tw-pl-10 tw-pr-2'}`}
                  />
                </div>
              </div>
            </div>

            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-8 sm:tw-gap-6">
              <div className="tw-flex-1 tw-flex tw-flex-col">
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
                  />
                </div>
              </div>

              <div className="tw-flex-1 tw-flex tw-flex-col">
                <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'رقم الهاتف' : 'PHONE NUMBER'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-solid fa-phone tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm ${lang === 'AR' ? 'tw-pr-10 tw-pl-2' : 'tw-pl-10 tw-pr-2'}`}
                  />
                </div>
              </div>
            </div>

            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-8 sm:tw-gap-6">
              <div className="tw-flex-1 tw-flex tw-flex-col">
                <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'تاريخ الميلاد' : 'DATE OF BIRTH'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <input
                    type="date"
                    required
                    value={ageDate}
                    onChange={(e) => setAgeDate(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm`}
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="tw-flex-1 tw-flex tw-flex-col">
                <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'الجنسية' : 'NATIONALITY'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-solid fa-globe tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="text"
                    list="country-list"
                    required
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm ${lang === 'AR' ? 'tw-pr-10 tw-pl-2' : 'tw-pl-10 tw-pr-2'}`}
                    autoComplete="off"
                  />
                  <datalist id="country-list">
                    {countries.map(country => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="tw-flex tw-flex-col sm:tw-flex-row tw-gap-8 sm:tw-gap-6">
              <div className="tw-flex-1 tw-flex tw-flex-col">
                <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'كلمة المرور' : 'PASSWORD'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-solid fa-lock tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm tw-tracking-[0.2em] ${lang === 'AR' ? 'tw-pr-10 tw-pl-2' : 'tw-pl-10 tw-pr-2'}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="tw-flex-1 tw-flex tw-flex-col">
                <label className="tw-text-[11px] tw-font-bold tw-text-slate-300 tw-tracking-[0.15em] tw-uppercase tw-mb-3">
                  {lang === 'AR' ? 'تأكيد كلمة المرور' : 'CONFIRM PASSWORD'}
                </label>
                <div className="tw-relative tw-flex tw-items-center">
                  <i className={`fa-solid fa-lock tw-absolute tw-text-slate-400 tw-text-sm ${lang === 'AR' ? 'tw-right-2' : 'tw-left-2'}`}></i>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`tw-w-full tw-bg-transparent tw-border-0 tw-border-b tw-border-slate-700/80 tw-text-white tw-py-2 focus:tw-outline-none focus:tw-ring-0 focus:tw-border-[#d4af37] tw-transition-colors tw-text-sm tw-tracking-[0.2em] ${lang === 'AR' ? 'tw-pr-10 tw-pl-2' : 'tw-pl-10 tw-pr-2'}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="tw-w-full tw-bg-[#dcae44] hover:tw-bg-[#e5c35b] tw-text-black tw-font-bold tw-tracking-[0.15em] tw-uppercase tw-py-3.5 tw-rounded-sm tw-mt-4 tw-transition-all hover:tw-shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:tw-opacity-50"
            >
              {isLoading ? (lang === 'AR' ? 'جاري التسجيل...' : 'REGISTERING...') : (lang === 'AR' ? 'سجل معنا' : 'REGISTER')}
            </button>

            <div className="tw-text-center tw-text-sm tw-text-slate-300 tw-mt-4 tw-font-light">
              <span>{lang === 'AR' ? 'لديك حساب بالفعل؟ ' : "Already have an account? "}</span>
              <Link to="/login" className="tw-text-white tw-font-semibold tw-border-b tw-border-white hover:tw-text-[#d4af37] hover:tw-border-[#d4af37] tw-pb-0.5 tw-transition-colors">
                {lang === 'AR' ? 'تسجيل الدخول' : 'Log In'}
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default Register;
