import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { getDestinations, getProviders, createActivity, updateActivity } from '../../utils/api';
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
    maxWidth: '700px',
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
  },
  sectionTitle: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--text-dim, #64748b)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '18px',
    paddingBottom: '10px',
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
    marginBottom: '20px',
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
    cursor: 'pointer'
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
  actionsRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '14px',
    marginTop: '32px',
    paddingTop: '24px',
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
    background: 'linear-gradient(135deg, var(--color-primary, #73749B), var(--color-accent, #8E6B92))',
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
    boxShadow: '0 0 20px rgba(142,107,146,0.3)',
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

const CreateActivity = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // populated if in EDIT mode
  
  const [schemaFields, setSchemaFields] = useState([]);
  const [destinationsList, setDestinationsList] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // Fetch active dependencies
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const dests = await getDestinations();
        const dList = dests.destinations || dests.data?.destinations || dests.data || dests || [];
        setDestinationsList(Array.isArray(dList) ? dList : []);

        const provs = await getProviders();
        const pList = provs.providers || provs.data?.providers || provs.data || provs || [];
        setProvidersList(Array.isArray(pList) ? pList : []);
      } catch (err) {
        console.error('Failed to load form dependencies:', err);
      }
    };
    fetchDependencies();
  }, []);

  // Fetch dynamic schema and pre-populate if in edit mode
  useEffect(() => {
    const loadSchemaAndData = async () => {
      try {
        const schemaRes = await axios.get('http://localhost:3000/activity/schema');
        if (schemaRes.data?.success && Array.isArray(schemaRes.data.data)) {
          setSchemaFields(schemaRes.data.data);

          let activityData = null;
          if (id) {
            // Edit Mode: fetch the single activity details
            const singleRes = await axios.get(`http://localhost:3000/activity/${id}`);
            activityData = singleRes.data?.data || singleRes.data || null;
          }

          const initialForm = {};
          schemaRes.data.data.forEach(field => {
            if (activityData) {
              let val = activityData[field.name];
              if (val && typeof val === 'object' && val._id) {
                val = val._id; // Extract ObjectId ref
              }
              initialForm[field.name] = val !== undefined ? val : (field.instance === 'Boolean' ? true : '');
            } else {
              initialForm[field.name] = field.instance === 'Boolean' ? true : '';
            }
          });
          setFormData(initialForm);
        }
      } catch (err) {
        console.error('Failed to initialize dynamic form:', err);
        setErrorMsg('Failed to initialize the dynamic form schema.');
      }
    };
    loadSchemaAndData();
  }, [id]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const focusStyle = (field) => focusedField === field ? {
    borderColor: 'var(--color-primary, #73749B)',
    boxShadow: '0 0 0 3px rgba(115,116,155,0.15)',
  } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (id) {
        // Edit Mode
        await updateActivity(id, formData);
        setSuccessMsg(`Activity updated successfully! Redirecting...`);
      } else {
        // Create Mode
        await createActivity(formData);
        setSuccessMsg(`Activity "${formData.name || 'New Activity'}" created successfully! Redirecting...`);
      }
      setTimeout(() => navigate('/admin', { state: { activeTab: 'activities' } }), 1400);
    } catch (err) {
      console.error('Failed to save activity:', err);
      setErrorMsg(err.response?.data?.message || err?.message || 'An error occurred while saving the activity.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={pageStyles.wrapper} className="premium-admin-theme">
      <Navbar dashboardMode={true} />

      <div style={pageStyles.container}>
        <div style={pageStyles.breadcrumb} onClick={() => navigate('/admin', { state: { activeTab: 'activities' } })}>
          <i className="fa-solid fa-chevron-left" />
          <span>Admin Dashboard</span>
          <span style={{ color: 'var(--border-hover)' }}>/</span>
          <span style={pageStyles.breadcrumbActive}>Activities</span>
          <span style={{ color: 'var(--border-hover)' }}>/</span>
          <span style={{ color: 'white', fontWeight: 600 }}>{id ? 'Edit Activity' : 'New Activity'}</span>
        </div>

        <h1 style={pageStyles.pageTitle}>
          <i className="fa-solid fa-person-running" style={{ color: 'var(--color-accent, #8E6B92)', marginRight: '12px', fontSize: '1.6rem' }} />
          {id ? 'Edit Activity' : 'Create Activity'}
        </h1>
        <p style={pageStyles.pageSubtitle}>
          {id ? 'Modify an existing activity and save updates.' : 'Add a new dynamic activity program to the platform.'}
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
          <form onSubmit={handleSubmit} noValidate>
            <p style={pageStyles.sectionTitle}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }} />
              Dynamic Activity Fields
            </p>

            {schemaFields.map(field => {
              const isRequired = field.required;

              // 1. Boolean field (Checkbox / Toggle)
              if (field.instance === 'Boolean') {
                return (
                  <div key={field.name} style={{ ...pageStyles.formGroup, flexDirection: 'row', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input
                      type="checkbox"
                      id={`field-${field.name}`}
                      checked={!!formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      style={{ width: '20px', height: '20px', accentColor: '#73749B', cursor: 'pointer' }}
                    />
                    <label htmlFor={`field-${field.name}`} style={{ ...pageStyles.label, cursor: 'pointer', textTransform: 'capitalize', margin: 0 }}>
                      {field.name.replace(/([A-Z])/g, ' $1')} {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                  </div>
                );
              }

              // 2. Select Dropdown for Enums
              if (field.enumValues && field.enumValues.length > 0) {
                return (
                  <div key={field.name} style={pageStyles.formGroup}>
                    <label style={pageStyles.label} htmlFor={`field-${field.name}`}>
                      {field.name.replace(/([A-Z])/g, ' $1').toUpperCase()} {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <select
                      id={`field-${field.name}`}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                      style={{ ...pageStyles.select, ...focusStyle(field.name) }}
                      required={isRequired}
                    >
                      <option value="">-- Select {field.name} --</option>
                      {field.enumValues.map(val => (
                        <option key={val} value={val}>{val.replace('_', ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // 3. Dynamic Reference dropdowns (Destination, Provider)
              if (field.ref) {
                const options = field.ref === 'Destination' ? destinationsList : field.ref === 'Provider' ? providersList : [];
                return (
                  <div key={field.name} style={pageStyles.formGroup}>
                    <label style={pageStyles.label} htmlFor={`field-${field.name}`}>
                      {field.name.toUpperCase()} ({field.ref}) {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <select
                      id={`field-${field.name}`}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      onFocus={() => setFocusedField(field.name)}
                      onBlur={() => setFocusedField(null)}
                      style={{ ...pageStyles.select, ...focusStyle(field.name) }}
                      required={isRequired}
                    >
                      <option value="">-- Select {field.ref} --</option>
                      {options.map(opt => (
                        <option key={opt._id} value={opt._id}>{opt.name || opt.firstName || opt.title || opt._id}</option>
                      ))}
                    </select>
                  </div>
                );
              }

              // 4. Default Input fields (String / Number)
              const inputType = field.instance === 'Number' ? 'number' : 'text';
              return (
                <div key={field.name} style={pageStyles.formGroup}>
                  <label style={pageStyles.label} htmlFor={`field-${field.name}`}>
                    {field.name.replace(/([A-Z])/g, ' $1').toUpperCase()} {isRequired && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <input
                    id={`field-${field.name}`}
                    type={inputType}
                    value={formData[field.name] !== undefined ? formData[field.name] : ''}
                    onChange={(e) => handleChange(field.name, field.instance === 'Number' ? Number(e.target.value) : e.target.value)}
                    onFocus={() => setFocusedField(field.name)}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...pageStyles.input, ...focusStyle(field.name) }}
                    required={isRequired}
                    placeholder={`Enter ${field.name}`}
                    min={field.instance === 'Number' ? 0 : undefined}
                  />
                </div>
              );
            })}

            <div style={pageStyles.actionsRow}>
              <button
                type="button"
                style={pageStyles.cancelBtn}
                onClick={() => navigate('/admin', { state: { activeTab: 'activities' } })}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted, #94a3b8)'; e.currentTarget.style.borderColor = 'var(--border-light, rgba(255,255,255,0.05))'; }}
              >
                <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} /> Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ ...pageStyles.submitBtn, ...(submitting ? pageStyles.submitBtnDisabled : {}) }}
                onMouseEnter={(e) => { if (!submitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}
              >
                {submitting ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> {id ? 'Save Changes' : 'Save Activity'}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;
