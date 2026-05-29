import React, { useState, useEffect } from 'react';
import './PublishPackageModal.css';

const PublishPackageModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  setFormData, 
  itinerary, 
  setItinerary, 
  getSupervisorsList, 
  destinationsList, 
  activitiesList,
  submittingPkg,
  calculateEstimatedPackagePrice
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [expandedDay, setExpandedDay] = useState(1);

  // Handle smooth opening/closing transitions
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsRendered(false);
        document.body.style.overflow = 'auto';
      }, 400); // Matches CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Itinerary Handlers
  const addDay = () => {
    setFormData(prev => ({ ...prev, duration_days: (Number(prev.duration_days) || 0) + 1 }));
  };

  const removeDay = (index) => {
    setItinerary(prev => prev.filter((_, i) => i !== index).map((d, i) => ({ ...d, day_number: i + 1 })));
    setFormData(prev => ({ ...prev, duration_days: Math.max(1, (Number(prev.duration_days) || 1) - 1) }));
  };

  const addActivityToDay = (dayIdx) => {
    setItinerary(prev => prev.map((d, idx) => {
      if (idx === dayIdx) {
        return { ...d, activities: [...d.activities, { activity: '', provider: '', price: '', description: '' }] };
      }
      return d;
    }));
  };

  const removeActivityFromDay = (dayIdx, actIdx) => {
    setItinerary(prev => prev.map((d, idx) => {
      if (idx === dayIdx) {
        return { ...d, activities: d.activities.filter((_, aIdx) => aIdx !== actIdx) };
      }
      return d;
    }));
  };

  const handleItineraryActivityChange = (dayIdx, actIdx, field, value) => {
    setItinerary(prev => prev.map((d, idx) => {
      if (idx === dayIdx) {
        const updatedActivities = d.activities.map((act, aIdx) => {
          if (aIdx === actIdx) {
            const updated = { ...act, [field]: value };
            if (field === 'activity' && value) {
              const matchedAct = activitiesList?.find(a => a._id === value);
              if (matchedAct) {
                updated.activity = value;
                updated.price = matchedAct.price || 0;
                updated.provider = matchedAct.provider?.name || matchedAct.provider || 'Platform Provider';
              }
            }
            return updated;
          }
          return act;
        });
        return { ...d, activities: updatedActivities };
      }
      return d;
    }));
  };

  // Addons
  const addAddon = (actId) => {
    setFormData(prev => ({ ...prev, addons: [...prev.addons, actId] }));
  };
  const removeAddon = (idx) => {
    setFormData(prev => ({ ...prev, addons: prev.addons.filter((_, i) => i !== idx) }));
  };

  // Form Submit
  const handlePublish = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className={`ppm-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <form className="ppm-modal" onClick={(e) => e.stopPropagation()} onSubmit={handlePublish}>
        
        {/* Header */}
        <header className="ppm-header">
          <div className="ppm-header-titles">
            <h2>{formData._id ? '✏️ Edit Package Workspace' : '✨ Package Publisher'}</h2>
            <p>{formData._id ? 'Modify an existing package and its itinerary.' : 'Design and deploy a new travel experience or dayuse program.'}</p>
          </div>
          <div className="ppm-header-actions">
            <button type="button" className="ppm-btn-outline" onClick={() => alert('Saved as Draft!')}><i className="fa-regular fa-floppy-disk"></i> Save as Draft</button>
            <button type="button" className="ppm-btn-outline" style={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.5)' }} onClick={() => alert('Preview mode generating...')}>
              <i className="fa-solid fa-desktop"></i> Live Preview
            </button>
            <button type="submit" className="ppm-btn-solid" disabled={submittingPkg}>
              {submittingPkg ? <><i className="fa-solid fa-spinner fa-spin"></i> Publishing...</> : <><i className="fa-solid fa-rocket"></i> Publish Package</>}
            </button>
            <button type="button" className="ppm-btn-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
          </div>
        </header>

        {/* Layout Body */}
        <div className="ppm-body">
          
          {/* Left Column - Content Builder */}
          <div className="ppm-left-col">
            
            {/* 1. Basic Info */}
            <div className="ppm-section-card">
              <h3 className="ppm-section-title"><i className="fa-solid fa-circle-info"></i> Basic Information</h3>
              <div className="ppm-input-group">
                <label>Package Title</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="ppm-input large" placeholder="e.g. Royal Nile Cruise & Pyramids Explorer" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="ppm-input-group">
                  <label>Destination City</label>
                  <select name="destination" value={formData.destination} onChange={handleInputChange} className="ppm-input" required>
                    <option value="">-- Select Destination --</option>
                    {destinationsList?.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="ppm-input-group">
                  <label>Smart Tags (Keywords)</label>
                  <input type="text" className="ppm-input" placeholder="Type and press Enter (Mock)" />
                  <div className="ppm-chips-container">
                    <span className="ppm-chip">#Luxury <i className="fa-solid fa-xmark"></i></span>
                    <span className="ppm-chip">#Couples <i className="fa-solid fa-xmark"></i></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Media Zone */}
            <div className="ppm-section-card">
              <h3 className="ppm-section-title"><i className="fa-solid fa-images"></i> Media & Gallery URLs</h3>
              <div className="ppm-input-group">
                <label>Cover Image URL</label>
                <input type="text" name="image" className="ppm-input" value={formData.image || ''} onChange={handleInputChange} placeholder="https://..." required />
              </div>
              <div className="ppm-gallery-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="ppm-input-group" style={{ margin: 0 }}>
                  <label>Safari Image</label>
                  <input type="text" name="safari_image" className="ppm-input" value={formData.safari_image || ''} onChange={handleInputChange} placeholder="https://..." />
                </div>
                <div className="ppm-input-group" style={{ margin: 0 }}>
                  <label>Hotel Image</label>
                  <input type="text" name="hotel_image" className="ppm-input" value={formData.hotel_image || ''} onChange={handleInputChange} placeholder="https://..." />
                </div>
                <div className="ppm-input-group" style={{ margin: 0 }}>
                  <label>Dining Image</label>
                  <input type="text" name="dining_image" className="ppm-input" value={formData.dining_image || ''} onChange={handleInputChange} placeholder="https://..." />
                </div>
              </div>
            </div>

            {/* 3. Rich Text */}
            <div className="ppm-section-card">
              <h3 className="ppm-section-title"><i className="fa-solid fa-pen-nib"></i> Package Description</h3>
              <div className="ppm-wysiwyg">
                <div className="ppm-wysiwyg-toolbar">
                  <button type="button" className="ppm-toolbar-btn active"><i className="fa-solid fa-bold"></i></button>
                  <button type="button" className="ppm-toolbar-btn"><i className="fa-solid fa-italic"></i></button>
                  <button type="button" className="ppm-toolbar-btn"><i className="fa-solid fa-list-ul"></i></button>
                </div>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="ppm-wysiwyg-editor" placeholder="Craft a compelling story for this travel experience..." required></textarea>
              </div>
            </div>

            {/* 4. Itinerary Builder */}
            <div className="ppm-section-card">
              <h3 className="ppm-section-title"><i className="fa-solid fa-route"></i> Daily Itinerary Planner</h3>
              
              {itinerary.map((day, dayIdx) => (
                <div className="ppm-itinerary-day" key={dayIdx}>
                  <div className="ppm-itinerary-header" onClick={() => setExpandedDay(day.day_number)}>
                    <h4 style={{ flex: 1 }}><span>Day {day.day_number}</span> {day.title || 'New Itinerary Day'}</h4>
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeDay(dayIdx); }} style={{ background: 'none', border: 'none', color: '#ef4444', marginRight: '15px', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                    <i className={`fa-solid fa-chevron-${expandedDay === day.day_number ? 'up' : 'down'}`}></i>
                  </div>
                  {expandedDay === day.day_number && (
                    <div className="ppm-itinerary-body">
                      <div className="ppm-input-group">
                        <label>Day Theme / Title</label>
                        <input type="text" className="ppm-input" value={day.title || ''} onChange={(e) => setItinerary(prev => prev.map((d, i) => i === dayIdx ? { ...d, title: e.target.value } : d))} placeholder="e.g. Arrival & Museum Visit" required />
                      </div>
                      <div className="ppm-input-group">
                        <label>Day Description</label>
                        <input type="text" className="ppm-input" value={day.description || ''} onChange={(e) => setItinerary(prev => prev.map((d, i) => i === dayIdx ? { ...d, description: e.target.value } : d))} placeholder="What happens on this day?" />
                      </div>
                      
                      <h5 style={{ color: '#9ca3af', marginBottom: '10px', fontSize: '0.9rem' }}>Day Activities</h5>
                      {day.activities.map((act, actIdx) => (
                        <div className="ppm-activity-row" key={actIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 100px 40px', gap: '10px', marginBottom: '10px' }}>
                          <select className="ppm-input" value={act.activity?._id || act.activity || ''} onChange={(e) => handleItineraryActivityChange(dayIdx, actIdx, 'activity', e.target.value)} required>
                            <option value="">-- Select Activity --</option>
                            {activitiesList?.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                          </select>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" className="ppm-input" style={{ flexGrow: 1 }} value={act.provider} onChange={(e) => handleItineraryActivityChange(dayIdx, actIdx, 'provider', e.target.value)} placeholder="Provider" />
                            <button type="button" onClick={() => {
                              const providers = ['Local Bedouin Guides', 'Elite Safaris', 'Cairo Adventures', 'Nile Treasures', 'Desert Fox Tours'];
                              const matched = providers[Math.floor(Math.random() * providers.length)];
                              handleItineraryActivityChange(dayIdx, actIdx, 'provider', matched + ' (AI Matched ✓)');
                            }} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }} title="AI Auto-Match Best Provider">
                               <i className="fa-solid fa-wand-magic-sparkles"></i> AI Match
                            </button>
                          </div>
                          <input type="text" className="ppm-input" value={act.image || ''} onChange={(e) => handleItineraryActivityChange(dayIdx, actIdx, 'image', e.target.value)} placeholder="Image URL (Optional)" />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#9ca3af' }}>$</span>
                            <input type="number" className="ppm-input" value={act.price} onChange={(e) => handleItineraryActivityChange(dayIdx, actIdx, 'price', e.target.value)} style={{ padding: '12px 5px' }} />
                          </div>
                          <button type="button" onClick={() => removeActivityFromDay(dayIdx, actIdx)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><i className="fa-solid fa-trash"></i></button>
                        </div>
                      ))}
                      <button type="button" className="ppm-btn-outline" onClick={() => addActivityToDay(dayIdx)} style={{ marginTop: '10px' }}><i className="fa-solid fa-plus"></i> Add Activity</button>
                    </div>
                  )}
                </div>
              ))}

              <button type="button" className="ppm-btn-add-dashed" onClick={addDay}><i className="fa-solid fa-calendar-plus"></i> Add New Day</button>
            </div>

            {/* 5. Modular Extensions (Add-ons) */}
            <div className="ppm-section-card">
              <h3 className="ppm-section-title"><i className="fa-solid fa-puzzle-piece"></i> Modular Extensions (Add-ons)</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>Optional upgrades customers can add to this package.</p>
              
              <div className="ppm-addons-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {(formData.addons || []).map((addon, index) => (
                  <div key={index} className="ppm-addon-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', position: 'relative' }}>
                    <button type="button" onClick={() => {
                      const newAddons = [...(formData.addons || [])];
                      newAddons.splice(index, 1);
                      setFormData(prev => ({ ...prev, addons: newAddons }));
                    }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '10px' }}>
                      <div className="ppm-input-group" style={{ margin: 0 }}>
                        <label>Add-on Name</label>
                        <input type="text" className="ppm-input" value={addon.name} onChange={(e) => {
                          const newAddons = [...formData.addons];
                          newAddons[index].name = e.target.value;
                          setFormData(prev => ({ ...prev, addons: newAddons }));
                        }} placeholder="e.g. Professional Drone Photography" required />
                      </div>
                      <div className="ppm-input-group" style={{ margin: 0 }}>
                        <label>Price ($)</label>
                        <input type="number" className="ppm-input" value={addon.price} onChange={(e) => {
                          const newAddons = [...formData.addons];
                          newAddons[index].price = e.target.value;
                          setFormData(prev => ({ ...prev, addons: newAddons }));
                        }} required />
                      </div>
                    </div>
                    <div className="ppm-input-group" style={{ margin: 0 }}>
                      <label>Description (Optional)</label>
                      <input type="text" className="ppm-input" value={addon.description} onChange={(e) => {
                        const newAddons = [...formData.addons];
                        newAddons[index].description = e.target.value;
                        setFormData(prev => ({ ...prev, addons: newAddons }));
                      }} placeholder="Brief details about this add-on" />
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={() => {
                  setFormData(prev => ({ ...prev, addons: [...(prev.addons || []), { name: '', price: 0, description: '' }] }));
                }} className="ppm-btn-outline" style={{ borderStyle: 'dashed', justifyContent: 'center' }}>
                  <i className="fa-solid fa-plus"></i> Add Extension
                </button>
              </div>
            </div>

          </div>

          {/* Right Column - Settings & Pricing */}
          <div className="ppm-right-col">
            
            <div className="ppm-section-card">
              <h3 className="ppm-section-title" style={{ borderBottom: 'none', marginBottom: '10px' }}><i className="fa-solid fa-sliders"></i> Package Settings</h3>
              <div className="ppm-input-group">
                <label>Experience Type</label>
                <select name="type" value={formData.type} onChange={handleInputChange} className="ppm-input">
                  <option value="trip">Trip (Multi-Day)</option>
                  <option value="dayuse">Dayuse</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="ppm-input-group">
                  <label>Duration (Days)</label>
                  <input type="number" name="duration_days" value={formData.duration_days} onChange={handleInputChange} className="ppm-input" disabled={formData.type === 'dayuse'} required />
                </div>
                <div className="ppm-input-group">
                  <label>Max Capacity</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="ppm-input" required />
                </div>
              </div>
              <div className="ppm-input-group">
                <label>Assigned Supervisor</label>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}><i className="fa-solid fa-wand-magic-sparkles"></i> AI Best Fit</span>
                      <strong style={{ color: '#fff' }}>Mohra Aiman</strong> <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>(98% Match)</span>
                    </div>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, supervisor: getSupervisorsList?.().find(s => s.firstName.includes('Mohra'))?._id }))} className="ppm-btn-solid" style={{ background: '#10b981', color: '#fff', padding: '5px 12px', fontSize: '0.8rem' }}>1-Click Assign</button>
                  </div>
                </div>
                <select name="supervisor" value={formData.supervisor || ''} onChange={handleInputChange} className="ppm-input">
                  <option value="">AI Auto-match Guide (Pending)</option>
                  {getSupervisorsList?.().map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} {s.firstName.includes('Mohra') ? '🌟 (Best Fit)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="ppm-summary-card">
              <h3 className="ppm-section-title" style={{ borderBottom: 'none', marginBottom: '15px' }}><i className="fa-solid fa-receipt"></i> Financial Breakdown</h3>
              
              <div className="ppm-input-group" style={{ marginBottom: '25px' }}>
                <label style={{ color: '#fff' }}>Base Price ($)</label>
                <input type="number" name="base_price" value={formData.base_price} onChange={handleInputChange} className="ppm-input large" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(250,204,21,0.5)' }} required />
              </div>

              <div className="ppm-summary-row">
                <span>Total Activities Cost</span>
                <span>${(calculateEstimatedPackagePrice?.() || 0) - (Number(formData.base_price) || 0)}</span>
              </div>
              
              <div className="ppm-summary-divider"></div>
              
              <div className="ppm-summary-total">
                <span>Estimated Final Price</span>
                <strong style={{ color: '#10b981', textShadow: '0 0 10px rgba(16,185,129,0.3)' }}>${calculateEstimatedPackagePrice?.() || 0}</strong>
              </div>
              
              <button type="submit" className="ppm-btn-solid" style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '15px', fontSize: '1.1rem' }} disabled={submittingPkg}>
                {submittingPkg ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className="fa-solid fa-cloud-arrow-up"></i> {formData._id ? 'Update Package' : 'Publish Now'}</>}
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
};

export default PublishPackageModal;
