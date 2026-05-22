import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { processPayment } from '../../utils/api';
import './Payment.css';

const Payment = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = useSelector((state) => state.auth?.token);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage('Please log in to proceed with payment.');
      return;
    }

    const bookingId = localStorage.getItem('currentBookingId');
    if (!bookingId) {
      setMessage('No booking selected. Please choose a package before paying.');
      return;
    }

    setLoading(true);
    try {
      const response = await processPayment(bookingId);
      if (response.approvalUrl) {
        window.location.href = response.approvalUrl;
      } else {
        setMessage('Payment initiated successfully.');
      }
    } catch (err) {
      setMessage(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <Navbar />
      <main className="content" style={{ marginTop: '100px', minHeight: '60vh', padding: '20px' }}>
        <h1>Checkout & Payment</h1>
        <form onSubmit={handlePayment} style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" placeholder="Card Number" required style={{ padding: '10px' }} />
          <input type="text" placeholder="MM/YY" required style={{ padding: '10px' }} />
          <input type="text" placeholder="CVC" required style={{ padding: '10px' }} />
          <button type="submit" disabled={loading} style={{ background: '#005073', color: '#fff', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
        {message && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{message}</p>}
      </main>
      <Footer />
    </div>
  );
};

export default Payment;
