import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getDestinations } from '../../utils/api';
import { LanguageContext } from '../../context/LanguageContext';
import './Destinations.css';

const Destinations = () => {
  const { lang } = useContext(LanguageContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const hash = location.hash.replace('#', '');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await getDestinations();
        setDestinations(response.destinations || []);
      } catch (err) {
        setError('Failed to load destinations.');
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const filtered = hash
    ? destinations.filter((d) => d.name?.toLowerCase().includes(hash.toLowerCase()))
    : destinations;

  return (
    <div className={`destinations-container ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} isScrolled={isScrolled} />
      <div className="page-header hero-banner" style={{ marginTop: '60px' }}>
        <div className="header-content">
          <h1>{lang === 'AR' ? <>الوجهة السياحية: <span className="egypt-flag-text" style={{ textTransform: 'capitalize' }}>{hash || 'مصر'}</span></> : <>Destination: <span className="egypt-flag-text" style={{ textTransform: 'capitalize' }}>{hash || 'Egypt'}</span></>}</h1>
          <p>{lang === 'AR' ? `اكتشف أفضل الأماكن السياحية في ${hash || 'مصر'}.` : `Explore the best places in ${hash || 'Egypt'}.`}</p>
        </div>
      </div>
      <main className="content" style={{ minHeight: '50vh', padding: '20px' }}>
        {loading ? (
          <p>{lang === 'AR' ? 'جاري تحميل الوجهات السياحية...' : 'Loading destinations...'}</p>
        ) : error ? (
          <p className="error">{lang === 'AR' ? 'فشل تحميل الوجهات السياحية.' : error}</p>
        ) : (
          <div className="packages-grid">
            {filtered.length > 0 ? filtered.map((dest) => (
              <div key={dest._id || dest.id} className="card card--link" onClick={() => navigate(`/trips?destination=${dest._id || dest.id}`)}>
                <div className="img-box">
                  <img src={dest.image || '/img/default-dest.jpg'} alt={dest.name} />
                </div>
                <div className="info">
                  <h4>{dest.name}</h4>
                  <p>{dest.description}</p>
                </div>
              </div>
            )) : (
              <p>{lang === 'AR' ? 'لم يتم العثور على أي وجهات.' : 'No destinations found.'}</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
