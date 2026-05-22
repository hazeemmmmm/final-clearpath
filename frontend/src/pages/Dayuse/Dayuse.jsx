import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getDayuse } from '../../utils/api';
import './Dayuse.css';

const Dayuse = () => {
  const [lang, setLang] = useState('EN');
  const [isScrolled, setIsScrolled] = useState(false);
  const [dayuses, setDayuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchDayuse = async () => {
      try {
        const response = await getDayuse();
        setDayuses(response.data);
      } catch (err) {
        console.error('Error fetching dayuse:', err);
        setError('Failed to load dayuse packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDayuse();
  }, []);

  return (
    <div className={`dayuse-container ${lang === 'AR' ? 'lang-ar' : ''}`}>
      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />

      <div className="page-header hero-banner dayuse-hero">
        <div className="header-content">
            <h1>Egyptian <span className="egypt-flag-text">Dayuse</span></h1>
            <p>Relaxing pools, beautiful beaches, and luxurious escapes</p>
        </div>
      </div>

      <main className="content">
        <div className="toolbar">
            <div className="filter-group">
                <button type="button" className="btn-outline active">All Dayuse</button>
                <button type="button" className="btn-outline">Pool Access</button>
                <button type="button" className="btn-outline">Beach</button>
            </div>
        </div>

        <div className="packages-grid">
            {loading ? (
              <p>Loading Dayuse Packages from the API...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : dayuses.length > 0 ? (
              dayuses.map((dayuse) => (
                <div key={dayuse.id || dayuse._id} className="card card--link" onClick={() => navigate(`/package-details/${dayuse.id || dayuse._id}`)}>
                    <div className="img-box">
                        <img src={dayuse.image || '/img/dayuse-default.jpg'} alt={dayuse.title} />
                    </div>
                    <div className="info">
                        <h4>{dayuse.title}</h4>
                        <p>{dayuse.price} EGP / day</p>
                    </div>
                </div>
              ))
            ) : (
              <p>No dayuse packages available at the moment.</p>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dayuse;
