import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { LanguageContext } from '../../context/LanguageContext';
import './Home.css';

const Home = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash screen only on first visit during the session
    return !sessionStorage.getItem('clearpath_splash_shown');
  });
  const [showStayType, setShowStayType] = useState(false);
  const [showDestinations, setShowDestinations] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);
  const [selectedStayType, setSelectedStayType] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { lang, setLang } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure we start at the top of the page so it doesn't get stuck pushed up
    window.scrollTo(0, 0);

    let timer;
    if (showSplash) {
      // Lock body scroll only when splash is visible
      document.body.style.overflow = 'hidden';

      timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('clearpath_splash_shown', 'true');
        document.body.style.overflow = 'auto';
      }, 5000);
    } else {
      document.body.style.overflow = 'auto';
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      document.body.style.overflow = 'auto';
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showSplash]);

  return (
    <div className={`home-container ${lang === 'AR' ? 'lang-ar' : ''}`}>
      {showSplash && (
        <div className={`splash-screen ${!showSplash ? 'hidden' : ''}`}>
          <div className="splash-content">
            <h1 className="splash-title">
              {lang === 'AR' ? <>أهلاً بكم في <span className="splash-egypt-text">مصر</span> 👋</> : <>Welcome to <span className="splash-egypt-text">Egypt</span> 👋</>}
            </h1>
            <h2 className="splash-subtitle">
              {lang === 'AR' ? 'أين تحب أن تقيم؟' : 'Where will you stay?'}
            </h2>
          </div>
        </div>
      )}

      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />

      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            {lang === 'AR' ? <>اكتشف <span>مصر</span></> : <>DISCOVER <span>EGYPT</span></>}
          </h1>
          <p className="hero-subtitle">
            {lang === 'AR' ? 'حيث يبدأ التاريخ ولا تنتهي العجائب' : 'Where History Begins and Wonders Never End'}
          </p>
          <p className="hero-description">
            {lang === 'AR'
              ? 'اكتشف كنوز أرض عريقة، من الأهرامات الخالدة إلى جمال النيل والبحار الساحرة.'
              : 'Explore the treasures of an ancient land, from the timeless pyramids to the beauty of the Nile.'}
          </p>
          <div className="hero-buttons">
            <button className="hero-cta" onClick={() => setShowProtocol(true)}>
              {lang === 'AR' ? 'البروتوكول الخاص بنا' : 'OUR PROTOCOL'}
            </button>
            <button className="hero-cta" onClick={() => navigate('/experiences')}>
              {lang === 'AR' ? 'استكشف التجارب' : 'EXPLORE EXPERIENCES'}
            </button>
          </div>
        </div>
        
        <Footer isHome={true} />
      </header>

      {showProtocol && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ textAlign: lang === 'AR' ? 'right' : 'left', maxWidth: '550px', padding: '30px', borderRadius: '12px', background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)', margin: '5vh auto', maxHeight: '90vh', overflowY: 'auto' }}>
            <span className="close" style={{ left: lang === 'AR' ? '20px' : 'auto', right: lang === 'AR' ? 'auto' : '20px' }} onClick={() => setShowProtocol(false)}>&times;</span>
            <h2 style={{ color: '#CE1126', marginBottom: '20px', textAlign: 'center', fontSize: '26px' }}>
              <i className="fa-solid fa-shield-halved"></i> {lang === 'AR' ? 'البروتوكول الخاص بنا' : 'Our Protocol'}
            </h2>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#222', fontSize: '18px', marginBottom: '10px' }}>
                  <i className="fa-solid fa-car" style={{ color: '#CE1126', marginLeft: lang === 'AR' ? '8px' : '0', marginRight: lang === 'AR' ? '0' : '8px' }}></i> 
                  {lang === 'AR' ? 'الانتقالات' : 'Transportation'}
                </h3>
                <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.6' }}>
                  {lang === 'AR' 
                    ? 'من لحظة وصولك وحتى مغادرتك، نضمن لك تجربة سلسة. نوفر لك وسائل نقل مخصصة من المطار إلى وجهتك المطلوبة، ونعيدك مرة أخرى بعد انتهاء برنامجك.' 
                    : 'From the moment you arrive until your departure, we ensure a seamless experience. We provide dedicated transportation from the airport to your target destination, and back upon the completion of your program.'}
                </p>
            </div>
            
            <div style={{ padding: '15px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <h3 style={{ color: '#222', fontSize: '18px', marginBottom: '10px' }}>
                  <i className="fa-solid fa-hotel" style={{ color: '#CE1126', marginLeft: lang === 'AR' ? '8px' : '0', marginRight: lang === 'AR' ? '0' : '8px' }}></i> 
                  {lang === 'AR' ? 'الإقامة وتناول الطعام' : 'Accommodation & Dining'}
                </h3>
                <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.6' }}>
                  {lang === 'AR' 
                    ? 'عندما تختار برنامج رحلات أو يوم استجمام (Dayuse)، نوصي بفنادق مميزة تناسب باقتك تمامًا. ومع ذلك، هذا الخيار اختياري تمامًا، حيث يمكنك الإقامة في أي فندق أو مكان آخر تفضله. وفي حال اختيارك لإقامتنا الموصى بها، ستتضمن إقامتك 3 وجبات يوميًا تشمل إمكانية الدخول المجاني إلى بوفيه إفطار مفتوح فاخر يقدم حتى الساعة 1:00 ظهرًا، بالإضافة إلى وجبتي الغداء والعشاء.' 
                    : 'When you choose a Trip or Dayuse program, we recommend premium hotels perfectly tailored to your package. However, this is completely optional—you are free to choose any other hotel or location you prefer. If you opt for our recommended stay, it includes complimentary access to a lavish open-buffet breakfast served until 1:00 PM, alongside exceptional lunch and dinner experiences.'}
                </p>
            </div>
          </div>
        </div>
      )}

      {showStayType && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <span className="close" onClick={() => setShowStayType(false)}>&times;</span>
            <h2>Where will you stay?</h2>
            <p style={{ margin: '15px 0', color: '#555', fontSize: '14px' }}>Choose your preferred accommodation style</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button className="submit-btn" style={{ backgroundColor: '#CE1126', color: '#ffffff' }} onClick={() => { setSelectedStayType('Hotel'); setShowStayType(false); setShowDestinations(true); }}>Hotel</button>
              <button className="submit-btn" style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ccc' }} onClick={() => { setSelectedStayType('Apartments'); setShowStayType(false); setShowDestinations(true); }}>Apartments</button>
              <button className="submit-btn" style={{ backgroundColor: '#000000', color: '#ffffff' }} onClick={() => { setSelectedStayType('Pension'); setShowStayType(false); setShowDestinations(true); }}>Pension</button>
            </div>
          </div>
        </div>
      )}

      {showDestinations && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <span className="close" onClick={() => setShowDestinations(false)}>&times;</span>
            <h2>Select Destination</h2>
            <p style={{ margin: '15px 0', color: '#555', fontSize: '14px' }}>Showing {selectedStayType} for: Where would you like to go?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              {['cairo', 'giza', 'alex', 'matrouh', 'dahab', 'northcoast'].map((dest) => (
                <button key={dest} className="submit-btn" style={{ background: 'linear-gradient(135deg, #ffcf54 0%, #ff8f00 100%)', color: '#222', fontWeight: 'bold' }} onClick={() => navigate(`/destinations#${dest}`)}>
                  {dest.charAt(0).toUpperCase() + dest.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
