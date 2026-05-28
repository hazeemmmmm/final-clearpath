import React, { useState, useEffect } from 'react';
import {
  getAllPackingGuides,
  createPackingGuide,
  deletePackingGuide,
  getDestinations,
  getTrips
} from '../../utils/api';

const PackingGuidesAdmin = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState([]);
  const [experiences, setExperiences] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    activityType: 'general',
    experience: '',
    destination: '',
    difficultyLevel: 'moderate',
    physicalRequirements: '',
    essentials: '',
    clothing: '',
    safetyTips: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gRes, dRes, eRes] = await Promise.all([
        getAllPackingGuides(),
        getDestinations(),
        getTrips()
      ]);
      
      if (gRes.success) setGuides(gRes.data);
      if (dRes.destinations) setDestinations(dRes.destinations);
      if (eRes.data) setExperiences(eRes.data);
      
    } catch (err) {
      console.error(err);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Parse multi-line strings into arrays of objects
      const parsedEssentials = formData.essentials.split('\n').filter(s => s.trim()).map(item => ({ item: item.trim(), required: true }));
      const parsedClothing = formData.clothing.split('\n').filter(s => s.trim()).map(item => ({ item: item.trim() }));
      const parsedSafety = formData.safetyTips.split('\n').filter(s => s.trim()).map(tip => ({ tip: tip.trim(), severity: 'warning' }));
      
      const payload = {
        name: formData.name,
        activityType: formData.activityType,
        experience: formData.experience || null,
        destination: formData.destination || null,
        difficultyLevel: formData.difficultyLevel,
        physicalRequirements: formData.physicalRequirements,
        essentials: parsedEssentials,
        clothing: parsedClothing,
        safetyTips: parsedSafety
      };
      
      await createPackingGuide(payload);
      setShowModal(false);
      setFormData({ name: '', activityType: 'general', experience: '', destination: '', difficultyLevel: 'moderate', physicalRequirements: '', essentials: '', clothing: '', safetyTips: '' });
      fetchData();
    } catch (err) {
      alert('Error creating guide');
    } finally {
      setSubmitting(false);
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
        <button className="btn-primary" onClick={() => setShowModal(true)}>
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

      {showModal && (
        <div className="aura-modal-overlay">
          <div className="aura-modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Create Packing Guide</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <form onSubmit={handleCreate} className="modal-body aura-form">
              <div className="form-group-aura">
                <label>Guide Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sinai Hiking Guide" />
              </div>
              <div className="form-group-aura">
                <label>Activity Type (Fallback Template)</label>
                <select value={formData.activityType} onChange={e => setFormData({...formData, activityType: e.target.value})}>
                  <option value="general">General</option>
                  <option value="hiking">Hiking</option>
                  <option value="diving">Diving & Snorkeling</option>
                  <option value="desert">Desert Safari</option>
                  <option value="beach">Beach & Resort</option>
                  <option value="cultural">Cultural</option>
                  <option value="adventure">Adventure</option>
                  <option value="wellness">Wellness</option>
                </select>
              </div>
              
              <div className="form-grid-2">
                <div className="form-group-aura">
                  <label>Specific Experience (Optional)</label>
                  <select value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}>
                    <option value="">-- Apply to All --</option>
                    {experiences.map(exp => <option key={exp._id} value={exp._id}>{exp.name}</option>)}
                  </select>
                </div>
                <div className="form-group-aura">
                  <label>Specific Destination (Optional)</label>
                  <select value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})}>
                    <option value="">-- Apply to All --</option>
                    {destinations.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group-aura">
                <label>Difficulty Level</label>
                <select value={formData.difficultyLevel} onChange={e => setFormData({...formData, difficultyLevel: e.target.value})}>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="form-group-aura">
                <label>Physical Requirements</label>
                <input type="text" value={formData.physicalRequirements} onChange={e => setFormData({...formData, physicalRequirements: e.target.value})} placeholder="e.g. Must be able to walk 5km" />
              </div>

              <div className="form-group-aura">
                <label>Essentials (One item per line)</label>
                <textarea rows="3" value={formData.essentials} onChange={e => setFormData({...formData, essentials: e.target.value})} placeholder="Water bottle&#10;Sunscreen&#10;Hat"></textarea>
              </div>

              <div className="form-group-aura">
                <label>Clothing (One item per line)</label>
                <textarea rows="3" value={formData.clothing} onChange={e => setFormData({...formData, clothing: e.target.value})} placeholder="Comfortable shoes&#10;Light jacket"></textarea>
              </div>

              <div className="form-group-aura">
                <label>Safety Tips (One tip per line)</label>
                <textarea rows="3" value={formData.safetyTips} onChange={e => setFormData({...formData, safetyTips: e.target.value})} placeholder="Stay hydrated&#10;Follow your guide"></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create Guide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackingGuidesAdmin;
