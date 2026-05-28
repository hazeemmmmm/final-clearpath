import React, { useState, useEffect } from 'react';
import { updateExperience, duplicateExperience } from '../../utils/api';

const EditPackageModal = ({ experience, onClose, onUpdate, activitiesList, providersList, destinationsList, supervisorsList }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Trip',
    description: '',
    base_price: '',
    duration_days: '',
    capacity: '',
    destination: '',
    supervisor: '',
    image: '',
    images: [],
    addons: [],
    itinerary: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (experience) {
      setFormData({
        name: experience.name || '',
        type: experience.type || 'Trip',
        description: experience.description || '',
        base_price: experience.base_price || '',
        duration_days: experience.duration_days || '',
        capacity: experience.capacity || '',
        destination: experience.destination?._id || experience.destination || '',
        supervisor: experience.supervisor?._id || experience.supervisor || '',
        image: experience.image || '',
        images: experience.images || [],
        addons: experience.addons || [],
        itinerary: experience.itinerary || []
      });
    }
  }, [experience]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDay = () => {
    const newDayNum = formData.itinerary.length + 1;
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, { day_number: newDayNum, title: `Day ${newDayNum}`, description: '', activities: [] }]
    }));
  };

  const handleRemoveDay = (dayIndex) => {
    setFormData(prev => {
      const newItin = [...prev.itinerary];
      newItin.splice(dayIndex, 1);
      // Re-number days
      newItin.forEach((d, idx) => d.day_number = idx + 1);
      return { ...prev, itinerary: newItin };
    });
  };

  const handleDayChange = (dayIndex, field, value) => {
    setFormData(prev => {
      const newItin = [...prev.itinerary];
      newItin[dayIndex] = { ...newItin[dayIndex], [field]: value };
      return { ...prev, itinerary: newItin };
    });
  };

  const handleAddActivity = (dayIndex) => {
    setFormData(prev => {
      const newItin = [...prev.itinerary];
      newItin[dayIndex].activities.push({ activity: '', provider: '', price: 0 });
      return { ...prev, itinerary: newItin };
    });
  };

  const handleRemoveActivity = (dayIndex, actIndex) => {
    setFormData(prev => {
      const newItin = [...prev.itinerary];
      newItin[dayIndex].activities.splice(actIndex, 1);
      return { ...prev, itinerary: newItin };
    });
  };

  const handleActivityChange = (dayIndex, actIndex, field, value) => {
    setFormData(prev => {
      const newItin = [...prev.itinerary];
      newItin[dayIndex].activities[actIndex] = { ...newItin[dayIndex].activities[actIndex], [field]: value };
      return { ...prev, itinerary: newItin };
    });
  };

  const moveDay = (index, dir) => {
    if (dir === -1 && index === 0) return;
    if (dir === 1 && index === formData.itinerary.length - 1) return;
    setFormData(prev => {
      const newItin = [...prev.itinerary];
      const temp = newItin[index];
      newItin[index] = newItin[index + dir];
      newItin[index + dir] = temp;
      newItin.forEach((d, idx) => d.day_number = idx + 1);
      return { ...prev, itinerary: newItin };
    });
  };

  // Add-ons Management
  const handleAddAddon = () => {
    setFormData(prev => ({
      ...prev,
      addons: [...prev.addons, { name: '', price: 0, description: '' }]
    }));
  };

  const handleRemoveAddon = (idx) => {
    setFormData(prev => {
      const newAddons = [...prev.addons];
      newAddons.splice(idx, 1);
      return { ...prev, addons: newAddons };
    });
  };

  const handleAddonChange = (idx, field, value) => {
    setFormData(prev => {
      const newAddons = [...prev.addons];
      newAddons[idx] = { ...newAddons[idx], [field]: value };
      return { ...prev, addons: newAddons };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateExperience(experience._id, formData);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-package-modal" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(0,0,0,0.8)', zIndex: 10000, display: 'flex', 
      justifyContent: 'center', alignItems: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#14141f', borderRadius: '15px', width: '900px', maxWidth: '95%',
        maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(212,175,55,0.3)',
        padding: '30px', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: 'transparent',
          border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer'
        }}>×</button>

        <h2 style={{ color: '#d4af37', marginBottom: '20px' }}>
          <i className="fa-solid fa-pen-to-square"></i> Edit Package: {experience?.name}
        </h2>

        {error && <div style={{ color: '#ff4d4f', marginBottom: '15px', padding: '10px', background: 'rgba(255,77,79,0.1)', borderRadius: '5px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', color: '#a4a4b4', marginBottom: '5px' }}>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a4a4b4', marginBottom: '5px' }}>Base Price ($)</label>
              <input type="number" name="base_price" value={formData.base_price} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a4a4b4', marginBottom: '5px' }}>Destination</label>
              <select name="destination" value={formData.destination} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required>
                <option value="">Select Destination</option>
                {destinationsList?.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#a4a4b4', marginBottom: '5px' }}>Supervisor</label>
              <select name="supervisor" value={formData.supervisor} onChange={handleInputChange} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}>
                <option value="">None</option>
                {supervisorsList?.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: '#a4a4b4', marginBottom: '5px' }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }} required></textarea>
            </div>
          </div>

          {/* Itinerary Builder */}
          <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '20px' }}>
            <h3 style={{ color: '#d4af37', display: 'flex', justifyContent: 'space-between' }}>
              <span><i className="fa-solid fa-map-location-dot"></i> Itinerary Builder</span>
              <button type="button" onClick={handleAddDay} style={{ background: 'var(--brand-accent, #d4af37)', color: '#000', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Day</button>
            </h3>

            {formData.itinerary.map((day, dIdx) => (
              <div key={dIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '3px solid #d4af37' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%' }}>
                    <h4 style={{ margin: 0, color: '#fff', width: '80px' }}>Day {day.day_number}</h4>
                    <input type="text" value={day.title} onChange={(e) => handleDayChange(dIdx, 'title', e.target.value)} placeholder="Day Title" style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button type="button" onClick={() => moveDay(dIdx, -1)} disabled={dIdx === 0} style={{ background: '#333', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>↑</button>
                    <button type="button" onClick={() => moveDay(dIdx, 1)} disabled={dIdx === formData.itinerary.length - 1} style={{ background: '#333', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>↓</button>
                    <button type="button" onClick={() => handleRemoveDay(dIdx)} style={{ background: '#ff4d4f', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' }}>✕</button>
                  </div>
                </div>
                
                <textarea value={day.description} onChange={(e) => handleDayChange(dIdx, 'description', e.target.value)} placeholder="Day Description..." style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', marginBottom: '10px', minHeight: '60px' }}></textarea>

                {/* Activities within Day */}
                <div style={{ marginLeft: '20px', paddingLeft: '10px', borderLeft: '1px dashed rgba(255,255,255,0.2)' }}>
                  {day.activities.map((act, aIdx) => (
                    <div key={aIdx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      <select value={act.activity?._id || act.activity} onChange={(e) => handleActivityChange(dIdx, aIdx, 'activity', e.target.value)} style={{ flex: 2, padding: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="">Select Activity</option>
                        {activitiesList?.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                      
                      <select value={act.provider?._id || act.provider} onChange={(e) => handleActivityChange(dIdx, aIdx, 'provider', e.target.value)} style={{ flex: 1.5, padding: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <option value="">Select Provider</option>
                        {providersList?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                      
                      <input type="number" value={act.price} onChange={(e) => handleActivityChange(dIdx, aIdx, 'price', Number(e.target.value))} placeholder="Price" style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} />
                      
                      <button type="button" onClick={() => handleRemoveActivity(dIdx, aIdx)} style={{ background: '#ff4d4f', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddActivity(dIdx)} style={{ background: 'transparent', color: '#d4af37', border: '1px dashed #d4af37', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>+ Add Activity to Day</button>
                </div>
              </div>
            ))}
            {formData.itinerary.length === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>No itinerary days added yet.</p>}
          </div>

          {/* Modular Add-ons */}
          <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '20px' }}>
            <h3 style={{ color: '#d4af37', display: 'flex', justifyContent: 'space-between' }}>
              <span><i className="fa-solid fa-puzzle-piece"></i> Modular Extensions (Add-ons)</span>
              <button type="button" onClick={handleAddAddon} style={{ background: 'var(--brand-accent, #d4af37)', color: '#000', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Extension</button>
            </h3>

            {formData.addons.map((addon, aIdx) => (
              <div key={aIdx} style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', marginBottom: '15px', borderLeft: '3px solid #d4af37' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input type="text" value={addon.name} onChange={(e) => handleAddonChange(aIdx, 'name', e.target.value)} placeholder="Extension Name (e.g. Professional Photographer)" style={{ flex: 2, padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} required />
                  <input type="number" value={addon.price} onChange={(e) => handleAddonChange(aIdx, 'price', Number(e.target.value))} placeholder="Price ($)" style={{ flex: 1, padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} required />
                  <button type="button" onClick={() => handleRemoveAddon(aIdx)} style={{ background: '#ff4d4f', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 15px', borderRadius: '4px' }}>✕</button>
                </div>
                <textarea value={addon.description} onChange={(e) => handleAddonChange(aIdx, 'description', e.target.value)} placeholder="Description..." style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', minHeight: '60px' }}></textarea>
              </div>
            ))}
            {formData.addons.length === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>No extensions available.</p>}
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#d4af37', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPackageModal;
