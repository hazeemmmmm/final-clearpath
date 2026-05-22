import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { createExperience, getTrips } from '../../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [recentPackages, setRecentPackages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'trip',
    destination: '',
    base_price: '',
    duration_days: '',
    capacity: '',
    description: ''
  });

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    fetchRecentPackages();
  }, []);

  const fetchRecentPackages = async () => {
    try {
      // Just fetching all experiences to show recent ones
      const data = await getTrips({ limit: 5, sort: '-createdAt' });
      // The apiCall wrapper returns the data directly
      setRecentPackages(data.data || []);
    } catch (err) {
      console.log('Failed to fetch recent packages', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Convert string numbers to actual numbers for backend validation
      const payload = {
        ...formData,
        base_price: Number(formData.base_price),
        duration_days: Number(formData.duration_days),
        capacity: Number(formData.capacity)
      };

      const res = await createExperience(payload);
      
      // apiCall already handles errors and parses JSON
      setSuccessMsg(`Successfully created: ${formData.name}`);
      
      // Reset form
      setFormData({
        name: '',
        type: 'trip',
        destination: '',
        base_price: '',
        duration_days: '',
        capacity: '',
        description: ''
      });

      // Refresh recent packages
      fetchRecentPackages();

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <Navbar />

      <aside className="admin-sidebar">
        <h2>ClearPath Admin</h2>
        <ul className="sidebar-menu">
          <li 
            className={activeTab === 'packages' ? 'active' : ''} 
            onClick={() => setActiveTab('packages')}
          >
            <i className="fa-solid fa-box-open"></i> Manage Packages
          </li>
          <li 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            <i className="fa-solid fa-users"></i> Users (Coming Soon)
          </li>
          <li 
            className={activeTab === 'bookings' ? 'active' : ''} 
            onClick={() => setActiveTab('bookings')}
          >
            <i className="fa-solid fa-calendar-check"></i> Bookings (Coming Soon)
          </li>
        </ul>
      </aside>

      <main className="admin-content">
        <div className="admin-header">
          <h1>{activeTab === 'packages' ? 'Manage Packages' : 'Dashboard'}</h1>
        </div>

        {activeTab === 'packages' && (
          <>
            {successMsg && (
              <div className="alert alert-success">
                <i className="fa-solid fa-circle-check"></i> {successMsg}
              </div>
            )}
            
            {errorMsg && (
              <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
              </div>
            )}

            <div className="admin-card">
              <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Add New Experience</h2>
              
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Package Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 5 Days Luxor & Aswan"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="trip">Trip (Multiple Days)</option>
                    <option value="dayuse">Dayuse (Single Day)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Destination (City / Location)</label>
                  <input 
                    type="text" 
                    name="destination" 
                    value={formData.destination} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Luxor"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Base Price (EGP / USD)</label>
                  <input 
                    type="number" 
                    name="base_price" 
                    value={formData.base_price} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 5000"
                    min="1"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Duration (Days)</label>
                  <input 
                    type="number" 
                    name="duration_days" 
                    value={formData.duration_days} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 5"
                    min="1"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Capacity (Max People)</label>
                  <input 
                    type="number" 
                    name="capacity" 
                    value={formData.capacity} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 20"
                    min="1"
                    required 
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Enter a captivating description of this experience..."
                    required
                  ></textarea>
                </div>

                <div className="form-group full-width">
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</>
                    ) : (
                      <><i className="fa-solid fa-plus"></i> Add Package</>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Packages Preview */}
            {recentPackages.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '15px' }}>Recently Added</h3>
                <div className="list-view">
                  {recentPackages.map(pkg => (
                    <div key={pkg._id} className="list-card">
                      <h4 style={{ color: '#003D59', marginBottom: '8px' }}>{pkg.name}</h4>
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
                        <i className="fa-solid fa-location-dot"></i> {pkg.destination?.name || 'Unknown'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', marginTop: '15px' }}>
                        <span>${pkg.base_price}</span>
                        <span style={{ color: '#e61e4d' }}>{pkg.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab !== 'packages' && (
          <div className="admin-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            <i className="fa-solid fa-person-digging" style={{ fontSize: '3rem', marginBottom: '15px', color: '#d4af37' }}></i>
            <h2>Under Construction</h2>
            <p>This section is currently being developed.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
