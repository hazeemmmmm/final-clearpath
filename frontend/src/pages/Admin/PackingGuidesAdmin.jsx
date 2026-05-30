import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllPackingGuides,
  deletePackingGuide,
} from '../../utils/api';

const PackingGuidesAdmin = () => {
  const [guides, setGuides] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch only the guides list — dropdowns are handled inside CreateGuide.jsx
  const fetchData = async () => {
    setLoading(true);
    try {
      const gRes = await getAllPackingGuides();
      if (gRes.success) setGuides(gRes.data);
    } catch (err) {
      console.error('Failed to load packing guides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this packing guide?')) return;
    try {
      await deletePackingGuide(id);
      fetchData();
    } catch (err) {
      alert('Error deleting guide');
    }
  };

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Loading Packing Guides...</div>;

  return (
    <div className="tab-pane animate-fade-in">
      <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Packing Guides & Safety</h2>
          <p className="pane-subtitle">Manage packing requirements and safety protocols for trips and activities.</p>
        </div>
        {/* Navigate to the dedicated full-page creation form */}
        <button className="btn-primary" onClick={() => navigate('/admin/guides/new')}>
          <i className="fa-solid fa-plus"></i> New Guide
        </button>
      </div>

      <div className="admin-card">
        {guides.length === 0 ? (
          <div className="empty-placeholder">
            <i className="fa-solid fa-backpack" style={{ fontSize: '3.5rem', opacity: '0.2', marginBottom: '15px' }}></i>
            <h3>No Packing Guides Found</h3>
            <p>Create generic or specific packing guides to display on package details.</p>
          </div>
        ) : (
          <div className="table-responsive-aura">
            <table className="aura-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Activity Type</th>
                  <th>Target Experience</th>
                  <th>Target Destination</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {guides.map(g => (
                  <tr key={g._id}>
                    <td><strong>{g.name}</strong></td>
                    <td><span style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'uppercase' }}>{g.activityType}</span></td>
                    <td>{g.experience?.name || <em style={{color: '#666'}}>All</em>}</td>
                    <td>{g.destination?.name || <em style={{color: '#666'}}>All</em>}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-row-action text-danger" onClick={() => handleDelete(g._id)} title="Delete Guide">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default PackingGuidesAdmin;
