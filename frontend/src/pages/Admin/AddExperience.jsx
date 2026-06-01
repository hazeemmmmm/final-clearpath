import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { createExperience, getDestinations, recommendSupervisors } from '../../utils/api';
import './AdminDashboard.css';

const pageStyles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-darker, #0f0f15)',
    color: 'var(--text-main, #e2e8f0)',
    fontFamily: "'Inter', sans-serif",
    paddingTop: '80px',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 24px 80px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.82rem',
    color: 'var(--text-dim, #64748b)',
    marginBottom: '30px',
    cursor: 'pointer',
  },
  breadcrumbActive: {
    color: 'var(--text-muted, #94a3b8)',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: '0.92rem',
    color: 'var(--text-muted, #94a3b8)',
    marginBottom: '36px',
  },
  card: {
    backgroundColor: 'var(--bg-card, #1b1b27)',
    border: '1px solid var(--border-light, rgba(255,255,255,0.05))',
    borderRadius: '16px',
    padding: '36px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-dim, #64748b)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border-light, rgba(255,255,255,0.05))',
  },
  formGrid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    fontSize: '0.82rem',
    fontWeight: 600,
    color: 'var(--text-muted, #94a3b8)',
  },
  input: {
    backgroundColor: 'var(--bg-darker, #0f0f15)',
    border: '1px solid var(--border-light, rgba(255,255,255,0.05))',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    backgroundColor: 'var(--bg-darker, #0f0f15)',
    border: '1px solid var(--border-light, rgba(255,255,255,0.05))',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  textarea: {
    backgroundColor: 'var(--bg-darker, #0f0f15)',
    border: '1px solid var(--border-light, rgba(255,255,255,0.05))',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box',
    lineHeight: '1.6',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  aiContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.03)',
    border: '1px dashed rgba(99, 102, 241, 0.25)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.3s ease',
  },
  aiTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  aiBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: '#1b1b27',
    border: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'all 0.25s',
  },
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '14px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-light, rgba(255,255,255,0.05))',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-light, rgba(255,255,255,0.05))',
    color: 'var(--text-muted, #94a3b8)',
    padding: '12px 24px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    border: 'none',
    color: '#fff',
    padding: '12px 32px',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 0 20px rgba(99,102,241,0.3)',
    transition: 'all 0.25s',
  },
  submitBtnDisabled: {
    background: '#2b2b3b',
    color: 'var(--text-dim, #64748b)',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(16,185,129,0.08)',
    border: '1px solid rgba(16,185,129,0.25)',
    color: '#10b981',
    borderRadius: '10px',
    padding: '14px 20px',
    marginBottom: '24px',
    fontSize: '0.88rem',
    fontWeight: 600,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#ef4444',
    borderRadius: '10px',
    padding: '14px 20px',
    marginBottom: '24px',
    fontSize: '0.88rem',
    fontWeight: 600,
  },
};

