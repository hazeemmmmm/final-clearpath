import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getTripDetails, getDayuseDetails } from '../../utils/api';
import './PackageDetails.css';

const PackageDetails = () => {
  const { id } = useParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Attempt to fetch from trips, if fails try dayuse (or backend should handle unified fetch)
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await getTripDetails(id);
        setPackageData(response.data || response.experience || response);
      } catch (err) {
        setError('Failed to load package details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPackage();
  }, [id]);

  return (
    <div className="package-details-container">
      <Navbar />
      <main className="content" style={{ marginTop: '100px', minHeight: '60vh', padding: '20px' }}>
        {loading ? <p>Loading package details...</p> : error ? <p className="error">{error}</p> : packageData ? (
          <div className="package-info">
            <h1>{packageData.title}</h1>
            <img src={packageData.image || '/img/default.jpg'} alt={packageData.title} style={{ maxWidth: '400px' }}/>
            <p>{packageData.description || 'Amazing package details here.'}</p>
            <p><strong>Price:</strong> {packageData.price} EGP</p>
            <button className="submit-btn" style={{ background: '#CE1126', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Book Now</button>
          </div>
        ) : <p>Package not found.</p>}
      </main>
      <Footer />
    </div>
  );
};

export default PackageDetails;
