import React, { useState, useEffect } from 'react';
import { updateExperience, duplicateExperience } from '../../utils/api';
import './PublishPackageModal.css';

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
    itinerary: [],
    included: [],
    excluded: [],
    priceBreakdown: [],
    airportPickup: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState(1);
  const [showAddActDayIndex, setShowAddActDayIndex] = useState(null);
  const [editingActivityKey, setEditingActivityKey] = useState(null);

  const getActivityImage = (actName = '') => {
    const name = actName.toLowerCase();
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
        itinerary: experience.itinerary || [],
        included: experience.included || [],
        excluded: experience.excluded || [],
        priceBreakdown: experience.priceBreakdown || [],
        airportPickup: !!experience.airportPickup
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

                <input type="text" value={day.culturalGuide || ''} onChange={(e) => handleDayChange(dIdx, 'culturalGuide', e.target.value)} placeholder="📜 Cultural Guide Commentary for this day (e.g. Egyptologist pyramids context)" style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37', borderRadius: '6px', marginBottom: '15px' }} />

                {/* Activities within Day */}
                <div style={{ marginLeft: '20px', paddingLeft: '10px', borderLeft: '1px dashed rgba(255,255,255,0.2)' }}>
                  <h5 style={{ color: '#9ca3af', marginBottom: '15px', fontSize: '0.95rem', fontWeight: 'bold' }}>
                    <i className="fa-solid fa-route" style={{ color: '#d4af37', marginRight: '5px' }}></i> Day Activities
                  </h5>

                  {day.activities.map((act, actIdx) => {
                    const matchedAct = activitiesList?.find(a => a._id === (act.activity?._id || act.activity));
                    const actName = matchedAct ? matchedAct.name : 'Custom Activity';
                    const actDesc = act.description || matchedAct?.description || 'No description available for this activity.';
                    const actImage = act.image || matchedAct?.image || getActivityImage(actName);
                    const actProvider = act.provider || matchedAct?.provider?.name || matchedAct?.provider || 'Platform Provider';
                    const actPrice = act.price !== undefined ? act.price : (matchedAct?.price || 0);

                    return (
                      <div key={actIdx} style={{ marginBottom: '15px' }}>
                        <div className="ppm-activity-card">
                          <img 
                            src={actImage} 
                            alt={actName} 
                            className="ppm-activity-card-image"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                          <div className="ppm-activity-card-info">
                            <h4 className="ppm-activity-card-title" style={{ color: '#d4af37' }}>{actName}</h4>
                            <p className="ppm-activity-card-desc">{actDesc}</p>
                            <div className="ppm-activity-card-provider">
                              <i className="fa-solid fa-user-tie"></i> Provider: {actProvider}
                            </div>
                            <div className="ppm-activity-card-actions">
                              <button
                                type="button"
                                className="ppm-activity-edit-toggle"
                                onClick={() => {
                                  const key = `${dIdx}-${actIdx}`;
                                  setEditingActivityKey(editingActivityKey === key ? null : key);
                                }}
                              >
                                <i className="fa-solid fa-sliders"></i> {editingActivityKey === `${dIdx}-${actIdx}` ? 'Close Specs' : 'Edit Specs'}
                              </button>
                            </div>
                          </div>
                          <div className="ppm-activity-card-right">
                            <span className="ppm-activity-card-status">
                              {Number(actPrice) === 0 ? 'Included' : `EGP ${actPrice}`}
                            </span>
                            <span className="ppm-activity-card-time">
                              {actIdx === 0 ? '08:00 AM' : actIdx === 1 ? '01:00 PM' : '04:00 PM'}
                            </span>
                            <button 
                              type="button" 
                              className="ppm-activity-delete-btn" 
                              onClick={() => handleRemoveActivity(dIdx, actIdx)}
                              title="Remove Activity"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </div>

                        {/* Drawer / Edit specifications panel */}
                        {editingActivityKey === `${dIdx}-${actIdx}` && (
                          <div className="ppm-activity-edit-drawer">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
                              <div className="ppm-input-group" style={{ margin: 0 }}>
                                <label>Provider Name</label>
                                <input 
                                  type="text" 
                                  className="ppm-input" 
                                  value={act.provider || ''} 
                                  onChange={(e) => handleActivityChange(dIdx, actIdx, 'provider', e.target.value)} 
                                  placeholder="e.g. Red Sea Adventures" 
                                />
                              </div>
                              <div className="ppm-input-group" style={{ margin: 0 }}>
                                <label>Price Override (EGP)</label>
                                <input 
                                  type="number" 
                                  className="ppm-input" 
                                  value={act.price || ''} 
                                  onChange={(e) => handleActivityChange(dIdx, actIdx, 'price', Number(e.target.value))} 
                                  placeholder="e.g. 150" 
                                />
                              </div>
                            </div>
                            <div className="ppm-input-group" style={{ margin: 0, marginBottom: '10px' }}>
                              <label>Custom Description</label>
                              <textarea 
                                className="ppm-input" 
                                rows="2"
                                value={act.description || ''} 
                                onChange={(e) => handleActivityChange(dIdx, actIdx, 'description', e.target.value)} 
                                placeholder="Override standard description..." 
                                style={{ resize: 'vertical' }}
                              />
                            </div>
                            <div className="ppm-input-group" style={{ margin: 0 }}>
                              <label>Custom Image URL</label>
                              <input 
                                type="text" 
                                className="ppm-input" 
                                value={act.image || ''} 
                                onChange={(e) => handleActivityChange(dIdx, actIdx, 'image', e.target.value)} 
                                placeholder="https://images.unsplash.com/..." 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {showAddActDayIndex === dIdx ? (
                    <div style={{ marginTop: '15px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h5 style={{ color: '#d4af37', margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                          <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '5px' }}></i> Select Activity to Add (Day {day.day_number})
                        </h5>
                        <button 
                          type="button" 
                          className="ppm-btn-outline" 
                          onClick={() => setShowAddActDayIndex(null)}
                          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        >
                          <i className="fa-solid fa-xmark"></i> Close Grid
                        </button>
                      </div>
                      
                      <div className="ppm-activity-grid">
                        {activitiesList?.map((actItem) => {
                          const itemImage = actItem.image || getActivityImage(actItem.name);
                          return (
                            <div 
                              key={actItem._id} 
                              className="ppm-activity-select-card"
                              onClick={() => {
                                setFormData(prev => {
                                  const newItin = [...prev.itinerary];
                                  newItin[dIdx].activities.push({
                                    activity: actItem._id,
                                    provider: actItem.provider?.name || actItem.provider || 'Platform Provider',
                                    price: actItem.price || 0,
                                    description: actItem.description || '',
                                    image: itemImage
                                  });
                                  return { ...prev, itinerary: newItin };
                                });
                                setShowAddActDayIndex(null);
                              }}
                            >
                              <img src={itemImage} alt={actItem.name} className="ppm-activity-select-image" />
                              <div className="ppm-activity-select-body">
                                <h6 className="ppm-activity-select-name">{actItem.name}</h6>
                                <p className="ppm-activity-select-desc">{actItem.description || 'No description available.'}</p>
                                <div className="ppm-activity-select-price">
                                  <span>EGP {actItem.price || 0}</span>
                                  <span style={{ fontSize: '0.75rem', color: '#d4af37', fontWeight: 'bold' }}>+ Add Card</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => setShowAddActDayIndex(dIdx)} 
                      style={{ background: 'transparent', color: '#d4af37', border: '1px dashed #d4af37', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                      <i className="fa-solid fa-plus"></i> Add Activity to Day {day.day_number}
                    </button>
                  )}
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

          {/* Airport Pickup Toggle */}
          <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
              <input type="checkbox" checked={formData.airportPickup} onChange={(e) => setFormData(prev => ({ ...prev, airportPickup: e.target.checked }))} style={{ width: '20px', height: '20px', accentColor: '#d4af37' }} />
              ✈️ Includes Airport Pickup & Transfers / يشمل الاستقبال والتوصيل من المطار
            </label>
          </div>

          {/* Included / Excluded */}
          <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', color: '#22c55e', fontWeight: 'bold', marginBottom: '5px' }}>✅ Included Services (one per line)</label>
              <textarea
                rows="4"
                placeholder="All Transfers&#10;Meals&#10;Entry Tickets"
                value={(formData.included || []).join('\n')}
                onChange={e => setFormData(prev => ({ ...prev, included: e.target.value.split('\n').filter(s => s.trim()) }))}
                style={{ width: '100%', padding: '10px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.3)', color: '#fff', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#ef4444', fontWeight: 'bold', marginBottom: '5px' }}>❌ Excluded (one per line)</label>
              <textarea
                rows="4"
                placeholder="Tipping&#10;Drinks&#10;Personal Expenses"
                value={(formData.excluded || []).join('\n')}
                onChange={e => setFormData(prev => ({ ...prev, excluded: e.target.value.split('\n').filter(s => s.trim()) }))}
                style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)', color: '#fff', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Price Breakdown */}
          <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '20px' }}>
            <h3 style={{ color: '#d4af37', display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span><i className="fa-solid fa-coins"></i> Price Breakdown Items</span>
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, priceBreakdown: [...(prev.priceBreakdown || []), { label: '', amount: 0 }] }))} style={{ background: 'var(--brand-accent, #d4af37)', color: '#000', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Price Line</button>
            </h3>
            
            {(formData.priceBreakdown || []).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="e.g. Luxury Nile Cruise (per person)"
                  value={item.label}
                  onChange={e => {
                    const updated = [...formData.priceBreakdown];
                    updated[idx].label = e.target.value;
                    setFormData(prev => ({ ...prev, priceBreakdown: updated }));
                  }}
                  style={{ flex: 3, padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  required
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={item.amount}
                  onChange={e => {
                    const updated = [...formData.priceBreakdown];
                    updated[idx].amount = Number(e.target.value);
                    setFormData(prev => ({ ...prev, priceBreakdown: updated }));
                  }}
                  style={{ flex: 1.5, padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                  required
                />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, priceBreakdown: prev.priceBreakdown.filter((_, i) => i !== idx) }))} style={{ background: '#ff4d4f', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px 12px', borderRadius: '4px' }}>✕</button>
              </div>
            ))}
            {(formData.priceBreakdown || []).length === 0 && <p style={{ color: '#888', fontStyle: 'italic' }}>No price breakdown items defined.</p>}
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
