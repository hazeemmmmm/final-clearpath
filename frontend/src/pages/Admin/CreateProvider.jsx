import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { createProvider } from '../../utils/api';
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
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
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

const CreateProvider = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', type: 'hotel', phone: '', email: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const focusStyle = (field) => focusedField === field ? {
    borderColor: 'var(--color-primary, #73749B)',
    boxShadow: '0 0 0 3px rgba(115,116,155,0.15)',
  } : {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setErrorMsg('Provider name is required.');
    
    setSubmitting(true);
    setErrorMsg('');
    try {
      await createProvider(form);
      setSuccessMsg(`Provider "${form.name}" created successfully! Redirecting...`);
      setTimeout(() => navigate('/admin', { state: { activeTab: 'providers' } }), 1400);
    } catch (err) {
      console.error('Failed to create provider:', err);
      setErrorMsg(err?.message || 'An error occurred while saving the provider.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={pageStyles.wrapper} className="premium-admin-theme">
      <Navbar dashboardMode={true} />

      <div style={pageStyles.container}>
        <div style={pageStyles.breadcrumb} onClick={() => navigate('/admin', { state: { activeTab: 'providers' } })}>
          <i className="fa-solid fa-chevron-left" />
          <span>Admin Dashboard</span>
          <span style={{ color: 'var(--border-hover)' }}>/</span>
          <span style={pageStyles.breadcrumbActive}>Providers</span>
          <span style={{ color: 'var(--border-hover)' }}>/</span>
          <span style={{ color: 'white', fontWeight: 600 }}>New Provider</span>
        </div>

        <h1 style={pageStyles.pageTitle}>
          <i className="fa-solid fa-handshake" style={{ color: 'var(--color-accent, #8E6B92)', marginRight: '12px', fontSize: '1.6rem' }} />
          Create Provider
        </h1>
        <p style={pageStyles.pageSubtitle}>
          Add a new service provider (Hotel, Transportation, Guide, etc.) to the platform.
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
              Basic Information
            </p>

            <div style={pageStyles.formGrid2}>
              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="name">Provider Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  id="name" name="name" type="text" required
                  placeholder="e.g. Hilton Resort"
                  value={form.name} onChange={handleChange}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.input, ...focusStyle('name') }}
                />
              </div>

              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="type">Provider Type</label>
                <select
                  id="type" name="type"
                  value={form.type} onChange={handleChange}
                  style={pageStyles.select}
                >
                  <option value="hotel">Hotel</option>
                  <option value="transportation">Transportation</option>
                  <option value="guide">Tour Guide</option>
                  <option value="activities">Activities</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={pageStyles.formGrid2}>
              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="email">Email</label>
                <input
                  id="email" name="email" type="email"
                  placeholder="e.g. contact@hilton.com"
                  value={form.email} onChange={handleChange}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.input, ...focusStyle('email') }}
                />
              </div>

              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="phone">Phone</label>
                <input
                  id="phone" name="phone" type="text"
                  placeholder="e.g. +201012345678"
                  value={form.phone} onChange={handleChange}
                  onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                  style={{ ...pageStyles.input, ...focusStyle('phone') }}
                />
              </div>
            </div>

            <div style={pageStyles.formGroup}>
              <label style={pageStyles.label} htmlFor="description">Description</label>
              <textarea
                id="description" name="description" rows={4}
                placeholder="A brief description of this provider..."
                value={form.description} onChange={handleChange}
                onFocus={() => setFocusedField('description')} onBlur={() => setFocusedField(null)}
                style={{ ...pageStyles.textarea, ...focusStyle('description') }}
              />
            </div>

            <div style={pageStyles.actionsRow}>
              <button
                type="button"
                style={pageStyles.cancelBtn}
                onClick={() => navigate('/admin', { state: { activeTab: 'providers' } })}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted, #94a3b8)'; e.currentTarget.style.borderColor = 'var(--border-light, rgba(255,255,255,0.05))'; }}
              >
                <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} /> Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !form.name.trim()}
                style={{ ...pageStyles.submitBtn, ...(submitting || !form.name.trim() ? pageStyles.submitBtnDisabled : {}) }}
                onMouseEnter={(e) => { if (!submitting && form.name.trim()) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.filter = 'brightness(1.1)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.filter = 'none'; }}
              >
                {submitting ? <><i className="fa-solid fa-spinner fa-spin" /> Saving...</> : <><i className="fa-solid fa-floppy-disk" /> Save Provider</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProvider;
