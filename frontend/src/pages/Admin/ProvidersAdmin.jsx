import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviders, deleteProvider } from '../../utils/api';

const ProvidersAdmin = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this provider?')) return;
    try {
      await deleteProvider(id);
      setProviders(prev => prev.filter(p => p._id !== id));
      setSuccessMsg('Provider deleted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
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
        <button className="btn-primary" onClick={() => navigate('/admin/providers/new')}>
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
    </div>
  );
};

export default ProvidersAdmin;
