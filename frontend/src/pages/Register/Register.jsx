import React, { useState, useContext } from 'react';
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
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(lang === 'AR' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.');
      return;
    }
    if (!nationality) {
      alert(lang === 'AR' ? 'يرجى إدخال الجنسية الخاصة بك.' : 'Please enter your Nationality.');
      return;
    }
    
    dispatch(clearError());
    setIsLoading(true);

    const fullName = `${firstName} ${lastName}`.trim();

    try {
      await register({ fullName, email, password, phoneNumber, nationality, ageDate });
      navigate('/verify', { state: { email, message: 'Registration successful! Please check your email for the OTP.' } });
    } catch (err) {
      dispatch(registerFailure(err.message || 'Registration failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`register-wrapper ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <div className="mainpage">
        <div className="registerform">
          <div className="registerr d-flex justify-content-center align-items-center">
            <div className="formholder">
              <form className="form" onSubmit={handleRegister}>
                <p className="title">{lang === 'AR' ? 'إنشاء حساب جديد' : 'Register'}</p>
                
                {error && <div className="alert alert-error">{lang === 'AR' ? 'فشل إنشاء الحساب. يرجى التأكد من الحقول والمحاولة مجدداً.' : error}</div>}

                <div className="flex">
                  <label htmlFor="FirstName">
                    <input 
                      className="input" 
                      type="text" 
                      placeholder="" 
                      required 
                      id="FirstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <span>{lang === 'AR' ? 'الاسم الأول' : 'Firstname'}</span>
                  </label>

                  <label htmlFor="LastName">
                    <input 
                      className="input" 
                      type="text" 
                      placeholder="" 
                      required 
                      id="LastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <span>{lang === 'AR' ? 'الاسم الأخير' : 'Lastname'}</span>
                  </label>
                </div>

                <label htmlFor="email">
                  <input 
                    className="input" 
                    type="email" 
                    placeholder="" 
                    required 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span>{lang === 'AR' ? 'البريد الإلكتروني' : 'Email'}</span>
                </label>

                <label htmlFor="phoneNumber">
                  <input 
                    className="input" 
                    type="tel" 
                    placeholder="" 
                    required 
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <span>{lang === 'AR' ? 'رقم الهاتف' : 'Phone Number'}</span>
                </label>

                <label htmlFor="password">
                  <input 
                    className="input" 
                    type="password" 
                    placeholder="" 
                    required 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span>{lang === 'AR' ? 'كلمة المرور' : 'Password'}</span>
                </label>
                
                <label htmlFor="confirmPassword">
                  <input 
                    className="input" 
                    type="password" 
                    placeholder="" 
                    required 
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <span>{lang === 'AR' ? 'تأكيد كلمة المرور' : 'Confirm password'}</span>
                </label>
                
                <label htmlFor="age">
                  <input 
                    type="date" 
                    className="input" 
                    placeholder="" 
                    required 
                    id="age"
                    value={ageDate}
                    onChange={(e) => setAgeDate(e.target.value)}
                  />
                  <span></span>
                </label>

                <label htmlFor="nationality">
                  <input 
                    className="input" 
                    type="text"
                    list="country-list"
                    required 
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    autoComplete="off"
                  />
                  <datalist id="country-list">
                    <option value="Egyptian" />
                    {countries.map(country => (
                      <option key={country} value={country} />
                    ))}
                  </datalist>
                  <span>{lang === 'AR' ? 'الجنسية' : 'Nationality'}</span>
                </label>

                <button className="submit" type="submit" disabled={isLoading}>
                  {isLoading ? (lang === 'AR' ? 'جاري التسجيل...' : 'Registering...') : (lang === 'AR' ? 'سجل معنا' : 'Submit')}
                </button>
                
                <p className="signin">
                  {lang === 'AR' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '} 
                  <Link className="loginBtn btn btn-primary" to="/login">{lang === 'AR' ? 'تسجيل الدخول' : 'Log In'}</Link> 
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