const AddExperience = () => {
  const navigate = useNavigate();
  
  // State variables
  const [destinations, setDestinations] = useState([]);
  const [recommendedSupervisors, setRecommendedSupervisors] = useState([]);
  const [fetchingRecommendation, setFetchingRecommendation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'Hiking', // Specialization e.g. Hiking, Diving, Safari
    destination: '',
    startDate: '',
    endDate: '',
    price: '',
    capacity: '10',
    supervisor: '', // Binds ObjectId of selected Supervisor
    description: ''
  });

  // Fetch destinations list for dropdown binding
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const res = await getDestinations();
        const list = res.destinations || res.data?.destinations || res.data || res || [];
        setDestinations(Array.isArray(list) ? list : []);
        if (list.length > 0) {
          setForm(prev => ({ ...prev, destination: list[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load destinations:', err);
      }
    };
    loadDestinations();
  }, []);

  // Smart Matching DSS Trigger - Runs dynamically when category, startDate or endDate changes
  useEffect(() => {
    const getRecommendations = async () => {
      if (!form.category || !form.startDate || !form.endDate) return;

      setFetchingRecommendation(true);
      try {
        const res = await recommendSupervisors({
          category: form.category,
          startDate: form.startDate,
          endDate: form.endDate
        });

        if (res && res.success && Array.isArray(res.data)) {
          setRecommendedSupervisors(res.data);
          // Auto-select the first supervisor if none selected yet
          if (res.data.length > 0 && !form.supervisor) {
            setForm(prev => ({ ...prev, supervisor: res.data[0]._id }));
          }
        } else {
          setRecommendedSupervisors([]);
        }
      } catch (err) {
        console.error('AI matching suggestion failed:', err);
        setRecommendedSupervisors([]);
      } finally {
        setFetchingRecommendation(false);
      }
    };

    getRecommendations();
  }, [form.category, form.startDate, form.endDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const focusStyle = (field) => focusedField === field ? {
    borderColor: '#6366f1',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
  } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setErrorMsg('Experience Name is required.');
    if (!form.destination) return setErrorMsg('Destination is required.');
    if (!form.startDate || !form.endDate) return setErrorMsg('Dates are required.');
    if (!form.price) return setErrorMsg('Price is required.');

    setSubmitting(true);
    setErrorMsg('');
    try {
      // Map base_price for backward compatibility
      const payload = {
        ...form,
        base_price: Number(form.price),
        capacity: Number(form.capacity)
      };
      await createExperience(payload);
      setSuccessMsg(`Experience "${form.name}" created successfully! Redirecting...`);
      setTimeout(() => navigate('/admin', { state: { activeTab: 'packages' } }), 1400);
    } catch (err) {
      console.error('Failed to create experience:', err);
      setErrorMsg(err?.message || 'An error occurred while saving the experience.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={pageStyles.wrapper} className="premium-admin-theme">
      <Navbar dashboardMode={true} />

      <div style={pageStyles.container}>
        <div style={pageStyles.breadcrumb} onClick={() => navigate('/admin', { state: { activeTab: 'packages' } })}>
          <i className="fa-solid fa-chevron-left" />
          <span>Admin Dashboard</span>
          <span style={{ color: 'var(--border-hover)' }}>/</span>
          <span style={pageStyles.breadcrumbActive}>Experiences</span>
          <span style={{ color: 'var(--border-hover)' }}>/</span>
          <span style={{ color: 'white', fontWeight: 600 }}>New Smart Experience</span>
        </div>

        <h1 style={pageStyles.pageTitle}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#a855f7', marginRight: '12px', fontSize: '1.6rem' }} />
          Create Smart Experience
        </h1>
        <p style={pageStyles.pageSubtitle}>
          Design a new adventure with dynamic AI-Powered Supervisor DSS Matching.
        </p>

        {successMsg && (
          <div style={pageStyles.successBanner}>
            <i className="fa-solid fa-circle-check" /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={pageStyles.errorBanner}>
            <i className="fa-solid fa-circle-exclamation" /> {errorMsg}
          </div>
        )}

        <div style={pageStyles.card}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div>
              <p style={pageStyles.sectionTitle}>
                <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }} />
                General Details
              </p>
              
              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="name">Experience Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  id="name" name="name" type="text" required
                  placeholder="e.g. Dahab Safari & Blue Hole Diving"
                  value={form.name} onChange={handleChange}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.input, ...focusStyle('name') }}
                />
              </div>
            </div>

            <div style={pageStyles.formGrid2}>
              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="category">Specialization / Category</label>
                <select
                  id="category" name="category"
                  value={form.category} onChange={handleChange}
                  onFocus={() => setFocusedField('category')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.select, ...focusStyle('category') }}
                >
                  <option value="Hiking">Hiking / هايكنج</option>
                  <option value="Diving">Diving / غطس</option>
                  <option value="Safari">Safari / سفاري</option>
                  <option value="Eco-Tour">Eco-Tour / رحلات بيئية</option>
                </select>
              </div>

              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="destination">Destination Link <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  id="destination" name="destination"
                  value={form.destination} onChange={handleChange}
                  onFocus={() => setFocusedField('destination')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.select, ...focusStyle('destination') }}
                >
                  {destinations.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.country})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={pageStyles.formGrid2}>
              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="startDate">Start Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  id="startDate" name="startDate" type="date" required
                  value={form.startDate} onChange={handleChange}
                  onFocus={() => setFocusedField('startDate')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.input, ...focusStyle('startDate') }}
                />
              </div>

              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="endDate">End Date <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  id="endDate" name="endDate" type="date" required
                  value={form.endDate} onChange={handleChange}
                  onFocus={() => setFocusedField('endDate')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.input, ...focusStyle('endDate') }}
                />
              </div>
            </div>

            {/* 🧠 Smart Matching DSS Supervisor Container */}
            <div style={pageStyles.aiContainer}>
              <span style={pageStyles.aiTitle}>
                <i className="fa-solid fa-brain" style={{ animation: 'pulse 2s infinite' }}></i>
                AI Supervisor Recommendation Engine (DSS)
              </span>
              
              {fetchingRecommendation ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#a1a1aa', fontSize: '0.85rem' }}>
                  <i className="fa-solid fa-spinner fa-spin" style={{ color: '#818cf8' }}></i>
                  Calculating supervisor workload and date overlaps...
                </div>
              ) : (!form.startDate || !form.endDate) ? (
                <div style={{ color: '#64748b', fontSize: '0.82rem', fontStyle: 'italic' }}>
                  <i className="fa-solid fa-calendar-day" style={{ marginRight: '6px' }}></i>
                  Please select Category, Start Date and End Date to check real-time availability.
                </div>
              ) : recommendedSupervisors.length === 0 ? (
                <div style={{ color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>
                  <i className="fa-solid fa-circle-xmark" style={{ marginRight: '6px' }}></i>
                  No available supervisors found for these dates & category.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    The following supervisors are qualified, free, and have <strong>NO calendar conflicts</strong>:
                  </span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recommendedSupervisors.map(sup => {
                      const isSelected = form.supervisor === sup._id;
                      return (
                        <div
                          key={sup._id}
                          onClick={() => setForm(prev => ({ ...prev, supervisor: sup._id }))}
                          style={{
                            ...pageStyles.aiBadge,
                            borderColor: isSelected ? '#818cf8' : 'rgba(255,255,255,0.05)',
                            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : '#121216',
                            boxShadow: isSelected ? '0 0 15px rgba(99, 102, 241, 0.15)' : 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-user-tie" style={{ color: isSelected ? '#818cf8' : '#64748b' }}></i>
                            <div>
                              <strong style={{ display: 'block', color: '#fff', fontSize: '0.88rem' }}>{sup.name}</strong>
                              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Specialty: {sup.specialization}</span>
                            </div>
                          </div>
                          
                          {isSelected ? (
                            <span style={{ color: '#818cf8', fontSize: '0.78rem', fontWeight: 700 }}>
                              <i className="fa-solid fa-circle-check"></i> SELECTED MATCH
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                              Click to Assign
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={pageStyles.formGrid2}>
              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="price">Total Price (EGP) <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  id="price" name="price" type="number" min="1" required
                  placeholder="e.g. 5000"
                  value={form.price} onChange={handleChange}
                  onFocus={() => setFocusedField('price')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.input, ...focusStyle('price') }}
                />
              </div>

              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="capacity">Max Capacity <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  id="capacity" name="capacity" type="number" min="1" required
                  placeholder="e.g. 15"
                  value={form.capacity} onChange={handleChange}
                  onFocus={() => setFocusedField('capacity')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.input, ...focusStyle('capacity') }}
                />
              </div>
            </div>

            <div style={pageStyles.formGroup}>
              <label style={pageStyles.label} htmlFor="description">Experience Description</label>
              <textarea
                id="description" name="description" rows={4}
                placeholder="Details of the itinerary, safety procedures, and special features..."
                value={form.description} onChange={handleChange}
                onFocus={() => setFocusedField('description')} onBlur={() => setFocusedField(null)}
                style={{ ...pageStyles.textarea, ...focusStyle('description') }}
              />
            </div>

            <div style={pageStyles.actionsRow}>
              <button
                type="button"
                style={pageStyles.cancelBtn}
                onClick={() => navigate('/admin', { state: { activeTab: 'packages' } })}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted, #94a3b8)'; e.currentTarget.style.borderColor = 'var(--border-light, rgba(255,255,255,0.05))'; }}
              >
                <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} /> Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !form.name.trim() || !form.startDate || !form.endDate}
                style={{ ...pageStyles.submitBtn, ...(submitting || !form.name.trim() || !form.startDate || !form.endDate ? pageStyles.submitBtnDisabled : {}) }}
                onMouseEnter={(e) => { if (!submitting && form.name.trim() && form.startDate && form.endDate) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}
              >
                {submitting ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> Save Smart Experience</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddExperience;
