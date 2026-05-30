/**
 * FILE: frontend/src/pages/Admin/CreateGuide.jsx
 *
 * PURPOSE:
 *   Full-page form for creating a new Packing / Adventure Guide.
 *   Navigated to from PackingGuidesAdmin when the "+ New Guide" button is clicked.
 *   On successful submission it automatically redirects back to /admin (packing-guides tab).
 *
 * DESIGN:
 *   Matches the existing "Aura Premium Dark Theme" used across the Admin Dashboard.
 *   All CSS variables (--bg-darker, --bg-card, --color-primary, etc.) are inherited
 *   from AdminDashboard.css which is already loaded when this page is rendered inside
 *   the Admin route tree.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { createPackingGuide, getDestinations, getTrips } from '../../utils/api';
import './AdminDashboard.css'; // Reuse the same premium dark-mode stylesheet

// ─────────────────────────────────────────────────────────────────────────────
// Inline styles that augment the shared stylesheet for page-level layout
// ─────────────────────────────────────────────────────────────────────────────
const pageStyles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-darker, #0f0f15)',
    color: 'var(--text-main, #e2e8f0)',
    fontFamily: "'Inter', sans-serif",
    paddingTop: '80px', // offset for fixed Navbar
  },
  container: {
    maxWidth: '820px',
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
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-light, rgba(255,255,255,0.05))',
    margin: '28px 0',
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
  hintText: {
    fontSize: '0.76rem',
    color: 'var(--text-dim, #64748b)',
    marginTop: '4px',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: parse a newline-separated string into an array of objects
// ─────────────────────────────────────────────────────────────────────────────
const parseLines = (str, mapper) =>
  str
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(mapper);

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const CreateGuide = () => {
  const navigate = useNavigate();

  // ── Remote data for dropdowns ──────────────────────────────────────────────
  const [destinations, setDestinations] = useState([]);
  const [experiences, setExperiences] = useState([]);

  // ── Form state ─────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '',
    activityType: 'general',
    experience: '',
    destination: '',
    difficultyLevel: 'moderate',
    physicalRequirements: '',
    // Multi-line text fields (parsed into arrays on submit)
    essentials: '',
    clothing: '',
    safetyTips: '',
  });

  // ── UI state ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // ── Load dropdown data on mount ────────────────────────────────────────────
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [dRes, eRes] = await Promise.all([getDestinations(), getTrips()]);
        if (dRes?.destinations) setDestinations(dRes.destinations);
        else if (Array.isArray(dRes)) setDestinations(dRes);

        if (eRes?.data) setExperiences(eRes.data);
        else if (Array.isArray(eRes)) setExperiences(eRes);
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      }
    };
    loadDropdowns();
  }, []);

  // ── Change handler ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Dynamic input/textarea focus styles ────────────────────────────────────
  const focusStyle = (field) =>
    focusedField === field
      ? {
          borderColor: 'var(--color-primary, #73749B)',
          boxShadow: '0 0 0 3px rgba(115,116,155,0.15)',
        }
      : {};

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      // Build the payload matching the backend Mongoose schema
      const payload = {
        name: form.name.trim(),
        activityType: form.activityType,
        experience: form.experience || null,
        destination: form.destination || null,
        difficultyLevel: form.difficultyLevel,
        physicalRequirements: form.physicalRequirements.trim(),
        // Parse multi-line textarea values into arrays of objects
        essentials: parseLines(form.essentials, (item) => ({ item, required: true })),
        clothing: parseLines(form.clothing, (item) => ({ item })),
        safetyTips: parseLines(form.safetyTips, (tip) => ({ tip, severity: 'warning' })),
      };

      await createPackingGuide(payload);

      setSuccessMsg(`Guide "${payload.name}" created successfully! Redirecting...`);

      // Redirect back to the Admin dashboard (packing-guides tab is active by default
      // when PackingGuidesAdmin refreshes). Short delay for UX.
      setTimeout(() => navigate('/admin', { state: { activeTab: 'packing-guides' } }), 1400);
    } catch (err) {
      console.error('Failed to create guide:', err);
      setErrorMsg(err?.message || 'An error occurred while saving the guide. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={pageStyles.wrapper} className="premium-admin-theme">
      <Navbar dashboardMode={true} />

      <div style={pageStyles.container}>

        {/* ── Breadcrumb ── */}
        <div style={pageStyles.breadcrumb} onClick={() => navigate('/admin')}>
          <i className="fa-solid fa-chevron-left" />
          <span>Admin Dashboard</span>
          <span style={{ color: 'var(--border-hover)' }}>/</span>
          <span style={pageStyles.breadcrumbActive}>Packing Guides</span>
          <span style={{ color: 'var(--border-hover)' }}>/</span>
          <span style={{ color: 'white', fontWeight: 600 }}>New Guide</span>
        </div>

        {/* ── Page heading ── */}
        <h1 style={pageStyles.pageTitle}>
          <i className="fa-solid fa-backpack" style={{ color: 'var(--color-accent, #8E6B92)', marginRight: '12px', fontSize: '1.6rem' }} />
          Create Packing Guide
        </h1>
        <p style={pageStyles.pageSubtitle}>
          Define a new packing or adventure guide. It will be matched automatically to experiences and destinations.
        </p>

        {/* ── Success / Error banners ── */}
        {successMsg && (
          <div style={pageStyles.successBanner}>
            <i className="fa-solid fa-circle-check" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={pageStyles.errorBanner}>
            <i className="fa-solid fa-circle-exclamation" />
            {errorMsg}
          </div>
        )}

        {/* ── Form card ── */}
        <div style={pageStyles.card}>
          <form onSubmit={handleSubmit} noValidate>

            {/* ── SECTION 1: Basic Info ── */}
            <p style={pageStyles.sectionTitle}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: '6px' }} />
              Basic Information
            </p>

            {/* Guide Name */}
            <div style={pageStyles.formGroup}>
              <label style={pageStyles.label} htmlFor="guide-name">
                Guide Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                id="guide-name"
                name="name"
                type="text"
                required
                placeholder="e.g. Sinai Hiking Adventure Guide"
                value={form.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                style={{ ...pageStyles.input, ...focusStyle('name') }}
              />
            </div>

            {/* Activity Type + Difficulty Level */}
            <div style={pageStyles.formGrid2}>
              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="activityType">
                  Activity Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  id="activityType"
                  name="activityType"
                  value={form.activityType}
                  onChange={handleChange}
                  style={pageStyles.select}
                >
                  <option value="general">🌍 General</option>
                  <option value="hiking">🥾 Hiking</option>
                  <option value="diving">🤿 Diving &amp; Snorkeling</option>
                  <option value="desert">🏜️ Desert Safari</option>
                  <option value="beach">🏖️ Beach &amp; Resort</option>
                  <option value="cultural">🏛️ Cultural</option>
                  <option value="adventure">🪂 Adventure</option>
                  <option value="wellness">🧘 Wellness</option>
                </select>
              </div>

              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="difficultyLevel">
                  Difficulty Level
                </label>
                <select
                  id="difficultyLevel"
                  name="difficultyLevel"
                  value={form.difficultyLevel}
                  onChange={handleChange}
                  style={pageStyles.select}
                >
                  <option value="easy">🟢 Easy</option>
                  <option value="moderate">🟡 Moderate</option>
                  <option value="challenging">🟠 Challenging</option>
                  <option value="expert">🔴 Expert</option>
                </select>
              </div>
            </div>

            <div style={pageStyles.divider} />

            {/* ── SECTION 2: Targeting ── */}
            <p style={pageStyles.sectionTitle}>
              <i className="fa-solid fa-crosshairs" style={{ marginRight: '6px' }} />
              Targeting (Optional)
            </p>
            <p style={{ ...pageStyles.hintText, marginBottom: '18px' }}>
              Leave both blank to create a generic guide matched by activity type only.
            </p>

            <div style={pageStyles.formGrid2}>
              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="experience">
                  Specific Experience
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  style={pageStyles.select}
                >
                  <option value="">— Apply to All Experiences —</option>
                  {experiences.map((exp) => (
                    <option key={exp._id} value={exp._id}>
                      {exp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={pageStyles.formGroup}>
                <label style={pageStyles.label} htmlFor="destination">
                  Specific Destination
                </label>
                <select
                  id="destination"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  style={pageStyles.select}
                >
                  <option value="">— Apply to All Destinations —</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Physical Requirements */}
            <div style={pageStyles.formGroup}>
              <label style={pageStyles.label} htmlFor="physicalRequirements">
                Physical Requirements
              </label>
              <input
                id="physicalRequirements"
                name="physicalRequirements"
                type="text"
                placeholder="e.g. Ability to walk 5 km on uneven terrain"
                value={form.physicalRequirements}
                onChange={handleChange}
                onFocus={() => setFocusedField('physReq')}
                onBlur={() => setFocusedField(null)}
                style={{ ...pageStyles.input, ...focusStyle('physReq') }}
              />
            </div>

            <div style={pageStyles.divider} />

            {/* ── SECTION 3: Packing List ── */}
            <p style={pageStyles.sectionTitle}>
              <i className="fa-solid fa-list-check" style={{ marginRight: '6px' }} />
              Packing List
            </p>

            {/* Essentials */}
            <div style={pageStyles.formGroup}>
              <label style={pageStyles.label} htmlFor="essentials">
                Essential Items
              </label>
              <textarea
                id="essentials"
                name="essentials"
                rows={4}
                placeholder={'Water bottle (2L minimum)\nSunscreen SPF 50+\nHat or headscarf\nFirst-aid kit'}
                value={form.essentials}
                onChange={handleChange}
                onFocus={() => setFocusedField('essentials')}
                onBlur={() => setFocusedField(null)}
                style={{ ...pageStyles.textarea, ...focusStyle('essentials') }}
              />
              <span style={pageStyles.hintText}>Enter one item per line. Each line becomes a required packing item.</span>
            </div>

            {/* Clothing */}
            <div style={pageStyles.formGroup}>
              <label style={pageStyles.label} htmlFor="clothing">
                Clothing &amp; Footwear
              </label>
              <textarea
                id="clothing"
                name="clothing"
                rows={3}
                placeholder={'Comfortable closed-toe shoes\nLight breathable jacket\nMoisture-wicking t-shirt'}
                value={form.clothing}
                onChange={handleChange}
                onFocus={() => setFocusedField('clothing')}
                onBlur={() => setFocusedField(null)}
                style={{ ...pageStyles.textarea, ...focusStyle('clothing') }}
              />
              <span style={pageStyles.hintText}>Enter one clothing item per line.</span>
            </div>

            <div style={pageStyles.divider} />

            {/* ── SECTION 4: Safety ── */}
            <p style={pageStyles.sectionTitle}>
              <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }} />
              Safety Protocols
            </p>

            {/* Safety Tips */}
            <div style={pageStyles.formGroup}>
              <label style={pageStyles.label} htmlFor="safetyTips">
                Safety Tips
              </label>
              <textarea
                id="safetyTips"
                name="safetyTips"
                rows={4}
                placeholder={'Stay hydrated — drink at least 3L of water per day\nNever leave the group without informing the guide\nCarry emergency contact numbers at all times'}
                value={form.safetyTips}
                onChange={handleChange}
                onFocus={() => setFocusedField('safetyTips')}
                onBlur={() => setFocusedField(null)}
                style={{ ...pageStyles.textarea, ...focusStyle('safetyTips') }}
              />
              <span style={pageStyles.hintText}>Enter one safety tip per line. Each is stored as a warning-level protocol.</span>
            </div>

            {/* ── Action buttons ── */}
            <div style={pageStyles.actionsRow}>
              <button
                type="button"
                style={pageStyles.cancelBtn}
                onClick={() => navigate('/admin')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted, #94a3b8)';
                  e.currentTarget.style.borderColor = 'var(--border-light, rgba(255,255,255,0.05))';
                }}
              >
                <i className="fa-solid fa-xmark" style={{ marginRight: '6px' }} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || !form.name.trim()}
                style={{
                  ...pageStyles.submitBtn,
                  ...(submitting || !form.name.trim() ? pageStyles.submitBtnDisabled : {}),
                }}
                onMouseEnter={(e) => {
                  if (!submitting && form.name.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.filter = 'none';
                }}
              >
                {submitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Saving Guide...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk" />
                    Save Guide
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGuide;
