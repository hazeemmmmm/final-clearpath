import React, { useState, useEffect } from 'react';
import { getIntelligenceDashboard } from '../../utils/api'; 

const AdminIntelligence = () => {
  const [data, setData] = useState({ demandAlerts: [], fraudAlerts: [], trustScores: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getIntelligenceDashboard();
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
  }, []);

  const handleAction = (id, actionType, message) => {
    setProcessing(id);
    setTimeout(() => {
      setProcessing(null);
      setToast(`Success: ${message}`);
      
      if (actionType === 'demand') {
        setData(prev => ({ ...prev, demandAlerts: prev.demandAlerts.filter(a => a.experienceId !== id) }));
      } else if (actionType === 'fraud') {
        setData(prev => ({ ...prev, fraudAlerts: prev.fraudAlerts.filter(a => a.userId !== id) }));
      }
      
      setTimeout(() => setToast(null), 3000);
    }, 1200);
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

  return (
    <div className="intel-dashboard-theme">
      {/* Toast Notification */}
      {toast && (
        <div className="intel-toast">
          <i className="fa-solid fa-circle-check"></i>
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="intel-header">
        <div className="intel-header-left">
          <div className="intel-title-icon-box">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="intel-title-texts">
            <div className="intel-title-row">
              <h2>AI Demand Forecasting</h2>
              <span className="intel-pill-badge">Q3 2026 PROJECTIONS</span>
            </div>
            <span className="intel-subtitle">STRATEGIC PREDICTIVE ANALYSIS</span>
          </div>
        </div>
        
        <div className="intel-header-right">
          <div className="intel-icon-btn">
            <i className="fa-regular fa-bell"></i>
            <span className="intel-badge-dot"></span>
          </div>
          <div className="intel-icon-btn">
            <i className="fa-solid fa-sliders"></i>
          </div>
          <div className="intel-user-badge">
            <span>Manage Account</span>
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
              alt="User profile" 
              className="intel-user-avatar"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="intel-description">
        Predictive analysis engine combining historical booking data, wishlist velocity trends, and real-time page views to forecast destination demand for the upcoming luxury season.
      </p>

      {/* Core Grid System */}
      <div className="intel-grid-container">
        
        {/* Left Side: Projected Booking Volume Graph */}
        <div className="intel-card intel-chart-card">
          <div className="intel-card-header">
            <div className="intel-card-header-left">
              <h3>Projected Booking Volume</h3>
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
          <div className="intel-svg-wrapper">
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

        {/* Right Side: Automated Actions List */}
        <div className="intel-card intel-actions-card">
          <h3 className="intel-actions-header">
            <i className="fa-solid fa-wand-magic-sparkles"></i> AUTOMATED ACTIONS
          </h3>
          
          <div className="intel-actions-list">
            {data.demandAlerts.map((alert, idx) => {
              const isWarning = alert.type === "High Demand";
              const badgeClass = isWarning ? "intel-badge-warning" : "intel-badge-opportunity";
              
              return (
                <div key={idx} className="intel-action-item">
                  <div className="intel-item-title-row">
                    <h4>{alert.experienceName.replace(" (Simulated)", "")}</h4>
                    <span className={`intel-status-badge ${badgeClass}`}>
                      {isWarning ? "HIGH DEMAND" : "CONVERSION DROP"}
                    </span>
                  </div>
                  <p className="intel-item-desc">{alert.message}</p>
                  
                  {isWarning ? (
                    <button 
                      onClick={() => handleAction(alert.experienceId, 'demand', `Action performed for ${alert.experienceName}`)}
                      disabled={processing === alert.experienceId}
                      className="intel-btn-solid"
                    >
                      {processing === alert.experienceId ? (
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                      ) : (
                        <i className="fa-solid fa-user-plus"></i>
                      )}
                      <span>{alert.actionRecommended}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction(alert.experienceId, 'demand', `Action performed for ${alert.experienceName}`)}
                      disabled={processing === alert.experienceId}
                      className="intel-btn-outline"
                    >
                      {processing === alert.experienceId ? (
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                      ) : (
                        <span className="intel-btn-symbol">%</span>
                      )}
                      <span>{alert.actionRecommended}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Left Card: Fraud & Scam Risk */}
        <div className="intel-card intel-half-card">
          <div className="intel-card-header">
            <div className="intel-card-title-block">
              <div className="intel-card-icon-box box-red">
                <i className="fa-solid fa-shield-virus"></i>
              </div>
              <div className="intel-card-header-texts">
                <h3>Fraud & Scam Detection</h3>
                <span className="intel-card-subtitle">Behavioral anomaly and risk monitoring.</span>
              </div>
            </div>
            <span className="intel-threat-pill">1 THREAT DETECTED</span>
          </div>

          <div className="intel-threats-list">
            {data.fraudAlerts.map((alert, idx) => (
              <div key={idx} className="intel-threat-item">
                <div className="intel-threat-header-row">
                  <span className="intel-threat-name">
                    <i className="fa-solid fa-user-slash"></i> {alert.userName.replace(" (Simulated Alert)", "")}
                  </span>
                  <span className="intel-risk-badge">HIGH RISK</span>
                </div>
                <p className="intel-threat-desc">{alert.message}</p>
                <button 
                  onClick={() => handleAction(alert.userId, 'fraud', `${alert.userName} Account Suspended`)}
                  disabled={processing === alert.userId}
                  className="intel-btn-dark"
                >
                  {processing === alert.userId ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-gavel"></i>
                  )}
                  <span>{alert.actionRecommended}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Right Card: Provider Trust Matrix */}
        <div className="intel-card intel-half-card">
          <div className="intel-card-title-block">
            <div className="intel-card-icon-box box-gold">
              <i className="fa-solid fa-star-half-stroke"></i>
            </div>
            <div className="intel-card-header-texts">
              <h3>Provider Trust Matrix</h3>
              <span className="intel-card-subtitle">Automated quality assurance rating index.</span>
            </div>
          </div>

          <div className="intel-providers-list">
            {data.trustScores.map((provider, idx) => {
              const isPremium = provider.trustScore >= 80;
              const initials = provider.providerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              
              return (
                <div key={idx} className="intel-provider-row">
                  <div className="intel-provider-left">
                    <div className={`intel-provider-avatar-badge ${isPremium ? 'avatar-gold' : 'avatar-red'}`}>
                      {initials}
                    </div>
                    <div className="intel-provider-meta">
                      <h4>{provider.providerName}</h4>
                      <span className={`intel-tier-text ${isPremium ? 'text-gold' : 'text-red'}`}>
                        {isPremium && <i className="fa-solid fa-crown"></i>} {provider.tier.toUpperCase()}
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
                    <div className="intel-gauge-text">{provider.trustScore}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

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

        /* Grid */
        .intel-grid-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
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
