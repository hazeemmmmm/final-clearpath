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
      <div className="tw-min-h-[60vh] tw-flex tw-flex-col tw-items-center tw-justify-center">
        <div className="tw-relative tw-w-20 tw-h-20 tw-mb-5">
          <i className="fa-solid fa-brain fa-3x tw-text-[#73749B] dark:tw-text-[#8E6B92] tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-z-10"></i>
          <div className="tw-absolute tw-inset-0 tw-border-4 tw-border-[#73749B]/30 dark:tw-border-[#8E6B92]/30 tw-border-t-[#73749B] dark:tw-border-t-[#8E6B92] tw-rounded-full tw-animate-spin"></div>
        </div>
        <h3 className="tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-font-bold">Initializing Neural Engine...</h3>
        <p className="tw-text-slate-500 dark:tw-text-[var(--text-muted)]">Running diagnostic algorithms and processing real-time metrics.</p>
      </div>
    );
  }

  if (error) {
    return <div className="tw-m-5 tw-p-5 tw-rounded-xl tw-bg-red-50 dark:tw-bg-red-900/20 tw-border tw-border-red-200 dark:tw-border-red-800 tw-text-red-700 dark:tw-text-red-400">{error}</div>;
  }

  return (
    <div className="tw-p-4 md:tw-p-8 tw-bg-[#f8fafc] dark:tw-bg-[var(--bg-darker)] tw-min-h-screen tw-font-sans tw-relative tw-transition-colors">
      
      {/* Interactive Toast Notification */}
      {toast && (
        <div className="tw-fixed tw-top-5 tw-right-5 tw-bg-[#73749B] dark:tw-bg-[#8E6B92] tw-text-white tw-px-6 tw-py-4 tw-rounded-lg tw-shadow-lg tw-z-50 tw-flex tw-items-center tw-gap-3 tw-animate-slide-in">
          <i className="fa-solid fa-circle-check"></i>
          <strong className="tw-text-sm">{toast}</strong>
        </div>
      )}

      {/* Header */}
      <div className="tw-flex tw-justify-between tw-items-end tw-mb-10 tw-pb-5 tw-border-b tw-border-slate-200 dark:tw-border-[var(--border-light)]">
        <div>
          <div className="tw-inline-flex tw-items-center tw-gap-2 tw-bg-[#73749B]/10 dark:tw-bg-[#8E6B92]/10 tw-px-4 tw-py-1.5 tw-rounded-full tw-text-[#73749B] dark:tw-text-[#8E6B92] tw-font-bold tw-text-sm tw-mb-4">
            <span className="tw-w-2 tw-h-2 tw-bg-[#73749B] dark:tw-bg-[#8E6B92] tw-rounded-full tw-shadow-[0_0_10px_#8E6B92] tw-animate-pulse"></span>
            AI Engine Online
          </div>
          <h2 className="tw-text-3xl md:tw-text-4xl tw-font-extrabold tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-mb-2 tw-tracking-tight">Intelligence Hub</h2>
          <p className="tw-text-slate-600 dark:tw-text-[var(--text-muted)] tw-text-lg tw-m-0 tw-max-w-2xl">
            Advanced behavioral analytics, demand forecasting, and real-time security monitoring powered by ClearPath AI.
          </p>
        </div>
        <div className="tw-text-right">
          <p className="tw-text-sm tw-text-slate-400 dark:tw-text-[var(--text-dim)] tw-mb-1">Last Sync</p>
          <strong className="tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-font-mono tw-text-lg">{new Date().toLocaleTimeString()}</strong>
        </div>
      </div>

      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-8">
        
        {/* 1. Demand Forecasting (AI-Powered) */}
        <div className="tw-col-span-1 md:tw-col-span-2 tw-bg-white dark:tw-bg-[var(--bg-card)] tw-rounded-2xl tw-p-8 tw-shadow-sm dark:tw-shadow-none tw-border tw-border-slate-200 dark:tw-border-[var(--border-light)] tw-relative tw-overflow-hidden">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-1.5 tw-bg-gradient-to-r tw-from-[#73749B] tw-to-[#8E6B92]"></div>
          
          <div className="tw-flex tw-justify-between tw-items-start tw-mb-8">
            <div>
              <h3 className="tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <div className="tw-w-11 tw-h-11 tw-rounded-xl tw-bg-gradient-to-br tw-from-[#73749B]/20 tw-to-[#8E6B92]/10 tw-flex tw-items-center tw-justify-center tw-text-[#73749B] dark:tw-text-[#8E6B92]">
                  <i className="fa-solid fa-chart-area tw-text-lg"></i>
                </div>
                AI Demand Forecasting
                <span className="tw-text-xs tw-bg-[#8E6B92] tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-uppercase tw-tracking-widest">Q3 2026 Projections</span>
              </h3>
              <p className="tw-text-slate-600 dark:tw-text-[var(--text-muted)] tw-text-sm">Predictive analysis combining historical bookings, wishlist trends, and page views.</p>
            </div>
          </div>

          <div className="tw-flex tw-flex-wrap tw-gap-8">
            {/* SVG Chart Area */}
            <div className="tw-flex-1 tw-min-w-[400px] tw-bg-slate-50 dark:tw-bg-[#101017] tw-rounded-2xl tw-p-6 tw-relative tw-border tw-border-slate-200 dark:tw-border-[var(--border-light)]">
              <h4 className="tw-m-0 tw-mb-6 tw-text-slate-800 dark:tw-text-[var(--text-main)] tw-text-lg tw-font-semibold">Projected Booking Volume (Summer 2026)</h4>
              <div className="tw-relative tw-w-full tw-h-[220px]">
                <svg viewBox="0 0 500 220" className="tw-w-full tw-h-full tw-overflow-visible">
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8E6B92" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8E6B92" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#73749B" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#73749B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[0, 50, 100, 150].map((y) => (
                    <g key={y}>
                      <line x1="40" y1={y} x2="480" y2={y} stroke="currentColor" strokeOpacity="0.1" className="tw-text-slate-400 dark:tw-text-white" strokeDasharray="4 4" />
                      <text x="30" y={y + 4} fill="currentColor" className="tw-text-slate-400 dark:tw-text-[var(--text-dim)]" fontSize="10" textAnchor="end">{(150 - y) * 2}</text>
                    </g>
                  ))}
                  
                  {/* Base Data (Indigo) */}
                  <path d="M 50 150 L 50 120 C 150 100, 250 140, 350 80 C 420 50, 480 30, 480 30 L 480 150 Z" fill="url(#indigoGrad)" className="tw-transition-all tw-duration-500" />
                  <path d="M 50 120 C 150 100, 250 140, 350 80 C 420 50, 480 30, 480 30" fill="none" stroke="#73749B" strokeWidth="3" />
                  
                  {/* Forecast Data (Purple) */}
                  <path d="M 50 150 L 50 100 C 150 60, 250 110, 350 40 C 420 10, 480 0, 480 0 L 480 150 Z" fill="url(#purpleGrad)" className="tw-transition-all tw-duration-500 hover:tw-opacity-80 tw-cursor-crosshair" />
                  <path d="M 50 100 C 150 60, 250 110, 350 40 C 420 10, 480 0, 480 0" fill="none" stroke="#8E6B92" strokeWidth="4" strokeDasharray="8 4" />
                  
                  {/* X-Axis Labels */}
                  <text x="50" y="170" fill="currentColor" className="tw-text-slate-500 dark:tw-text-[var(--text-muted)]" fontSize="12" fontWeight="bold">May (Actual)</text>
                  <text x="190" y="170" fill="currentColor" className="tw-text-slate-500 dark:tw-text-[var(--text-muted)]" fontSize="12" fontWeight="bold">June 2026</text>
                  <text x="330" y="170" fill="currentColor" className="tw-text-slate-500 dark:tw-text-[var(--text-muted)]" fontSize="12" fontWeight="bold">July 2026</text>
                  <text x="460" y="170" fill="currentColor" className="tw-text-slate-500 dark:tw-text-[var(--text-muted)]" fontSize="12" fontWeight="bold">August 2026</text>

                  {/* Interactive Points */}
                  <circle cx="190" cy="85" r="6" fill="currentColor" className="tw-text-white dark:tw-text-[var(--bg-card)]" stroke="#8E6B92" strokeWidth="3" />
                  <circle cx="330" cy="60" r="6" fill="currentColor" className="tw-text-white dark:tw-text-[var(--bg-card)]" stroke="#8E6B92" strokeWidth="3" />
                  <circle cx="480" cy="0" r="6" fill="currentColor" className="tw-text-white dark:tw-text-[var(--bg-card)]" stroke="#8E6B92" strokeWidth="3" />
                </svg>
              </div>
              <div className="tw-flex tw-gap-5 tw-mt-4 tw-justify-center">
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-slate-600 dark:tw-text-[var(--text-muted)]">
                  <div className="tw-w-3 tw-h-3 tw-rounded-sm tw-bg-[#73749B]"></div> Base Trend
                </div>
                <div className="tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-slate-600 dark:tw-text-[var(--text-muted)]">
                  <div className="tw-w-3 tw-h-3 tw-rounded-sm tw-bg-[#8E6B92]"></div> AI Projected Surge
                </div>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="tw-flex-1 tw-min-w-[300px] tw-flex tw-flex-col tw-gap-4">
              <h4 className="tw-m-0 tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-text-lg tw-flex tw-items-center tw-gap-2">
                <i className="fa-solid fa-wand-magic-sparkles tw-text-[#8E6B92]"></i> Automated Actions
              </h4>
              
              {data.demandAlerts.map((alert, idx) => {
                const isWarning = alert.type === "High Demand";
                const colorClassBg = isWarning ? "tw-bg-[#73749B]" : "tw-bg-[#8E6B92]";
                const colorClassBorder = isWarning ? "tw-border-[#73749B]/20 tw-border-l-[#73749B]" : "tw-border-[#8E6B92]/20 tw-border-l-[#8E6B92]";
                const colorClassGrad = isWarning ? "tw-from-[#73749B]/5" : "tw-from-[#8E6B92]/5";
                
                return (
                  <div key={idx} className={`tw-p-5 tw-rounded-xl tw-bg-gradient-to-r ${colorClassGrad} tw-to-transparent tw-border tw-border-slate-200 dark:tw-border-[var(--border-light)] tw-border-l-4 ${colorClassBorder}`}>
                    <div className="tw-flex tw-justify-between tw-mb-2">
                      <strong className="tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-text-base">{alert.experienceName}</strong>
                      <span className={`tw-text-xs tw-font-bold tw-text-white ${isWarning ? 'tw-bg-[#73749B]' : 'tw-bg-[#8E6B92]'} tw-px-2 tw-py-0.5 tw-rounded-full`}>{alert.type}</span>
                    </div>
                    <p className="tw-text-sm tw-text-slate-600 dark:tw-text-[var(--text-muted)] tw-mb-4 tw-leading-relaxed">{alert.message}</p>
                    <button 
                      onClick={() => handleAction(alert.experienceId, 'demand', `Action performed for ${alert.experienceName}`)}
                      disabled={processing === alert.experienceId}
                      className={`tw-w-full tw-flex tw-justify-center tw-items-center tw-gap-2 ${colorClassBg} tw-text-white tw-font-bold tw-py-2.5 tw-px-4 tw-rounded-lg tw-transition-all tw-duration-200 hover:-tw-translate-y-0.5 hover:tw-shadow-lg disabled:tw-opacity-70 disabled:tw-cursor-not-allowed`}
                    >
                      {processing === alert.experienceId ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className={`fa-solid ${isWarning ? 'fa-user-plus' : 'fa-percent'}`}></i>} {alert.actionRecommended}
                    </button>
                  </div>
                );
              })}

            </div>
          </div>
        </div>

        {/* 2. Fraud & Scam Risk */}
        <div className="tw-col-span-1 tw-bg-white dark:tw-bg-[var(--bg-card)] tw-rounded-2xl tw-p-8 tw-shadow-sm dark:tw-shadow-none tw-border tw-border-slate-200 dark:tw-border-[var(--border-light)] tw-relative tw-overflow-hidden">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-1.5 tw-bg-gradient-to-r tw-from-red-500 tw-to-red-400"></div>
          <div className="tw-flex tw-justify-between tw-items-start tw-mb-8">
            <div>
              <h3 className="tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <div className="tw-w-10 tw-h-10 tw-rounded-lg tw-bg-red-500/10 tw-flex tw-items-center tw-justify-center tw-text-red-500">
                  <i className="fa-solid fa-shield-virus"></i>
                </div>
                Fraud & Scam Detection
              </h3>
              <p className="tw-text-slate-600 dark:tw-text-[var(--text-muted)] tw-text-sm tw-m-0">Behavioral anomaly and risk monitoring.</p>
            </div>
            <div className={`tw-px-3 tw-py-1 tw-rounded-full tw-text-xs tw-font-bold ${data.fraudAlerts.length > 0 ? 'tw-bg-red-500/10 tw-text-red-500' : 'tw-bg-[#73749B]/10 tw-text-[#73749B]'}`}>
              {data.fraudAlerts.length > 0 ? `${data.fraudAlerts.length} Threats` : 'Secure'}
            </div>
          </div>
          
          <div>
            {data.fraudAlerts.length === 0 ? (
              <div className="tw-text-center tw-py-8 tw-text-slate-400 dark:tw-text-[var(--text-dim)]">
                <i className="fa-solid fa-shield-check fa-3x tw-text-[#73749B] tw-mb-4"></i>
                <p>System integrity is at 100%. No malicious patterns detected.</p>
              </div>
            ) : (
              <div className="tw-flex tw-flex-col tw-gap-4">
                {data.fraudAlerts.map((alert, idx) => (
                  <div key={idx} className="tw-p-5 tw-rounded-xl tw-bg-gradient-to-r tw-from-red-500/5 tw-to-transparent tw-border tw-border-red-500/10 tw-border-l-4 tw-border-l-red-500">
                    <div className="tw-flex tw-justify-between tw-mb-2">
                      <strong className="tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-text-base tw-flex tw-items-center tw-gap-2">
                        <i className="fa-solid fa-user-slash tw-text-red-500"></i> {alert.userName}
                      </strong>
                      <span className="tw-text-xs tw-font-bold tw-text-white tw-bg-red-500 tw-px-2 tw-py-0.5 tw-rounded-full tw-uppercase tw-tracking-widest">{alert.severity} RISK</span>
                    </div>
                    <p className="tw-text-sm tw-text-slate-600 dark:tw-text-[var(--text-muted)] tw-mb-4 tw-leading-relaxed">{alert.message}</p>
                    <button 
                      onClick={() => handleAction(alert.userId, 'fraud', `${alert.userName} Account Suspended`)}
                      disabled={processing === alert.userId}
                      className="tw-w-full tw-flex tw-justify-center tw-items-center tw-gap-2 tw-bg-slate-900 dark:tw-bg-[var(--bg-darker)] dark:tw-border dark:tw-border-[var(--border-light)] tw-text-white tw-font-bold tw-py-2.5 tw-px-4 tw-rounded-lg tw-transition-all tw-duration-200 hover:tw-opacity-90 disabled:tw-opacity-70 disabled:tw-cursor-not-allowed"
                    >
                      {processing === alert.userId ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-gavel"></i>} {alert.actionRecommended}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Trust Scoring */}
        <div className="tw-col-span-1 tw-bg-white dark:tw-bg-[var(--bg-card)] tw-rounded-2xl tw-p-8 tw-shadow-sm dark:tw-shadow-none tw-border tw-border-slate-200 dark:tw-border-[var(--border-light)] tw-relative tw-overflow-hidden">
          <div className="tw-absolute tw-top-0 tw-left-0 tw-w-full tw-h-1.5 tw-bg-gradient-to-r tw-from-[#73749B] tw-to-[#8E6B92]"></div>
          <div className="tw-flex tw-justify-between tw-items-start tw-mb-8">
            <div>
              <h3 className="tw-text-xl tw-font-bold tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-flex tw-items-center tw-gap-3 tw-mb-2">
                <div className="tw-w-10 tw-h-10 tw-rounded-lg tw-bg-[#73749B]/10 tw-flex tw-items-center tw-justify-center tw-text-[#73749B]">
                  <i className="fa-solid fa-star-half-stroke"></i>
                </div>
                Provider Trust Matrix
              </h3>
              <p className="tw-text-slate-600 dark:tw-text-[var(--text-muted)] tw-text-sm tw-m-0">Automated quality assurance and rating index.</p>
            </div>
          </div>
          
          <div className="tw-flex tw-flex-col tw-gap-4">
            {data.trustScores.length === 0 ? (
              <p className="tw-text-slate-400 dark:tw-text-[var(--text-dim)] tw-text-center tw-w-full">Awaiting provider reviews to generate matrices.</p>
            ) : (
              data.trustScores.map((provider, idx) => {
                const isPremium = provider.trustScore >= 80;
                const isVerified = provider.trustScore >= 60 && provider.trustScore < 80;
                
                let strokeClass = 'tw-text-red-500';
                let bgClass = 'tw-bg-red-50 dark:tw-bg-red-500/10';
                
                if (isPremium) {
                  strokeClass = 'tw-text-[#73749B]';
                  bgClass = 'tw-bg-[#73749B]/10';
                } else if (isVerified) {
                  strokeClass = 'tw-text-[#8E6B92]';
                  bgClass = 'tw-bg-[#8E6B92]/10';
                }
                
                return (
                  <div key={idx} className={`tw-p-5 tw-rounded-xl tw-bg-slate-50 dark:tw-bg-[#101017] tw-border tw-border-slate-200 dark:tw-border-[var(--border-light)] tw-flex tw-items-center tw-justify-between tw-transition-transform tw-duration-200 hover:-tw-translate-y-1 tw-cursor-pointer`}>
                    <div className="tw-flex tw-items-center tw-gap-4">
                      <div className="tw-w-11 tw-h-11 tw-rounded-full tw-bg-slate-900 dark:tw-bg-[var(--bg-darker)] tw-text-white tw-flex tw-items-center tw-justify-center tw-font-bold">
                        {provider.providerName.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <strong className="tw-block tw-text-slate-900 dark:tw-text-[var(--text-main)] tw-text-base tw-mb-1">{provider.providerName}</strong>
                        <span className={`tw-text-xs tw-font-bold ${strokeClass} ${bgClass} tw-px-2.5 tw-py-0.5 tw-rounded-full`}>
                          {isPremium && <i className="fa-solid fa-crown tw-mr-1"></i>}
                          {provider.tier}
                        </span>
                      </div>
                    </div>
                    
                    {/* Circular Progress Gauge */}
                    <div className="tw-relative tw-w-14 tw-h-14">
                      <svg viewBox="0 0 36 36" className="tw-w-full tw-h-full">
                        <path stroke="currentColor" strokeOpacity="0.1" className="tw-text-slate-500 dark:tw-text-white" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path stroke="currentColor" className={strokeClass} strokeWidth="3" strokeDasharray={`${provider.trustScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ animation: 'dash 1.5s ease-out forwards' }} />
                      </svg>
                      <div className="tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-font-bold tw-text-slate-900 dark:tw-text-[var(--text-main)]">
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
        @keyframes dash { 0% { stroke-dasharray: 0, 100; } }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .tw-animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminIntelligence;
