import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivities, deleteActivity } from '../../utils/api';

const ActivitiesAdmin = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getActivities({ limit: 100 });
      const list = res.activities || res.data?.activities || res.data || res || [];
      setActivities(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete activity "${name}"?`)) return;
    try {
      await deleteActivity(id);
      setActivities(prev => prev.filter(a => a._id !== id));
      setSuccessMsg(`Activity "${name}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete activity.');
    }
  };

  const filtered = activities.filter(act =>
    !searchQ.trim() || 
    act.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    act.type?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const getActivityImage = (actName = '') => {
    const name = actName.toLowerCase();
    
    // Giza Pyramids & Sphinx Explorer Activities
    if (name.includes('great pyramid of giza')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kheops-Pyramid.jpg';
    }
    if (name.includes('panorama view')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg';
    }
    if (name.includes('sphinx') || name.includes('sphinx & valley')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Great_Sphinx_of_Giza_-_20080716a.jpg';
    }
    if (name.includes('gem exhibition') || name.includes('exhibition galleries') || name.includes('grand egyptian museum')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/4/43/Grand_Egyptian_Museum_2023.jpg';
    }
    if (name.includes('hanging obelisk') || name.includes('grand hall')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/4/43/Grand_Egyptian_Museum_2023.jpg';
    }
    if (name.includes('al-muizz') || name.includes('muizz')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Al-Muizz_Street_Cairo.jpg';
    }
    if (name.includes('khan el khalili') || name.includes('bazaar')) {
      return 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Cairo_Khan_el-Khalili_market.jpg';
    }

    if (name.includes('snorkel') || name.includes('beach') || name.includes('sea') || name.includes('boat') || name.includes('water') || name.includes('island')) {
      return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80';
    }
    if (name.includes('pyramid') || name.includes('temple') || name.includes('luxor') || name.includes('cairo') || name.includes('history') || name.includes('museum') || name.includes('mummy')) {
      return 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=300&q=80';
    }
    if (name.includes('quad') || name.includes('safari') || name.includes('desert') || name.includes('sand') || name.includes('folklore')) {
      return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=300&q=80';
    }
    if (name.includes('lunch') || name.includes('dinner') || name.includes('feast') || name.includes('food') || name.includes('bbq') || name.includes('tea') || name.includes('culinary')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80';
    }
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80';
  };

  return (
    <div className="tab-pane animate-fade-in">
      {/* ── Section Header ── */}
      <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Manage Activities</h2>
          <p className="pane-subtitle">
            Add, view, and manage activities available on the platform.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/admin/activities/new')}
          id="new-activity-btn"
        >
          <i className="fa-solid fa-plus"></i> New Activity
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
      {activities.length > 0 && (
        <div className="relative mb-6" style={{ maxWidth: '320px' }}>
          <i
            className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: '#64748b' }}
          ></i>
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search activities by name or type..."
            className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
      )}

      {/* ── Activities Grid ── */}
      <div className="admin-card">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <i className="fa-solid fa-spinner fa-spin text-3xl" style={{ color: '#73749B' }}></i>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading activities…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-placeholder">
            <i className="fa-solid fa-person-running" style={{ fontSize: '3.5rem', opacity: 0.18, marginBottom: '15px' }}></i>
            <h3>{searchQ ? 'No results found' : 'No Activities Yet'}</h3>
            <p>
              {searchQ
                ? `No activity matches "${searchQ}".`
                : 'Click "+ New Activity" to add your first one.'}
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
            {filtered.map(act => (
              <ActivityCard 
                key={act._id} 
                act={act} 
                onDelete={handleDelete} 
                onEdit={(id) => navigate(`/admin/activities/${id}/edit`)}
                getActivityImage={getActivityImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityCard = ({ act, onDelete, onEdit, getActivityImage }) => {
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
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      {/* Card Image */}
      <div style={{ height: '165px', overflow: 'hidden', position: 'relative', background: '#1b1b27' }}>
        <img
          src={act.image || getActivityImage(act.name)}
          alt={act.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80';
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        {/* Availability badge */}
        <span
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: act.isAvailable !== false ? 'rgba(16,185,129,0.85)' : 'rgba(239,68,68,0.85)',
            backdropFilter: 'blur(6px)',
            color: '#fff', fontSize: '0.72rem', fontWeight: 600,
            padding: '3px 10px', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {act.isAvailable !== false ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Card Body */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ 
          fontSize: '0.72rem', fontWeight: 'bold', textTransform: 'uppercase', 
          letterSpacing: '1px', color: '#d4af37', display: 'inline-block', marginBottom: '6px'
        }}>
          {act.type?.replace('_', ' ').toUpperCase()}
        </span>

        <h4 style={{ color: '#fff', margin: '0 0 8px', fontSize: '1.05rem', fontWeight: 700 }}>
          {act.name}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-map-location-dot" style={{ width: '14px', color: '#73749B' }}></i>
            <span>Destination: {act.destination?.name || 'Local Platform'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-handshake" style={{ width: '14px', color: '#73749B' }}></i>
            <span>Provider: {act.provider?.name || 'Platform Admin'}</span>
          </div>
          {act.duration && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-regular fa-clock" style={{ width: '14px', color: '#73749B' }}></i>
              <span>Duration: {act.duration} Hrs</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>EGP {act.price}</strong>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onEdit(act._id)}
              style={{
                background: 'rgba(212,175,55,0.08)', color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.25)',
                padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; }}
            >
              <i className="fa-regular fa-pen-to-square"></i> Edit
            </button>
            <button
              onClick={() => onDelete(act._id, act.name)}
              style={{
                background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                border: '1px solid rgba(239,68,68,0.25)',
                padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
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
    </div>
  );
};

export default ActivitiesAdmin;
