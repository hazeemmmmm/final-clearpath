import React, { useState, useEffect, useCallback } from 'react';
import { _registerToast } from '../utils/toast';

let _idCounter = 0;
const DURATION = 7000;

const VARIANTS = {
  success: {
    icon: 'fa-circle-check',
    bar: '#10b981',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.30)',
    iconColor: '#34d399',
    textColor: '#ecfdf5',
    progressColor: '#10b981',
  },
  error: {
    icon: 'fa-circle-xmark',
    bar: '#ef4444',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.30)',
    iconColor: '#f87171',
    textColor: '#fff1f2',
    progressColor: '#ef4444',
  },
  info: {
    icon: 'fa-circle-info',
    bar: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.30)',
    iconColor: '#fbbf24',
    textColor: '#fffbeb',
    progressColor: '#f59e0b',
  },
};

const Toast = ({ id, message, type, onRemove }) => {
  const v = VARIANTS[type] || VARIANTS.error;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const step = 100 / (DURATION / 50);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p <= 0) { clearInterval(interval); return 0; }
        return p - step;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderLeft: `4px solid ${v.bar}`,
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        width: '360px',
        animation: 'cpToastIn 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Main content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 14px 12px' }}>
        <i
          className={`fa-solid ${v.icon}`}
          style={{ color: v.bar, fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}
        />
        <span
          style={{
            flex: 1,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: v.textColor,
            lineHeight: 1.5,
            fontFamily: "'Outfit', 'Inter', sans-serif",
          }}
        >
          {message}
        </span>
        <button
          onClick={() => onRemove(id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 2px',
            color: v.iconColor,
            opacity: 0.5,
            fontSize: '0.75rem',
            flexShrink: 0,
            lineHeight: 1,
            marginTop: '2px',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', width: '100%' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: v.progressColor,
            opacity: 0.6,
            transition: 'width 0.05s linear',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'error') => {
    const id = ++_idCounter;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => removeToast(id), DURATION);
  }, [removeToast]);

  useEffect(() => {
    _registerToast(addToast);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes cpToastIn {
          from { opacity: 0; transform: translateX(60px) scale(0.92); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '76px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <Toast {...t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastContainer;
