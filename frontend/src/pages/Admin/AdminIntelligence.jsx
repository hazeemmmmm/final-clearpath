import React, { useState, useEffect } from 'react';
import { getIntelligenceDashboard } from '../../utils/api'; 
import './AdminDashboard.css';

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
    // Simulate API call for the action
    setTimeout(() => {
      setProcessing(null);
      setToast(`Success: ${message}`);
      
      // Remove from list to simulate it was handled
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
      <div className="intel-loading-screen" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ai-pulse-ring" style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '20px' }}>
          <i className="fa-solid fa-brain fa-3x" style={{ color: '#d4af37', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}></i>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid rgba(212, 175, 55, 0.3)', borderRadius: '50%', borderTopColor: '#d4af37', animation: 'spin 1.5s linear infinite' }}></div>
        </div>
        <h3 style={{ color: '#0f172a', fontWeight: '700' }}>Initializing Neural Engine...</h3>
        <p style={{ color: '#64748b' }}>Running diagnostic algorithms and processing real-time metrics.</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error" style={{ margin: '20px', padding: '20px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>{error}</div>;
  }

  return (
    <div className="intelligence-hub-premium" style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif", position: 'relative' }}>
      
      {/* Interactive Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#22c55e', color: '#fff', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(34,197,94,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideIn 0.3s ease-out' }}>
          <i className="fa-solid fa-circle-check"></i>
          <strong style={{ fontSize: '0.95rem' }}>{toast}</strong>
        </div>
      )}

      {/* Header */}
      <div className="intel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))', padding: '6px 16px', borderRadius: '20px', color: '#b48600', fontWeight: '700', fontSize: '0.85rem', marginBottom: '15px' }}>
            <span style={{ width: '8px', height: '8px', background: '#d4af37', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #d4af37', animation: 'pulse 2s infinite' }}></span>
            AI Engine Online
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>Intelligence Hub</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0, maxWidth: '600px' }}>
            Advanced behavioral analytics, demand forecasting, and real-time security monitoring powered by ClearPath AI.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0 0 5px 0' }}>Last Sync</p>
          <strong style={{ color: '#0f172a', fontFamily: 'monospace', fontSize: '1.2rem' }}>{new Date().toLocaleTimeString()}</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px' }}>
        
        {/* 1. Demand Forecasting (AI-Powered) */}
        <div className="intel-card premium" style={{ background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', gridColumn: '1 / -1' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #d4af37, #14b8a6)' }}></div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 5px 0' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(20,184,166,0.15))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
                  <i className="fa-solid fa-chart-area" style={{ fontSize: '1.2rem' }}></i>
                </div>
                AI Demand Forecasting
                <span style={{ fontSize: '0.75rem', background: '#14b8a6', color: '#fff', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>Q3 2026 Projections</span>
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Predictive analysis combining historical bookings, wishlist trends, and page views.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {/* SVG Chart Area */}
            <div style={{ flex: '1 1 500px', background: '#f8fafc', borderRadius: '16px', padding: '20px', position: 'relative', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 20px 0', color: '#334155', fontSize: '1.1rem' }}>Projected Booking Volume (Summer 2026)</h4>
              <div style={{ position: 'relative', width: '100%', height: '220px' }}>
                <svg viewBox="0 0 500 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#d4af37" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="turqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 50, 100, 150].map((y) => (
                    <g key={y}>
                      <line x1="40" y1={y} x2="480" y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                      <text x="30" y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="end">{(150 - y) * 2}</text>
                    </g>
                  ))}
                  
                  {/* Base Data (Turquoise) */}
                  <path d="M 50 150 L 50 120 C 150 100, 250 140, 350 80 C 420 50, 480 30, 480 30 L 480 150 Z" fill="url(#turqGrad)" className="chart-path-turq" />
                  <path d="M 50 120 C 150 100, 250 140, 350 80 C 420 50, 480 30, 480 30" fill="none" stroke="#14b8a6" strokeWidth="3" className="chart-line-turq" />
                  
                  {/* Forecast Data (Gold) */}
                  <path d="M 50 150 L 50 100 C 150 60, 250 110, 350 40 C 420 10, 480 0, 480 0 L 480 150 Z" fill="url(#goldGrad)" className="chart-path-gold" />
                  <path d="M 50 100 C 150 60, 250 110, 350 40 C 420 10, 480 0, 480 0" fill="none" stroke="#d4af37" strokeWidth="4" strokeDasharray="8 4" className="chart-line-gold" />
                  
                  {/* X-Axis Labels */}
                  <text x="50" y="170" fill="#64748b" fontSize="12" fontWeight="bold">May (Actual)</text>
                  <text x="190" y="170" fill="#64748b" fontSize="12" fontWeight="bold">June 2026</text>
                  <text x="330" y="170" fill="#64748b" fontSize="12" fontWeight="bold">July 2026</text>
                  <text x="460" y="170" fill="#64748b" fontSize="12" fontWeight="bold">August 2026</text>

                  {/* Interactive Points */}
                  <circle cx="190" cy="85" r="6" fill="#fff" stroke="#d4af37" strokeWidth="3" className="chart-point" />
                  <circle cx="330" cy="60" r="6" fill="#fff" stroke="#d4af37" strokeWidth="3" className="chart-point" />
                  <circle cx="480" cy="0" r="6" fill="#fff" stroke="#d4af37" strokeWidth="3" className="chart-point" />
                </svg>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '15px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#14b8a6' }}></div> Base Trend
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#475569' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#d4af37' }}></div> AI Projected Surge
                </div>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#d4af37' }}></i> Automated Actions
              </h4>
              
              <div className="action-card" style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(to right, rgba(20, 184, 166, 0.05), transparent)', borderLeft: '4px solid #14b8a6', border: '1px solid rgba(20,184,166,0.1)', borderLeftWidth: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '1rem' }}>Mohra Hiking Package</strong>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', background: '#ef4444', padding: '2px 8px', borderRadius: '10px' }}>Critical Capacity</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 15px 0', lineHeight: '1.5' }}>Projected 95% capacity by mid-July. Current guide ratio is extremely low (1:40).</p>
                <button 
                  onClick={() => handleAction('mohra-id', 'demand', 'Assigned Yasmine (Top Guide) to Mohra')}
                  disabled={processing === 'mohra-id'}
                  style={{ background: '#14b8a6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: processing === 'mohra-id' ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: '600', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: processing === 'mohra-id' ? 0.7 : 1 }}
                  className="btn-hover-glow"
                >
                  {processing === 'mohra-id' ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-user-plus"></i>} Auto-Assign Guide Yasmine
                </button>
              </div>

              <div className="action-card" style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(to right, rgba(212, 175, 55, 0.05), transparent)', borderLeft: '4px solid #d4af37', border: '1px solid rgba(212,175,55,0.1)', borderLeftWidth: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: '#0f172a', fontSize: '1rem' }}>Siwa Oasis Retreat</strong>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#b48600', background: '#fef3c7', padding: '2px 8px', borderRadius: '10px' }}>Conversion Drop</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 15px 0', lineHeight: '1.5' }}>High views & wishlists but low bookings. Price sensitivity detected for August.</p>
                <button 
                  onClick={() => handleAction('siwa-id', 'demand', 'Generated and applied 15% Smart Discount')}
                  disabled={processing === 'siwa-id'}
                  style={{ background: '#d4af37', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: processing === 'siwa-id' ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: '700', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'all 0.2s', opacity: processing === 'siwa-id' ? 0.7 : 1 }}
                  className="btn-hover-glow-gold"
                >
                  {processing === 'siwa-id' ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-percent"></i>} Deploy Smart 15% Discount
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* 2. Fraud & Scam Risk */}
        <div className="intel-card premium" style={{ background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #ef4444, #f87171)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '25px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 5px 0' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <i className="fa-solid fa-shield-virus"></i>
                </div>
                Fraud & Scam Detection
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Behavioral anomaly and risk monitoring.</p>
            </div>
            <div style={{ background: data.fraudAlerts.length > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: data.fraudAlerts.length > 0 ? '#ef4444' : '#22c55e', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {data.fraudAlerts.length > 0 ? `${data.fraudAlerts.length} Threats` : 'Secure'}
            </div>
          </div>
          
          <div className="intel-list">
            {data.fraudAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
                <i className="fa-solid fa-shield-check fa-3x" style={{ color: '#22c55e', marginBottom: '15px' }}></i>
                <p>System integrity is at 100%. No malicious patterns detected.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {data.fraudAlerts.map((alert, idx) => (
                  <div key={idx} style={{ padding: '20px', borderRadius: '12px', background: 'linear-gradient(to right, rgba(239,68,68,0.05), transparent)', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#0f172a', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-user-slash" style={{ color: '#ef4444' }}></i> {alert.userName}</strong>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#fff', background: '#ef4444', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{alert.severity} RISK</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 15px 0', lineHeight: '1.5' }}>{alert.message}</p>
                    <button 
                      onClick={() => handleAction(alert.userId, 'fraud', `${alert.userName} Account Suspended`)}
                      disabled={processing === alert.userId}
                      style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: processing === alert.userId ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontWeight: '600', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: processing === alert.userId ? 0.7 : 1 }}>
                      {processing === alert.userId ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-gavel"></i>} {alert.actionRecommended}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Trust Scoring */}
        <div className="intel-card premium" style={{ background: '#fff', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', gridColumn: '1 / -1' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #d4af37, #fcd34d)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 5px 0' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
                  <i className="fa-solid fa-star-half-stroke"></i>
                </div>
                Provider Trust Matrix
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Automated quality assurance and rating index.</p>
            </div>
          </div>
          
          <div className="trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {data.trustScores.length === 0 ? (
              <p style={{ color: '#94a3b8', textAlign: 'center', width: '100%' }}>Awaiting provider reviews to generate matrices.</p>
            ) : (
              data.trustScores.map((provider, idx) => {
                const isPremium = provider.trustScore >= 80;
                const isVerified = provider.trustScore >= 60 && provider.trustScore < 80;
                const strokeColor = isPremium ? '#22c55e' : (isVerified ? '#3b82f6' : '#ef4444');
                const bgColor = isPremium ? 'rgba(34,197,94,0.05)' : (isVerified ? 'rgba(59,130,246,0.05)' : 'rgba(239,68,68,0.05)');
                
                return (
                  <div key={idx} style={{ padding: '20px', borderRadius: '16px', background: '#f8fafc', border: `1px solid ${bgColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                        {provider.providerName.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#0f172a', fontSize: '1.05rem', marginBottom: '2px' }}>{provider.providerName}</strong>
                        <span style={{ fontSize: '0.8rem', color: strokeColor, fontWeight: '700', background: bgColor, padding: '2px 8px', borderRadius: '10px' }}>
                          {isPremium && <i className="fa-solid fa-crown" style={{ marginRight: '4px' }}></i>}
                          {provider.tier}
                        </span>
                      </div>
                    </div>
                    
                    {/* Circular Progress Gauge */}
                    <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                        <path stroke="#e2e8f0" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path stroke={strokeColor} strokeWidth="3" strokeDasharray={`${provider.trustScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ animation: 'dash 1.5s ease-out forwards' }} />
                      </svg>
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                        {provider.trustScore}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes dash { 0% { stroke-dasharray: 0, 100; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
        .chart-path-turq { transition: all 0.5s ease; }
        .chart-path-gold { transition: all 0.5s ease; }
        .chart-path-gold:hover { opacity: 0.8; cursor: crosshair; }
        .chart-point { transition: all 0.3s ease; }
        .chart-point:hover { r: 10; stroke-width: 4; filter: drop-shadow(0 0 8px #d4af37); cursor: pointer; }
        .btn-hover-glow:hover { box-shadow: 0 0 15px rgba(20, 184, 166, 0.5); transform: translateY(-2px); }
        .btn-hover-glow-gold:hover { box-shadow: 0 0 15px rgba(212, 175, 55, 0.5); transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

export default AdminIntelligence;
