import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getDestinations } from '../../utils/api';
import './Destinations.css';

const Destinations = () => {
  const [lang, setLang] = useState('EN');
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
    <div className="destinations-container">
      <Navbar lang={lang} setLang={setLang} isScrolled={isScrolled} />
      <div className="page-header hero-banner" style={{ marginTop: '60px' }}>
        <div className="header-content">
          <h1>Destination: <span className="egypt-flag-text" style={{ textTransform: 'capitalize' }}>{hash || 'Egypt'}</span></h1>
          <p>Explore the best places in {hash || 'Egypt'}.</p>
        </div>
      </div>
      <main className="content" style={{ minHeight: '50vh', padding: '20px' }}>
        {loading ? (
          <p>Loading destinations...</p>
        ) : error ? (
          <p className="error">{error}</p>
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
              <p>No destinations found.</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
