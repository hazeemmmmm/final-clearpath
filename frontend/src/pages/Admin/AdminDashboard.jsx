import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { createExperience, getTrips, getAllReviews, deleteReview } from '../../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [recentPackages, setRecentPackages] = useState([]);

  // Admin Reviews State
  const [allReviews, setAllReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchAdminReviews();
    }
  }, [activeTab]);

  const fetchRecentPackages = async () => {
    try {
      // Just fetching all experiences to show recent ones
      const data = await getTrips({ limit: 5, sort: '-createdAt' });
      // The apiCall wrapper returns the data directly
      setRecentPackages(data.data || data || []);
    } catch (err) {
      console.log('Failed to fetch recent packages', err);
    }
  };

  const fetchAdminReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await getAllReviews();
      const loadedReviews = res.reviews || res.data?.reviews || res.data || res || [];
      setAllReviews(loadedReviews);
    } catch (err) {
      console.log('Failed to fetch admin reviews', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleAdminDeleteReview = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review? (Admin Action)')) {
      try {
        await deleteReview(reviewId);
        setAllReviews(prev => prev.filter(r => r._id !== reviewId));
      } catch (err) {
        alert(err.message || 'Failed to delete review');
      }
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`${i <= rating ? 'fa-solid' : 'fa-regular'} fa-star`}
          style={{ color: i <= rating ? '#FFD700' : '#ddd', marginRight: '2px', fontSize: '0.85rem' }}
        />
      );
    }
    return <div style={{ display: 'inline-block' }}>{stars}</div>;
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
            className={activeTab === 'reviews' ? 'active' : ''} 
            onClick={() => setActiveTab('reviews')}
          >
            <i className="fa-solid fa-star"></i> Manage Reviews
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
          <h1>
            {activeTab === 'packages' && 'Manage Packages'}
            {activeTab === 'reviews' && 'Manage Reviews'}
            {activeTab === 'users' && 'Manage Users'}
            {activeTab === 'bookings' && 'Manage Bookings'}
          </h1>
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

        {/* Admin Manage Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="admin-card">
            <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>User Reviews & Ratings</h2>
            <p style={{ color: '#666', marginBottom: '25px', fontSize: '0.95rem' }}>
              Monitor customer feedback and manage user reviews across all published experiences.
            </p>

            {loadingReviews ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#666' }}>
                <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ marginBottom: '15px', color: '#003D59' }}></i>
                <p>Retrieving reviews database...</p>
              </div>
            ) : allReviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                <i className="fa-regular fa-comments" style={{ fontSize: '3rem', marginBottom: '15px', color: '#ccc' }}></i>
                <h3>No reviews found</h3>
                <p>No user has rated any experiences in the system yet.</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Experience</th>
                      <th>Rating</th>
                      <th>Comment</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allReviews.map((rev) => {
                      const reviewerName = rev.user ? `${rev.user.firstName} ${rev.user.lastName}`.trim() : 'Anonymous';
                      const reviewerEmail = rev.user?.email || 'N/A';
                      const experienceName = rev.experience?.name || 'Unknown Experience';
                      const reviewDate = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      }) : 'Recent';

                      return (
                        <tr key={rev._id}>
                          <td>
                            <div style={{ fontWeight: '600', color: '#003D59' }}>{reviewerName}</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{reviewerEmail}</div>
                          </td>
                          <td>
                            <span style={{ fontWeight: '500' }}>{experienceName}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#333' }}>
                                {rev.rating} / 5
                              </span>
                              {renderStars(rev.rating)}
                            </div>
                          </td>
                          <td>
                            <div className="admin-comment-box">
                              {rev.comment ? rev.comment : <em style={{ color: '#aaa' }}>No text feedback</em>}
                              {rev.isVerifiedBooking && (
                                <span className="admin-verified-tag">
                                  <i className="fa-solid fa-check-double"></i> Verified Booking
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.9rem', color: '#555' }}>{reviewDate}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              className="btn-delete-row-admin"
                              onClick={() => handleAdminDeleteReview(rev._id)}
                              title="Delete Review"
                            >
                              <i className="fa-solid fa-trash-can"></i> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'bookings') && (
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
