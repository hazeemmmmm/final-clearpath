import React, { useState, useEffect } from 'react';
import { getIntelligenceDashboard, flagUser, unflagUser, getPriceOptimization, applyPriceOptimization, autoAssignGuide } from '../../utils/api'; 

const AdminIntelligence = () => {
  const [data, setData] = useState({ demandAlerts: [], fraudAlerts: [], trustScores: [] });
  const [isDemo, setIsDemo] = useState(false);
  const [optModal, setOptModal] = useState({
    isOpen: false,
    experienceId: null,
    experienceName: '',
    loading: false,
    result: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getIntelligenceDashboard(isDemo);
        if (res && res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError("Failed to load intelligence data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isDemo]);

  const handleOpenOptimize = async (experienceId, experienceName) => {
    if (experienceId.toString().startsWith('demo-')) {
      setOptModal({
        isOpen: true,
        experienceId,
        experienceName,
        loading: false,
        result: {
          currentPrice: 3200,
          recommendedPrice: 2720,
          costBasis: 2400,
          seasonName: "Off-Peak Season / موسم ركود",
          seasonalityFactor: -0.10,
          capacityFactor: -0.05,
          competitorFactor: 0.04,
          reasoningAR: `تم احتساب السعر المقترح بقيمة $2720 (تخفيض ذكي بنسبة 15% تقريباً) بناءً على: موسم الحجز (موسم ركود بنسبة -10%)، سعة الرحلة (سعة كبار الأفراد بنسبة -5%) وهامش منافسين تنافسي (+4%). يهدف التخفيض لتنشيط المبيعات ورفع نسبة التحويل.`,
          reasoningEN: `Recommended price of $2720 (approx 15% off) calculated based on: Booking Season (Off-Peak -10%), Capacity factor (high capacity -5%), and Competitor benchmark margin (+4%). Focuses on boosting conversion rates.`
        }
      });
      return;
    }

    setOptModal({
      isOpen: true,
      experienceId,
      experienceName,
      loading: true,
      result: null
    });

    try {
      const res = await getPriceOptimization(experienceId);
      if (res && res.success) {
        setOptModal(prev => ({ ...prev, loading: false, result: res.data }));
      } else {
        setOptModal(prev => ({ ...prev, loading: false }));
        alert("Failed to load pricing recommendation.");
      }
    } catch (err) {
      console.error(err);
      setOptModal(prev => ({ ...prev, loading: false }));
      alert(err.message || "Failed to load pricing recommendation.");
    }
  };

  const handleApplyOptimize = async () => {
    if (!optModal.result || !optModal.experienceId) return;
    
    if (optModal.experienceId.toString().startsWith('demo-')) {
      setToast(`Applied optimized price of $${optModal.result.recommendedPrice} for simulated package.`);
      setOptModal(prev => ({ ...prev, isOpen: false }));
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const res = await applyPriceOptimization(optModal.experienceId, optModal.result.recommendedPrice);
      if (res && res.success) {
        setToast(`✅ Applied optimized price of $${optModal.result.recommendedPrice} successfully!`);
        setOptModal(prev => ({ ...prev, isOpen: false }));
        const refresh = await getIntelligenceDashboard(isDemo);
        if (refresh && refresh.success) setData(refresh.data);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to apply pricing.");
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAction = async (id, actionType, message, isFlagged = false) => {
    setProcessing(id);
    try {
      if (actionType === 'fraud') {
        let res;
        if (isFlagged) {
          res = await unflagUser(id);
        } else {
          res = await flagUser(id);
        }
        
        if (res && res.success) {
          setToast(`Success: ${message}`);
          const refresh = await getIntelligenceDashboard(isDemo);
          if (refresh && refresh.success) setData(refresh.data);
        }
      } else {
        if (actionType === 'demand') {
          if (id.toString().startsWith('demo-')) {
            setToast(`✅ Success: Guide Yasmine auto-assigned to simulated package.`);
          } else {
            const res = await autoAssignGuide(id);
            if (res && res.success) {
              setToast(`✅ Guide Yasmine successfully assigned!`);
            }
          }
          setData(prev => ({ ...prev, demandAlerts: prev.demandAlerts.filter(a => a.experienceId !== id) }));
        } else {
          setToast(`Success: ${message}`);
        }
      }
    } catch (err) {
      console.error("Moderation action failed:", err);
      setToast(`Error: ${err.message || 'Action failed'}`);
    } finally {
      setProcessing(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="intel-loading-screen">
        <div className="intel-spinner-container">
          <i className="fa-solid fa-brain fa-3x intel-brain-icon"></i>
          <div className="intel-spinner"></div>
        </div>
        <h3>Initializing Neural Engine...</h3>
        <p>Running diagnostic algorithms and processing real-time metrics.</p>
        <style>{`
          .intel-loading-screen {
            background-color: #0b0b0e;
            color: #ffffff;
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Poppins', sans-serif;
          }
          .intel-spinner-container {
            position: relative;
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
          }
          .intel-brain-icon {
            color: #d5b266;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
          }
          .intel-spinner {
            position: absolute;
            inset: 0;
            border: 4px solid rgba(213, 178, 102, 0.1);
            border-top: 4px solid #d5b266;
            border-radius: 50%;
            animation: intel-spin 1.2s linear infinite;
          }
          .intel-loading-screen h3 {
            margin: 10px 0;
            font-weight: 600;
            color: #ffffff;
          }
          .intel-loading-screen p {
            color: #71717a;
            font-size: 0.9rem;
          }
          @keyframes intel-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="intel-error-container">
        <i className="fa-solid fa-circle-exclamation fa-2x"></i>
        <span>{error}</span>
        <style>{`
          .intel-error-container {
            margin: 20px;
            padding: 20px;
            border-radius: 12px;
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #ef4444;
            display: flex;
            align-items: center;
            gap: 15px;
            font-family: 'Poppins', sans-serif;
          }
        `}</style>
      </div>
    );
  }

  const filteredAlerts = (data.demandAlerts || []).filter(alert => 
    alert.experienceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nextAlert = () => {
    if (filteredAlerts.length <= 1) return;
    setCarouselIndex(prev => (prev + 1) % filteredAlerts.length);
  };

  const prevAlert = () => {
    if (filteredAlerts.length <= 1) return;
    setCarouselIndex(prev => (prev - 1 + filteredAlerts.length) % filteredAlerts.length);
  };

  const handleSelectAlert = (e) => {
    const selectedId = e.target.value;
    const foundIndex = filteredAlerts.findIndex(a => String(a.experienceId) === String(selectedId));
    if (foundIndex !== -1) {
      setCarouselIndex(foundIndex);
    }
  };

  // Filter out invalid or empty/inactive providers
  const activeTrustScores = (data.trustScores || []).filter(
    p => p.providerName && p.providerName !== 'undefined' && p.providerName.trim() !== ''
  );

  if (loading) {
    return (
      <div className="intel-loading-screen">
        <div className="intel-spinner-container">
          <i className="fa-solid fa-brain fa-3x intel-brain-icon"></i>
          <div className="intel-spinner"></div>
        </div>
        <h3>Initializing Neural Engine...</h3>
        <p>Running diagnostic algorithms and processing real-time metrics.</p>
        <style>{`
          .intel-loading-screen {
            background-color: #0b0b0e;
            color: #ffffff;
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Poppins', sans-serif;
          }
          .intel-spinner-container {
            position: relative;
            width: 80px;
            height: 80px;
            margin-bottom: 20px;
          }
          .intel-brain-icon {
            color: #d5b266;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
          }
          .intel-spinner {
            position: absolute;
            inset: 0;
            border: 4px solid rgba(213, 178, 102, 0.1);
            border-top: 4px solid #d5b266;
            border-radius: 50%;
            animation: intel-spin 1.2s linear infinite;
          }
          .intel-loading-screen h3 {
            margin: 10px 0;
            font-weight: 600;
            color: #ffffff;
          }
          .intel-loading-screen p {
            color: #71717a;
            font-size: 0.9rem;
          }
          @keyframes intel-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="intel-error-container">
        <i className="fa-solid fa-circle-exclamation fa-2x"></i>
        <span>{error}</span>
        <style>{`
          .intel-error-container {
            margin: 20px;
            padding: 20px;
            border-radius: 12px;
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #ef4444;
            display: flex;
            align-items: center;
            gap: 15px;
            font-family: 'Poppins', sans-serif;
          }
        `}</style>
      </div>
    );
  }

  const activeAlert = filteredAlerts[carouselIndex];

  return (
    <div className="intel-dashboard-theme">
      {/* Toast Notification */}
      {toast && (
        <div className="intel-toast">
          <i className="fa-solid fa-circle-check"></i>
          <span>{toast}</span>
        </div>
      )}

      {/* Centered Top Header Section (Presentation controls removed) */}
      <div className="intel-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px', gap: '12px', borderBottom: '1px solid #1c1c24', paddingBottom: '30px' }}>
        <div className="intel-title-icon-box" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(213, 178, 102, 0.1)', border: '1px solid rgba(213, 178, 102, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#d5b266', marginBottom: '8px' }}>
          <i className="fa-solid fa-chart-line"></i>
        </div>
        <div className="intel-title-texts" style={{ alignItems: 'center' }}>
          <div className="intel-title-row" style={{ justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>AI Demand Forecasting</h2>
            <span className="intel-pill-badge" style={{ fontSize: '0.8rem', padding: '4px 14px' }}>Q3 2026 PROJECTIONS</span>
          </div>
          <span className="intel-subtitle" style={{ fontSize: '0.8rem', color: '#d5b266', letterSpacing: '3px', marginTop: '8px', display: 'block' }}>
            STRATEGIC DECISION-SUPPORT SYSTEM (DSS)
          </span>
        </div>
        
        <p className="intel-description" style={{ margin: '15px auto 0 auto', textAlign: 'center', fontSize: '1rem', color: '#a1a1aa', maxWidth: '750px', lineHeight: '1.6' }}>
          Predictive analysis engine combining historical booking data, wishlist velocity trends, and real-time page views to forecast destination demand for the upcoming luxury season.
        </p>

        {/* Presentation/Demo toggle button - centered & styled premium */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', padding: '6px 14px', borderRadius: '25px', cursor: 'pointer', transition: 'all 0.3s', marginTop: '10px' }} onClick={() => { setIsDemo(!isDemo); setCarouselIndex(0); }}>
          <i className={`fa-solid ${isDemo ? 'fa-toggle-on' : 'fa-toggle-off'}`} style={{ color: '#d4af37', fontSize: '1.4rem' }}></i>
          <span style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '600' }}>
            {isDemo ? 'Academic Demo Mode: Active / وضع العرض الأكاديمي: نشط' : 'Presentation Mode / وضع العرض الأكاديمي'}
          </span>
        </div>
      </div>

      {/* 1) Prominent Centered AI Demand Forecasting Component */}
      <div className="intel-centered-focus-container" style={{ maxWidth: '1000px', margin: '0 auto 40px auto', width: '100%' }}>
        <div className="intel-card intel-chart-card" style={{ border: '1px solid rgba(213, 178, 102, 0.25)', boxShadow: '0 15px 50px rgba(0, 0, 0, 0.5)', background: 'linear-gradient(135deg, #111115, #0c0c0f)' }}>
          <div className="intel-card-header">
            <div className="intel-card-header-left">
              <h3 style={{ fontSize: '1.4rem' }}>Projected Booking Volume</h3>
              <span className="intel-card-subtitle">SUMMER SEASON (MAY – AUGUST 2026)</span>
            </div>
            <div className="intel-chart-legend">
              <div className="intel-legend-item">
                <span className="legend-dot dot-gray"></span>
                <span>Base Trend</span>
              </div>
              <div className="intel-legend-item">
                <span className="legend-dot dot-gold"></span>
                <span>AI Projected Surge</span>
              </div>
            </div>
          </div>

          {/* SVG Vector Chart Area */}
          <div className="intel-svg-wrapper" style={{ marginTop: '15px' }}>
            <svg viewBox="0 0 520 220" className="intel-svg-chart">
              <defs>
                <linearGradient id="intelGoldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d5b266" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d5b266" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Horizontal grid guide lines */}
              <line x1="10" y1="160" x2="510" y2="160" stroke="#1f1f2a" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="110" x2="510" y2="110" stroke="#1f1f2a" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="60" x2="510" y2="60" stroke="#1f1f2a" strokeWidth="1" strokeDasharray="3 3" />
              
              {/* Base Trend Line (Champagne Gold Dotted) */}
              <path d="M 30 160 Q 150 145, 270 135 T 490 120" fill="none" stroke="#d5b266" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
              
              {/* AI Surge Gradient Area */}
              <path d="M 30 160 Q 150 140, 270 115 T 490 30 L 490 200 L 30 200 Z" fill="url(#intelGoldGrad)" />
              
              {/* AI Surge Solid Line */}
              <path d="M 30 160 Q 150 140, 270 115 T 490 30" fill="none" stroke="#d5b266" strokeWidth="3" />

              {/* Data points */}
              <circle cx="270" cy="115" r="5" fill="#0d0d10" stroke="#d5b266" strokeWidth="3" />
              <circle cx="490" cy="30" r="5" fill="#d5b266" stroke="#d5b266" strokeWidth="2" />
              
              {/* X-Axis Labels */}
              <text x="30" y="200" fill="#71717a" className="intel-axis-text" textAnchor="middle">MAY (ACTUAL)</text>
              <text x="175" y="200" fill="#71717a" className="intel-axis-text" textAnchor="middle">JUNE 2026</text>
              <text x="325" y="200" fill="#71717a" className="intel-axis-text" textAnchor="middle">JULY 2026</text>
              <text x="475" y="200" fill="#71717a" className="intel-axis-text" textAnchor="middle">AUGUST 2026</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Core Grid System for secondary details */}
      <div className="intel-grid-container">
        
        {/* Right Grid Card: Fraud Anomaly & Account Security */}
        <div className="intel-card intel-security-card" style={{ gridColumn: '1 / -1', border: '1px solid rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.01)' }}>
          <div className="intel-card-header" style={{ marginBottom: '18px' }}>
            <div className="intel-card-title-block">
              <div className="intel-card-icon-box box-red" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                <i className="fa-solid fa-shield-halved" style={{ animation: 'pulse 3s infinite' }}></i>
              </div>
              <div className="intel-card-header-texts">
                <h3>Fraud Anomaly & Security</h3>
                <span className="intel-card-subtitle" style={{ color: '#ef4444', fontWeight: 600 }}>Real-time user behavioral tracking</span>
              </div>
            </div>
            <span className="intel-threat-pill" style={{ backgroundColor: '#ef4444', color: '#fff', padding: '4px 12px', fontWeight: 700 }}>
              {data.fraudAlerts.length} ANOMALIES
            </span>
          </div>

          <div className="intel-threats-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
            {data.fraudAlerts.map((alert, idx) => (
              <div key={idx} className="intel-threat-item" style={{ borderLeft: `4px solid ${alert.isFlagged ? '#22c55e' : '#ef4444'}`, backgroundColor: '#131318', border: '1px solid #1c1c24', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div className="intel-threat-header-row" style={{ margin: 0 }}>
                  <span className="intel-threat-name" style={{ color: '#fff', fontSize: '0.88rem', fontWeight: 700 }}>
                    <i className="fa-solid fa-user-shield" style={{ color: alert.isFlagged ? '#22c55e' : '#ef4444' }}></i> 
                    {alert.userName.replace(" (Simulated Alert)", "")}
                  </span>
                  <span className="intel-risk-badge" style={{ background: alert.isFlagged ? '#22c55e' : '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                    {alert.isFlagged ? "BLOCKED" : "HIGH RISK"}
                  </span>
                </div>
                <p className="intel-threat-desc" style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0, minHeight: '38px', lineHeight: '1.5' }}>{alert.message}</p>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <button 
                    onClick={() => handleAction(alert.userId, 'fraud', alert.isFlagged ? `${alert.userName} Restrictions Lifted` : `${alert.userName} Account Flagged`, alert.isFlagged)}
                    disabled={processing === alert.userId}
                    className="intel-btn-solid"
                    style={{ 
                      flexGrow: 1, 
                      padding: '8px 12px', 
                      fontSize: '0.78rem',
                      background: alert.isFlagged ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)', 
                      color: '#fff',
                      boxShadow: 'none'
                    }}
                  >
                    {processing === alert.userId ? (
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                      <i className={alert.isFlagged ? "fa-solid fa-user-check" : "fa-solid fa-user-slash"}></i>
                    )}
                    <span>{alert.isFlagged ? "Unblock Account" : "Block User"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full-Width Row: Provider Trust Matrix (Dynamic DB Integration) */}
        <div className="intel-card intel-full-width-card" style={{ gridColumn: '1 / -1' }}>
          <div className="intel-card-header" style={{ marginBottom: '18px' }}>
            <div className="intel-card-title-block">
              <div className="intel-card-icon-box box-gold">
                <i className="fa-solid fa-star-half-stroke"></i>
              </div>
              <div className="intel-card-header-texts">
                <h3>Provider Trust & Performance Matrix</h3>
                <span className="intel-card-subtitle">Automated rating indexes calculated from live customer booking scores</span>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#d5b266', fontWeight: 'bold' }}>
              {activeTrustScores.length} ACTIVE PARTNERS
            </span>
          </div>

          {activeTrustScores.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#71717a', padding: '40px', fontSize: '0.9rem' }}>
              <i className="fa-solid fa-handshake-slash" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px', opacity: 0.3 }}></i>
              No active certified providers found in database.
            </div>
          ) : (
            <div className="intel-providers-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
              {activeTrustScores.map((provider, idx) => {
                const isPremium = provider.trustScore >= 80;
                const initials = provider.providerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                
                return (
                  <div key={idx} className="intel-provider-row" style={{ margin: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                    <div className="intel-provider-left">
                      <div className={`intel-provider-avatar-badge ${isPremium ? 'avatar-gold' : 'avatar-red'}`}>
                        {initials}
                      </div>
                      <div className="intel-provider-meta">
                        <h4 style={{ margin: '0 0 3px 0', fontSize: '0.9rem' }}>{provider.providerName}</h4>
                        <span className={`intel-tier-text ${isPremium ? 'text-gold' : 'text-red'}`} style={{ fontSize: '0.62rem' }}>
                          {isPremium && <i className="fa-solid fa-crown" style={{ marginRight: '3px' }}></i>} 
                          {provider.tier.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Circular SVG Progress Gauge */}
                    <div className="intel-gauge-wrapper">
                      <svg viewBox="0 0 36 36" className="intel-gauge-svg">
                        <path 
                          className="intel-gauge-bg" 
                          strokeWidth="3" 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        />
                        <path 
                          className={`intel-gauge-value ${isPremium ? 'gauge-gold' : 'gauge-red'}`}
                          strokeWidth="3" 
                          strokeDasharray={`${provider.trustScore}, 100`} 
                          strokeLinecap="round" 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                        />
                      </svg>
                      <div className="intel-gauge-text" style={{ fontSize: '0.78rem' }}>{provider.trustScore}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 🧠 AI Pricing Optimization Modal */}
      {optModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Poppins, sans-serif' }} onClick={() => setOptModal(prev => ({ ...prev, isOpen: false }))}>
          <div style={{ background: '#111115', border: '2px solid #d5b266', borderRadius: '16px', padding: '30px', width: '550px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', boxShadow: '0 20px 50px rgba(213, 178, 102, 0.15)' }} onClick={e => e.stopPropagation()}>
            
            <button onClick={() => setOptModal(prev => ({ ...prev, isOpen: false }))} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1d1d25', paddingBottom: '15px' }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#d5b266', fontSize: '1.6rem' }}></i>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>AI Price Optimization Engine</h3>
                <span style={{ color: '#d5b266', fontSize: '0.8rem', fontWeight: 'bold' }}>REAL-TIME COST &amp; DEMAND ANALYSIS</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <strong style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>EXPERIENCE PACKAGE:</strong>
              <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{optModal.experienceName}</span>
            </div>

            {optModal.loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '15px' }}>
                <i className="fa-solid fa-brain fa-spin fa-2x" style={{ color: '#d5b266' }}></i>
                <span style={{ color: '#a1a1aa' }}>Running rule-based demand calculations...</span>
              </div>
            ) : optModal.result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Price Comparisons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ background: '#16161c', padding: '15px', borderRadius: '10px', border: '1px solid #1d1d25' }}>
                    <span style={{ display: 'block', color: '#71717a', fontSize: '0.8rem', marginBottom: '5px' }}>CURRENT TOTAL PRICE (EGP)</span>
                    <strong style={{ fontSize: '1.4rem', color: '#ef4444' }}>EGP {optModal.result.currentPrice}</strong>
                  </div>
                  <div style={{ background: 'rgba(213,178,102,0.06)', padding: '15px', borderRadius: '10px', border: '1px solid #d5b266' }}>
                    <span style={{ display: 'block', color: '#d5b266', fontSize: '0.8rem', marginBottom: '5px' }}>RECOMMENDED PRICE (EGP)</span>
                    <strong style={{ fontSize: '1.4rem', color: '#22c55e' }}>EGP {optModal.result.recommendedPrice}</strong>
                  </div>
                </div>

                {/* Factors Details */}
                <div style={{ background: '#16161c', padding: '15px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717a' }}>Cost Basis (Activities + Breakdown):</span>
                    <strong style={{ color: '#fff' }}>EGP {optModal.result.costBasis}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717a' }}>Season factor ({optModal.result.seasonName}):</span>
                    <strong style={{ color: optModal.result.seasonalityFactor >= 0 ? '#22c55e' : '#ef4444' }}>
                      {optModal.result.seasonalityFactor >= 0 ? '+' : ''}{Math.round(optModal.result.seasonalityFactor * 100)}%
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717a' }}>Capacity size markup:</span>
                    <strong style={{ color: optModal.result.capacityFactor >= 0 ? '#22c55e' : '#ef4444' }}>
                      {optModal.result.capacityFactor >= 0 ? '+' : ''}{Math.round(optModal.result.capacityFactor * 100)}%
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#71717a' }}>Competitor benchmark margin:</span>
                    <strong style={{ color: '#22c55e' }}>+{Math.round(optModal.result.competitorFactor * 100)}%</strong>
                  </div>
                </div>

                {/* Reasoning boxes */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid #1d1d25', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  <p style={{ margin: 0, color: '#d5b266', fontStyle: 'italic' }}>{optModal.result.reasoningAR}</p>
                  <div style={{ height: '1px', background: '#1d1d25' }}></div>
                  <p style={{ margin: 0, color: '#a1a1aa' }}>{optModal.result.reasoningEN}</p>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button onClick={() => setOptModal(prev => ({ ...prev, isOpen: false }))} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#fff', border: '1px solid #1d1d25', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel / إلغاء</button>
                  <button onClick={handleApplyOptimize} style={{ flex: 2, padding: '12px', background: '#d5b266', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-check"></i> Apply Optimal Price / تطبيق السعر المقترح
                  </button>
                </div>

              </div>
            ) : (
              <span style={{ color: '#ef4444' }}>Error: Pricing recommendations could not be fetched.</span>
            )}

          </div>
        </div>
      )}

      {/* Styled Isolation Block */}
      <style>{`
        .intel-dashboard-theme {
          background-color: #0c0c0f;
          color: #ffffff;
          font-family: 'Poppins', 'Inter', sans-serif;
          min-height: 100vh;
          padding: 24px;
        }

        /* Toast Styling */
        .intel-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          background-color: #d5b266;
          color: #000000;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(213, 178, 102, 0.2);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          animation: intel-slide-in 0.3s ease-out forwards;
        }

        /* Header Layout */
        .intel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 1px solid #1c1c24;
          padding-bottom: 20px;
        }
        .intel-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .intel-title-icon-box {
          width: 44px;
          height: 44px;
          background-color: rgba(213, 178, 102, 0.1);
          border: 1px solid rgba(213, 178, 102, 0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d5b266;
          font-size: 1.25rem;
        }
        .intel-title-texts {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .intel-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .intel-title-texts h2 {
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
        }
        .intel-pill-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: #d5b266;
          border: 1px solid #d5b266;
          padding: 3px 10px;
          border-radius: 12px;
          letter-spacing: 0.5px;
        }
        .intel-subtitle {
          font-size: 0.68rem;
          font-weight: 700;
          color: #a1a1aa;
          letter-spacing: 2px;
        }

        /* Top controls */
        .intel-header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .intel-icon-btn {
          width: 40px;
          height: 40px;
          border: 1px solid #1c1c24;
          background-color: #121216;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a1a1aa;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .intel-icon-btn:hover {
          color: #ffffff;
          border-color: #d5b266;
        }
        .intel-badge-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 6px;
          height: 6px;
          background-color: #d5b266;
          border-radius: 50%;
        }
        .intel-user-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #1c1c24;
          background-color: #121216;
          padding: 4px 6px 4px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #e4e4e7;
          cursor: pointer;
        }
        .intel-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        /* Description */
        .intel-description {
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 0 32px 0;
        }

        .intel-grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Cards Base */
        .intel-card {
          background-color: #111115;
          border: 1px solid #1d1d25;
          border-radius: 16px;
          padding: 24px;
          position: relative;
        }
        .intel-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .intel-card-header-left h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 6px 0;
          color: #ffffff;
        }
        .intel-card-subtitle {
          font-size: 0.72rem;
          font-weight: 700;
          color: #71717a;
          letter-spacing: 1.5px;
        }

        /* Legend */
        .intel-chart-legend {
          display: flex;
          gap: 20px;
        }
        .intel-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #a1a1aa;
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dot-gray { background-color: rgba(213, 178, 102, 0.4); }
        .dot-gold { background-color: #d5b266; }

        /* SVG Graph styling */
        .intel-svg-wrapper {
          width: 100%;
          margin-top: 10px;
        }
        .intel-svg-chart {
          width: 100%;
          overflow: visible;
        }
        .intel-axis-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        /* Action list card */
        .intel-actions-card {
          display: flex;
          flex-direction: column;
        }
        .intel-actions-header {
          font-size: 0.85rem;
          font-weight: 700;
          color: #d5b266;
          letter-spacing: 1.5px;
          margin: 0 0 24px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .intel-actions-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .intel-action-item {
          background-color: #16161c;
          border: 1px solid #20202a;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .intel-item-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .intel-action-item h4 {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0;
          color: #ffffff;
        }
        .intel-status-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .intel-badge-warning {
          background-color: rgba(213, 178, 102, 0.12);
          color: #d5b266;
          border: 1px solid rgba(213, 178, 102, 0.2);
        }
        .intel-badge-opportunity {
          background-color: rgba(239, 68, 68, 0.12);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .intel-item-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }

        /* Buttons styling */
        .intel-btn-solid {
          background-color: #d5b266;
          color: #000000;
          border: none;
          padding: 10px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .intel-btn-solid:hover {
          background-color: #c49e54;
        }
        .intel-btn-outline {
          background-color: transparent;
          border: 1px solid #d5b266;
          color: #d5b266;
          padding: 10px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .intel-btn-outline:hover {
          background-color: rgba(213, 178, 102, 0.05);
        }
        .intel-btn-symbol {
          font-size: 1rem;
          line-height: 1;
        }

        /* Bottom Row Cards */
        .intel-half-card {
          grid-column: span 1;
          margin-top: 8px;
        }
        .intel-card-title-block {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .intel-card-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        .box-red {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        .box-gold {
          background-color: rgba(213, 178, 102, 0.1);
          border: 1px solid rgba(213, 178, 102, 0.2);
          color: #d5b266;
        }
        .intel-card-header-texts h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 0 0 2px 0;
          color: #ffffff;
        }

        /* Threat Pill badge */
        .intel-threat-pill {
          background-color: rgba(239, 68, 68, 0.15);
          color: #f87171;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 4px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          letter-spacing: 0.5px;
        }

        /* Threat items list styling */
        .intel-threats-list {
          margin-top: 24px;
        }
        .intel-threat-item {
          background-color: #16161c;
          border: 1px solid rgba(239, 68, 68, 0.12);
          border-left: 4px solid #ef4444;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .intel-threat-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .intel-threat-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .intel-risk-badge {
          background-color: #ef4444;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .intel-threat-desc {
          font-size: 0.85rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }
        .intel-btn-dark {
          background-color: #27272a;
          color: #e4e4e7;
          border: 1px solid #3f3f46;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .intel-btn-dark:hover {
          background-color: #18181b;
          border-color: #52525b;
        }

        /* Providers list styling */
        .intel-providers-list {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .intel-provider-row {
          background-color: #16161c;
          border: 1px solid #20202a;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.2s;
        }
        .intel-provider-row:hover {
          transform: translateY(-2px);
        }
        .intel-provider-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .intel-provider-avatar-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .avatar-gold {
          background-color: rgba(213, 178, 102, 0.1);
          color: #d5b266;
          border: 1px solid rgba(213, 178, 102, 0.2);
        }
        .avatar-red {
          background-color: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .intel-provider-meta h4 {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: #ffffff;
        }
        .intel-tier-text {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .text-gold { color: #d5b266; }
        .text-red { color: #f87171; }

        /* Trust Circle Progress HUD */
        .intel-gauge-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
        }
        .intel-gauge-svg {
          width: 100%;
          height: 100%;
        }
        .intel-gauge-bg {
          fill: none;
          stroke: #1f1f2a;
        }
        .intel-gauge-value {
          fill: none;
        }
        .gauge-gold { stroke: #d5b266; }
        .gauge-red { stroke: #ef4444; }
        .intel-gauge-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
        }

        /* Slide-in animation for toast */
        @keyframes intel-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Responsive Layout collapse */
        @media (max-width: 1024px) {
          .intel-grid-container {
            grid-template-columns: 1fr;
          }
          .intel-half-card {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminIntelligence;
