import React, { useState, useEffect } from 'react';
import { getAllPackingGuides } from '../../utils/api';
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
  calculateEstimatedPackagePrice,
  providersList
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [expandedDay, setExpandedDay] = useState(1);
  // List of available packing guides fetched from the backend
  const [packingGuidesList, setPackingGuidesList] = useState([]);
  // Draft & Preview UI states
  const [draftToast, setDraftToast] = useState(null); // { type: 'success'|'error', msg: string }
  const [showLivePreview, setShowLivePreview] = useState(false);

  // Load all packing guides so the admin can link one to this experience
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await getAllPackingGuides();
        if (res?.success && Array.isArray(res.data)) {
          setPackingGuidesList(res.data);
        }
      } catch (err) {
        console.error('Failed to load packing guides list:', err);
      }
    };
    fetchGuides();
  }, []);

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

  // Find the best fit supervisor dynamically from the actual database list
  const getBestFitSupervisor = () => {
    const list = getSupervisorsList?.() || [];
    if (list.length === 0) return null;

    // Filter supervisors who are active and available (not currently assigned to any other trip)
    const available = list.filter(s => s.status === 'available' || !s.currentAssigned || s.currentAssigned === 'none' || s.currentAssigned === null);
    
    if (available.length > 0) {
      return available[0]; // Pick the first free supervisor
    }
    return list[0]; // Fallback to first supervisor if all are busy
  };

  const bestFit = getBestFitSupervisor();

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

  // ── Save as Draft ─────────────────────────────────────────────
  const handleSaveAsDraft = () => {
    try {
      const draft = {
        formData,
        itinerary,
        savedAt: new Date().toISOString(),
      };
      const key = formData._id
        ? `clearpath_draft_${formData._id}`
        : `clearpath_draft_new`;
      localStorage.setItem(key, JSON.stringify(draft));
      setDraftToast({ type: 'success', msg: `✅ Draft saved: "${formData.name || 'Untitled Package'}" — you can return anytime to continue.` });
    } catch {
      setDraftToast({ type: 'error', msg: '❌ Failed to save draft. Please try again.' });
    }
    setTimeout(() => setDraftToast(null), 4000);
  };

  // ── Form Submit ───────────────────────────────────────────────
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
            {/* ── Save as Draft ── */}
            <button
              type="button"
              className="ppm-btn-outline"
              onClick={handleSaveAsDraft}
              title="Save current data as a local draft"
            >
              <i className="fa-regular fa-floppy-disk"></i> Save as Draft
            </button>

            {/* ── Live Preview ── */}
            <button
              type="button"
              className="ppm-btn-outline"
              style={{ color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.4)' }}
              onClick={() => setShowLivePreview(true)}
              title="See a live card preview of this package"
            >
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
                <label>Cover Image URL (Optional)</label>
                <input type="text" name="image" className="ppm-input" value={formData.image || ''} onChange={handleInputChange} placeholder="https://..." />
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
                              const pList = providersList || [];
                              // Filter for certified Guides first, then sort by highest trustScore
                              const guides = pList.filter(p => p.type === 'Guide');
                              const pool = guides.length > 0 ? guides : pList;
                              const sorted = [...pool].sort((a, b) => (b.trustScore || 100) - (a.trustScore || 100));
                              const matchedProvider = sorted[0];
                              const matchedName = matchedProvider ? matchedProvider.name : 'Bedouin Local Guide';
                              handleItineraryActivityChange(dayIdx, actIdx, 'provider', matchedName + ' (AI Matched ✓)');
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
                {bestFit ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 'bold', display: 'block', marginBottom: '2px' }}><i className="fa-solid fa-wand-magic-sparkles"></i> AI Best Fit</span>
                        <strong style={{ color: '#fff' }}>{bestFit.firstName} {bestFit.lastName}</strong> <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>(98% Match - Available)</span>
                      </div>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, supervisor: bestFit._id }))} className="ppm-btn-solid" style={{ background: '#10b981', color: '#fff', padding: '5px 12px', fontSize: '0.8rem' }}>1-Click Assign</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px', marginBottom: '10px', color: '#ef4444', fontSize: '0.85rem' }}>
                    <i className="fa-solid fa-circle-exclamation"></i> No available supervisors in database.
                  </div>
                )}
                <select name="supervisor" value={formData.supervisor || ''} onChange={handleInputChange} className="ppm-input">
                  <option value="">AI Auto-match Guide (Pending)</option>
                  {getSupervisorsList?.().map(s => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.lastName} {bestFit && s._id === bestFit._id ? '🌟 (Best Fit)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Linked Packing Guide Card ── */}
            <div className="ppm-section-card">
              <h3 className="ppm-section-title">
                <i className="fa-solid fa-backpack"></i> Link Packing / Adventure Guide
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px', lineHeight: '1.5' }}>
                Select an existing guide to attach to this experience. Guests will see
                packing lists, safety protocols, and difficulty details on the package page.
              </p>

              {/* Guide selector */}
              <div className="ppm-input-group">
                <label>Select Guide</label>
                <select
                  name="packingGuide"
                  value={formData.packingGuide || ''}
                  onChange={handleInputChange}
                  className="ppm-input"
                >
                  <option value="">— No Guide Linked —</option>
                  {packingGuidesList.map(g => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.activityType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview card — shown only when a guide is selected */}
              {formData.packingGuide && (() => {
                const selected = packingGuidesList.find(g => g._id === formData.packingGuide);
                if (!selected) return null;
                return (
                  <div style={{
                    marginTop: '14px',
                    background: 'rgba(115,116,155,0.07)',
                    border: '1px solid rgba(115,116,155,0.2)',
                    borderRadius: '12px',
                    padding: '16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg,#73749B,#8E6B92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0,
                      }}>
                        <i className="fa-solid fa-backpack" style={{ color: '#fff' }}></i>
                      </div>
                      <div>
                        <strong style={{ color: '#fff', display: 'block', fontSize: '0.95rem' }}>{selected.name}</strong>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '4px',
                          background: 'rgba(212,175,55,0.12)', color: '#d4af37', marginTop: '3px', display: 'inline-block',
                        }}>{selected.activityType}</span>
                      </div>
                      {/* Difficulty badge */}
                      <span style={{
                        marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600,
                        padding: '3px 10px', borderRadius: '20px',
                        background: selected.difficultyLevel === 'easy' ? 'rgba(16,185,129,0.1)'
                          : selected.difficultyLevel === 'moderate' ? 'rgba(251,191,36,0.1)'
                          : selected.difficultyLevel === 'challenging' ? 'rgba(249,115,22,0.1)'
                          : 'rgba(239,68,68,0.1)',
                        color: selected.difficultyLevel === 'easy' ? '#10b981'
                          : selected.difficultyLevel === 'moderate' ? '#fbbf24'
                          : selected.difficultyLevel === 'challenging' ? '#f97316'
                          : '#ef4444',
                      }}>
                        {selected.difficultyLevel?.charAt(0).toUpperCase() + selected.difficultyLevel?.slice(1)}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {[
                        { icon: 'fa-box-open', label: 'Essentials', count: selected.essentials?.length || 0, color: '#73749B' },
                        { icon: 'fa-shirt', label: 'Clothing', count: selected.clothing?.length || 0, color: '#8E6B92' },
                        { icon: 'fa-shield-halved', label: 'Safety Tips', count: selected.safetyTips?.length || 0, color: '#10b981' },
                      ].map(stat => (
                        <div key={stat.label} style={{
                          flex: '1', minWidth: '70px', background: 'rgba(0,0,0,0.15)',
                          borderRadius: '8px', padding: '10px', textAlign: 'center',
                        }}>
                          <i className={`fa-solid ${stat.icon}`} style={{ color: stat.color, fontSize: '1.1rem', marginBottom: '5px', display: 'block' }}></i>
                          <strong style={{ color: '#fff', fontSize: '1.1rem', display: 'block' }}>{stat.count}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{stat.label}</span>
                        </div>
                      ))}
                    </div>

                    {selected.physicalRequirements && (
                      <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        <i className="fa-solid fa-person-walking" style={{ marginRight: '6px', color: '#73749B' }}></i>
                        {selected.physicalRequirements}
                      </p>
                    )}
                  </div>
                );
              })()}
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

            {/* Included / Excluded / Price Breakdown */}
            <div className="ppm-section-card">
              <h3 className="ppm-section-title"><i className="fa-solid fa-list-check"></i> Included &amp; Excluded</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div className="ppm-input-group">
                  <label style={{ color: '#22c55e' }}>✅ Included (one per line)</label>
                  <textarea
                    className="ppm-input"
                    rows="4"
                    placeholder={"All transfers\nAll Meals\nPark Permits"}
                    value={(formData.included || []).join('\n')}
                    onChange={e => setFormData(prev => ({ ...prev, included: e.target.value.split('\n').filter(s => s.trim()) }))}
                    style={{ resize: 'vertical', background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.3)' }}
                  />
                </div>
                <div className="ppm-input-group">
                  <label style={{ color: '#ef4444' }}>❌ Excluded (one per line)</label>
                  <textarea
                    className="ppm-input"
                    rows="4"
                    placeholder={"Personal Expenses\nTipping\nFlights"}
                    value={(formData.excluded || []).join('\n')}
                    onChange={e => setFormData(prev => ({ ...prev, excluded: e.target.value.split('\n').filter(s => s.trim()) }))}
                    style={{ resize: 'vertical', background: 'rgba(239,68,68,0.05)', borderColor: 'rgba(239,68,68,0.3)' }}
                  />
                </div>
              </div>

              <h3 className="ppm-section-title" style={{ marginTop: '10px' }}><i className="fa-solid fa-coins"></i> Price Breakdown Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                {(formData.priceBreakdown || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 36px', gap: '10px' }}>
                    <input
                      type="text" className="ppm-input"
                      value={item.label}
                      onChange={e => {
                        const updated = [...(formData.priceBreakdown || [])];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        setFormData(prev => ({ ...prev, priceBreakdown: updated }));
                      }}
                      placeholder="e.g. Hotel (per person)"
                    />
                    <input
                      type="number" className="ppm-input"
                      value={item.amount}
                      onChange={e => {
                        const updated = [...(formData.priceBreakdown || [])];
                        updated[idx] = { ...updated[idx], amount: e.target.value };
                        setFormData(prev => ({ ...prev, priceBreakdown: updated }));
                      }}
                      placeholder="Amount"
                    />
                    <button type="button" onClick={() => {
                      setFormData(prev => ({ ...prev, priceBreakdown: (prev.priceBreakdown || []).filter((_, i) => i !== idx) }));
                    }} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="ppm-btn-outline" onClick={() => setFormData(prev => ({ ...prev, priceBreakdown: [...(prev.priceBreakdown || []), { label: '', amount: 0 }] }))} style={{ borderStyle: 'dashed' }}>
                <i className="fa-solid fa-plus"></i> Add Price Line
              </button>
            </div>

          </div>

        </div>
      </form>

      {/* ════════════════════════════════════
           DRAFT TOAST NOTIFICATION
         ════════════════════════════════════ */}
      {draftToast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, padding: '14px 28px', borderRadius: '10px',
          background: draftToast.type === 'success' ? '#111827' : '#1f0d0d',
          border: `1px solid ${draftToast.type === 'success' ? '#d4af37' : '#ef4444'}`,
          color: draftToast.type === 'success' ? '#d4af37' : '#ef4444',
          fontFamily: 'Poppins, sans-serif', fontSize: '0.88rem', fontWeight: 600,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
          animation: 'ppmSlideUp 0.35s ease-out forwards'
        }}>
          {draftToast.msg}
        </div>
      )}

      {/* ════════════════════════════════════
           LIVE PREVIEW OVERLAY PANEL
         ════════════════════════════════════ */}
      {showLivePreview && (
        <div
          onClick={() => setShowLivePreview(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99998,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Poppins, Inter, sans-serif'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0f0f14', border: '1px solid #1f1f2a',
              borderRadius: '20px', width: '480px', maxWidth: '95vw',
              overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
              animation: 'ppmScaleIn 0.3s ease-out forwards'
            }}
          >
            {/* Preview Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #1f1f2a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-desktop" style={{ color: '#60a5fa', fontSize: '1.1rem' }}></i>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Live Package Preview</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', padding: '2px 8px', borderRadius: '10px' }}>PREVIEW MODE</span>
              </div>
              <button
                onClick={() => setShowLivePreview(false)}
                style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1 }}
              >×</button>
            </div>

            {/* Preview Card Body */}
            <div style={{ padding: '24px' }}>
              {/* Cover Image */}
              {formData.image ? (
                <div style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', background: '#1a1a24' }}>
                  <img
                    src={formData.image}
                    alt="cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div style={{ width: '100%', height: '140px', borderRadius: '12px', marginBottom: '20px', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3f3f46', fontSize: '0.82rem' }}>
                  <i className="fa-solid fa-image" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', opacity: 0.3 }}></i>
                </div>
              )}

              {/* Badges row */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {formData.type && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d4af37', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>{formData.type}</span>
                )}
                {formData.duration_days && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', padding: '3px 10px', borderRadius: '12px' }}>{formData.duration_days} Days</span>
                )}
                {formData.capacity && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', padding: '3px 10px', borderRadius: '12px' }}>Up to {formData.capacity} guests</span>
                )}
              </div>

              {/* Title & Location */}
              <h2 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.3 }}>
                {formData.name || <span style={{ color: '#3f3f46' }}>Package Title...</span>}
              </h2>
              <p style={{ color: '#71717a', fontSize: '0.8rem', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-location-dot" style={{ color: '#d4af37' }}></i>
                {formData.destination ? 'Selected Destination' : <span style={{ color: '#3f3f46' }}>Destination not set</span>}
              </p>

              {/* Description */}
              {formData.description && (
                <p style={{ color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.6, margin: '0 0 18px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {formData.description}
                </p>
              )}

              {/* Itinerary Days Preview */}
              {itinerary.length > 0 && (
                <div style={{ background: '#16161c', border: '1px solid #1f1f2a', borderRadius: '10px', padding: '14px', marginBottom: '18px' }}>
                  <p style={{ color: '#71717a', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', margin: '0 0 10px 0' }}>ITINERARY OVERVIEW</p>
                  {itinerary.slice(0, 4).map((day, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', whiteSpace: 'nowrap' }}>Day {day.day_number}</span>
                      <span style={{ color: '#e2e8f0', fontSize: '0.82rem' }}>{day.title || `Day ${day.day_number} program`} {day.activities?.length > 0 && <span style={{ color: '#71717a' }}>({day.activities.length} activities)</span>}</span>
                    </div>
                  ))}
                  {itinerary.length > 4 && <p style={{ color: '#52525b', fontSize: '0.75rem', margin: '6px 0 0 0' }}>+{itinerary.length - 4} more days...</p>}
                </div>
              )}

              {/* Price Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.04))', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px' }}>
                <div>
                  <p style={{ color: '#71717a', fontSize: '0.72rem', margin: '0 0 3px 0' }}>BASE PRICE FROM</p>
                  <strong style={{ color: '#d4af37', fontSize: '1.6rem', fontWeight: 800 }}>
                    {formData.base_price ? `$${Number(formData.base_price).toLocaleString()}` : <span style={{ color: '#3f3f46', fontSize: '1rem' }}>Price not set</span>}
                  </strong>
                </div>
                <div style={{ background: '#d4af37', color: '#000', padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, opacity: 0.8 }}>
                  <i className="fa-solid fa-rocket"></i> Book Now
                </div>
              </div>

              <p style={{ textAlign: 'center', color: '#3f3f46', fontSize: '0.72rem', marginTop: '16px' }}>This is a preview only — click Publish Package to make it live.</p>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes ppmSlideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes ppmScaleIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PublishPackageModal;
