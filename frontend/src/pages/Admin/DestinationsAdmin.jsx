import React, { useState, useEffect } from 'react';
import { toast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';
import { getDestinations, deleteDestination } from '../../utils/api';

const DestinationsAdmin = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [successMsg, setSuccessMsg]     = useState('');
  const [searchQ, setSearchQ]           = useState('');
  const navigate = useNavigate();

  // Fetch destinations list
  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await getDestinations();
      const list = res.destinations || res.data?.destinations || res.data || res || [];
      setDestinations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This may affect linked experiences.`)) return;
    try {
      await deleteDestination(id);
      setDestinations(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      toast(err.message || 'Failed to delete destination.');
    }
  };

  // Client-side search filter
  const filtered = destinations.filter(d =>
    !searchQ.trim() || d.name?.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="tab-pane animate-fade-in">

      {/* ── Section Header ── */}
      <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Manage Destinations</h2>
          <p className="pane-subtitle">
            Add, view, and manage travel destinations available on the platform.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/admin/destinations/new')}
          id="new-destination-btn"
        >
          <i className="fa-solid fa-plus"></i> New Destination
        </button>
      </div>

      {/* ── Success Toast ── */}
      {successMsg && (
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-xl mb-5 text-sm font-medium animate-fade-in"
          style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#6ee7b7',
          }}
        >
          <i className="fa-solid fa-circle-check text-emerald-400"></i>
          {successMsg}
        </div>
      )}

      {/* ── Search Bar ── */}
      {destinations.length > 0 && (
        <div className="relative mb-6" style={{ maxWidth: '320px' }}>
          <i
            className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: '#64748b' }}
          ></i>
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search destinations..."
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
      )}

      {/* ── Destinations Grid ── */}
      <div className="admin-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <i className="fa-solid fa-spinner fa-spin text-3xl" style={{ color: '#73749B' }}></i>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading destinations…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-placeholder">
            <i className="fa-solid fa-map" style={{ fontSize: '3.5rem', opacity: 0.18, marginBottom: '15px' }}></i>
            <h3>{searchQ ? 'No results found' : 'No Destinations Yet'}</h3>
            <p>
              {searchQ
                ? `No destination matches "${searchQ}".`
                : 'Click "+ New Destination" to add your first one.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {filtered.map(d => (
              <DestinationCard key={d._id} dest={d} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DestinationCard — individual card in the grid
// ─────────────────────────────────────────────────────────────────────────────
const DestinationCard = ({ dest, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(115,116,155,0.35)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* Card Image */}
      <div style={{ height: '165px', overflow: 'hidden', position: 'relative', background: '#1b1b27' }}>
        {dest.image ? (
          <img
            src={dest.image}
            alt={dest.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <i className="fa-solid fa-image text-4xl" style={{ color: '#334155' }}></i>
          </div>
        )}
        {/* Country badge */}
        <span
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
            color: '#e2e8f0', fontSize: '0.72rem', fontWeight: 600,
            padding: '3px 10px', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <i className="fa-solid fa-flag" style={{ marginRight: '5px', color: '#73749B' }}></i>
          {dest.country || 'Egypt'}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: '18px' }}>
        <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 700 }}>
          {dest.name}
        </h4>

        {dest.description && (
          <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 16px', lineHeight: '1.55' }}>
            {dest.description.length > 90 ? dest.description.slice(0, 90) + '…' : dest.description}
          </p>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#334155' }}>
            <i className="fa-solid fa-calendar-alt" style={{ marginRight: '5px' }}></i>
            {new Date(dest.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={() => onDelete(dest._id, dest.name)}
            style={{
              background: 'rgba(239,68,68,0.08)', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.25)',
              padding: '5px 14px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            <i className="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationsAdmin;
