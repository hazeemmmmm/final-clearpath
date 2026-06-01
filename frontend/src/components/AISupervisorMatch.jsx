import React, { useState, useEffect } from 'react';
import { matchSupervisorByBio } from '../utils/api';

const AISupervisorMatch = ({ packageLocation, lang }) => {
  const [loading, setLoading] = useState(true);
  const [matchedData, setMatchedData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAIMatch = async () => {
      if (!packageLocation) return;
      try {
        setLoading(true);
        setError('');
        const res = await matchSupervisorByBio(packageLocation);
        if (res && res.success && res.data) {
          setMatchedData(res.data);
        } else {
          setError(lang === 'AR' ? 'تعذر تحميل بيانات المطابقة الذكية.' : 'Could not fetch AI match data.');
        }
      } catch (err) {
        console.error('AI Supervisor Match UI Error:', err);
        setError(lang === 'AR' ? 'خطأ في الاتصال بنظام الذكاء الاصطناعي.' : 'AI match system connection error.');
      } finally {
        setLoading(false);
      }
    };

    fetchAIMatch();
  }, [packageLocation, lang]);

  if (loading) {
    return (
      <div style={{
        background: 'rgba(10, 11, 13, 0.45)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        borderRadius: '24px',
        padding: '35px',
        textAlign: 'center',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)',
        color: '#ffffff'
      }}>
        <div className="stripe-spinner" style={{ width: '35px', height: '35px', margin: '0 auto 15px', border: '3px solid rgba(212,175,55,0.1)', borderTopColor: '#d4af37' }}></div>
        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#d4af37', letterSpacing: '0.05em' }}>
          {lang === 'AR' ? 'جاري تشغيل محاكي الذكاء الاصطناعي لفحص السير الذاتية...' : 'INITIATING REAL-TIME AI BIO-ANALYSIS...'}
        </h4>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '6px' }}>
          {lang === 'AR' ? 'يقوم الـ AI بقراءة وفهم السير الذاتية للمشرفين لمطابقة الأنسب لموقع الرحلة.' : 'LLM is parsing travel supervisor bios to match the perfect host for this location.'}
        </p>
      </div>
    );
  }

  if (error || !matchedData || !matchedData.supervisor) {
    return null; // Fallback silently
  }

  const { supervisor, aiReason } = matchedData;

  return (
    <div style={{
      marginTop: '40px',
      marginBottom: '40px',
      background: 'linear-gradient(135deg, rgba(15, 17, 23, 0.85) 0%, rgba(26, 30, 41, 0.85) 100%)',
      border: '1px solid rgba(212, 175, 55, 0.25)',
      borderRadius: '24px',
      padding: '30px',
      boxShadow: '0 15px 45px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.05)',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      overflow: 'hidden',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Glow Effect */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
        paddingBottom: '20px',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1,
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '10px',
            height: '10px',
            background: '#d4af37',
            borderRadius: '50%',
            display: 'inline-block',
            boxShadow: '0 0 10px #d4af37',
            animation: 'pulseGlow 2s infinite'
          }}></span>
          <h3 style={{
            color: '#ffffff',
            fontSize: '1.25rem',
            fontWeight: '800',
            margin: 0,
            fontFamily: 'serif',
            letterSpacing: '0.02em'
          }}>
            {lang === 'AR' ? 'المطابقة الذكية للمشرف السياحي (Bio-Analysis)' : 'AI Supervisor Bio-Analysis Matching'}
          </h3>
        </div>

        {/* Premium AI Status Badge */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          borderRadius: '30px',
          padding: '6px 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: '#d4af37',
          fontSize: '0.78rem',
          fontWeight: 'bold',
          letterSpacing: '0.05em'
        }}>
          <i className="fa-solid fa-brain tw-animate-pulse"></i>
          <span>{lang === 'AR' ? 'تحليل ذكاء اصطناعي نشط' : 'ACTIVE AI COGNITION'}</span>
        </div>
      </div>

      {/* Supervisor Details Profile */}
      <div style={{ display: 'flex', flexDirection: 'column', mdFlexDirection: 'row', gap: '24px', position: 'relative', zIndex: 1 }} className="tw-flex tw-flex-col md:tw-flex-row">
        {/* Avatar */}
        <div style={{ flexShrink: 0, position: 'relative', alignSelf: 'center' }}>
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '2px solid #d4af37',
            boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 0 15px rgba(212,175,55,0.2)'
          }}>
            <img src={supervisor.avatar} alt={supervisor.name} style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
          </div>
          {/* Glowing Trust Badge */}
          <div style={{
            position: 'absolute',
            bottom: '-10px',
            right: '-10px',
            background: 'linear-gradient(135deg, #b38f4d 0%, #ffd700 100%)',
            color: '#000',
            fontWeight: '900',
            fontSize: '0.75rem',
            padding: '3px 8px',
            borderRadius: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <i className="fa-solid fa-circle-check"></i>
            {supervisor.trustScore}% Trust
          </div>
        </div>

        {/* Content Info */}
        <div style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <h4 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
              {supervisor.name}
            </h4>
            <span style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '2px 10px',
              fontSize: '0.7rem',
              color: '#cbd5e1',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {supervisor.specialization || (lang === 'AR' ? 'مشرف معتمد' : 'Certified Supervisor')}
            </span>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.6', margin: '0 0 16px' }}>
            "{supervisor.bio}"
          </p>

          {/* AI Decision Explanation Box */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.04)',
            border: '1px dashed rgba(212, 175, 55, 0.35)',
            borderRadius: '16px',
            padding: '16px 20px',
            position: 'relative'
          }}>
            <span style={{
              display: 'block',
              color: '#d4af37',
              fontSize: '0.65rem',
              fontWeight: '900',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: '6px' }}></i>
              {lang === 'AR' ? 'تحليل ومبرر المطابقة التلقائية:' : 'AI Bio-Analysis Breakdown:'}
            </span>
            <p style={{
              color: '#e2e8f0',
              fontSize: '0.82rem',
              lineHeight: '1.6',
              margin: 0,
              fontStyle: 'italic',
              fontWeight: '500'
            }}>
              {aiReason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISupervisorMatch;
