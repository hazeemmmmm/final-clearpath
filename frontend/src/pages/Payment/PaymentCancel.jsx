import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#0b0f14', color: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px 20px 40px' }}>
        <div style={{ background: '#151d2b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '40px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
              <i className="fa-solid fa-circle-xmark" style={{ fontSize: '3rem', color: '#ef4444' }}></i>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ef4444' }}>Payment Cancelled</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Your Stripe checkout session was cancelled. No charges were made to your account.
            </p>
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', width: '100%', margin: '15px 0' }}></div>
            <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
              <button onClick={() => navigate('/payment')} style={{ flex: 1, background: '#3b82f6', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Retry Payment
              </button>
              <button onClick={() => navigate('/')} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Go Home
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancel;
