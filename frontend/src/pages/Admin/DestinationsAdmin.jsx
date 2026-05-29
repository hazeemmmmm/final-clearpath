import React, { useState, useEffect } from 'react';
import { getDestinations, createDestination, deleteDestination } from '../../utils/api';

const DestinationsAdmin = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', image: '', country: 'Egypt' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDestinations();
      const list = res.destinations || res.data?.destinations || res.data || res || [];
      setDestinations(Array.isArray(list) ? list : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await createDestination(formData);
      setSuccessMsg('Destination created successfully!');
      setShowModal(false);
      setFormData({ name: '', description: '', image: '', country: 'Egypt' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create destination.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this destination? This may affect experiences linked to it.')) return;
    try {
      await deleteDestination(id);
      setDestinations(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete destination.');
    }
  };

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Loading Destinations...</div>;

  return (
    <div className="tab-pane animate-fade-in">
      <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Manage Destinations</h2>
          <p className="pane-subtitle">Add, view, and manage travel destinations available on the platform.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-plus"></i> New Destination
        </button>
      </div>

      {successMsg && <div className="aura-alert alert-success animate-fade-in"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}
      {errorMsg && <div className="aura-alert alert-danger animate-fade-in"><i className="fa-solid fa-circle-exclamation"></i> {errorMsg}</div>}

      <div className="admin-card">
        {destinations.length === 0 ? (
          <div className="empty-placeholder">
            <i className="fa-solid fa-map" style={{ fontSize: '3.5rem', opacity: '0.2', marginBottom: '15px' }}></i>
            <h3>No Destinations Found</h3>
            <p>Add your first destination to start building trips.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {destinations.map(d => (
              <div key={d._id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
                {d.image && (
                  <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img src={d.image} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '18px' }}>
                  <h4 style={{ color: '#fff', margin: '0 0 5px 0', fontSize: '1.1rem' }}>{d.name}</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 15px 0' }}>{d.country || 'Egypt'}</p>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 15px 0', lineHeight: '1.5' }}>{d.description?.substring(0, 80)}...</p>
                  <button
                    onClick={() => handleDelete(d._id)}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="fa-solid fa-trash-can"></i> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="aura-modal-overlay">
          <div className="aura-modal" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h2>Create New Destination</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body aura-form">
              <div className="form-group-aura">
                <label>Destination Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Sharm El-Sheikh" />
              </div>
              <div className="form-group-aura">
                <label>Country</label>
                <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="e.g. Egypt" />
              </div>
              <div className="form-group-aura">
                <label>Cover Image URL</label>
                <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group-aura">
                <label>Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of this destination..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationsAdmin;
