import React, { useState, useEffect } from 'react';
import { getProviders, createProvider, deleteProvider } from '../../utils/api';

const ProvidersAdmin = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'guide', phoneNumber: '', email: '', description: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProviders({ limit: 200 });
      const list = res.data || res.providers || res || [];
      setProviders(Array.isArray(list) ? list : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      await createProvider(formData);
      setSuccessMsg('Provider created successfully!');
      setShowModal(false);
      setFormData({ name: '', type: 'guide', phoneNumber: '', email: '', description: '' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create provider.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this provider?')) return;
    try {
      await deleteProvider(id);
      setProviders(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete provider.');
    }
  };

  const typeColors = {
    guide: '#10b981',
    hotel: '#3b82f6',
    transport: '#f59e0b',
    activity: '#8b5cf6',
    restaurant: '#ef4444',
  };

  if (loading) return <div style={{ padding: '20px', color: '#fff' }}>Loading Providers...</div>;

  return (
    <div className="tab-pane animate-fade-in">
      <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Manage Providers</h2>
          <p className="pane-subtitle">All guides, hotels, transport companies, and activity providers.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <i className="fa-solid fa-plus"></i> New Provider
        </button>
      </div>

      {successMsg && <div className="aura-alert alert-success animate-fade-in"><i className="fa-solid fa-circle-check"></i> {successMsg}</div>}
      {errorMsg && <div className="aura-alert alert-danger animate-fade-in"><i className="fa-solid fa-circle-exclamation"></i> {errorMsg}</div>}

      <div className="admin-card">
        {providers.length === 0 ? (
          <div className="empty-placeholder">
            <i className="fa-solid fa-handshake" style={{ fontSize: '3.5rem', opacity: '0.2', marginBottom: '15px' }}></i>
            <h3>No Providers Found</h3>
            <p>Add your first service provider to assign them to activities.</p>
          </div>
        ) : (
          <div className="table-responsive-aura">
            <table className="aura-table">
              <thead>
                <tr>
                  <th>Provider Name</th>
                  <th>Type</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {providers.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>
                      <span style={{
                        background: `${typeColors[p.type] || '#64748b'}20`,
                        color: typeColors[p.type] || '#64748b',
                        padding: '2px 10px', borderRadius: '50px', fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase'
                      }}>{p.type || 'General'}</span>
                    </td>
                    <td>{p.phoneNumber || '—'}</td>
                    <td>{p.email || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button className="btn-row-action text-danger" onClick={() => handleDelete(p._id)} title="Delete Provider">
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

      {showModal && (
        <div className="aura-modal-overlay">
          <div className="aura-modal" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add New Provider</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body aura-form">
              <div className="form-group-aura">
                <label>Provider Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Cairo Elite Tours" />
              </div>
              <div className="form-group-aura">
                <label>Provider Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="guide">Tour Guide</option>
                  <option value="hotel">Hotel</option>
                  <option value="transport">Transport</option>
                  <option value="activity">Activity Provider</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group-aura">
                  <label>Phone</label>
                  <input type="text" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="+20 100 000 0000" />
                </div>
                <div className="form-group-aura">
                  <label>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="provider@example.com" />
                </div>
              </div>
              <div className="form-group-aura">
                <label>Description</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Short description of this provider..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProvidersAdmin;
