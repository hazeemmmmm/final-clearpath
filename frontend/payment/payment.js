// Initialize Stripe (using test publishable key - replace with your actual key from dashboard)
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TbILNGryBSn9GvKrpw5KzX2X5sJ3H3Q6V8W9Y1Z2A3B4C5D6E7F8G9H0I1J2K3L';
let stripe = null;
let elements = null;
let cardElement = null;

// Initialize Stripe on page load
document.addEventListener('DOMContentLoaded', async () => {
    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    elements = stripe.elements();
    cardElement = elements.create('card', {
        style: {
            base: {
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '16px',
                '::placeholder': {
                    color: '#9ca3af'
                }
            },
            invalid: {
                color: '#ef4444'
            }
        }
    });
    cardElement.mount('#card-element');

    // Handle real-time validation errors
    cardElement.on('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
});

async function processPayment() {
    const btn = document.getElementById('pay-button');
    const btnSpan = btn.querySelector('span');
    const btnIcon = btn.querySelector('i');
    
    if (!stripe || !cardElement) {
        alert("Payment system is not initialized. Please refresh the page.");
        return;
    }

    btn.disabled = true;
    btnSpan.innerText = "Processing...";
    btnIcon.className = "fa-solid fa-spinner fa-spin ml-2 text-sm";
    
    // Retrieve token and bookingId from localStorage
    const token = localStorage.getItem('token');
    const bookingId = localStorage.getItem('currentBookingId');
    const currency = localStorage.getItem('paymentCurrency') || 'EGP';

    if (!token || !bookingId) {
        alert("Authentication or Booking details missing! Please ensure you are logged in and have selected a package.");
        btn.disabled = false;
        btnSpan.innerText = "Pay Now";
        btnIcon.className = "fa-solid fa-lock ml-2 text-sm";
        return;
    }

    try {
        // Step 1: Create Stripe Checkout Session on backend
        const sessionResponse = await fetch('http://localhost:3000/payment/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookingId: bookingId, currency: currency })
        });

        const sessionData = await sessionResponse.json();

        if (!sessionResponse.ok) {
            throw new Error(sessionData.message || 'Failed to create payment session');
        }

        // Step 2: Redirect to Stripe Checkout
        if (sessionData.approvalUrl) {
            window.location.href = sessionData.approvalUrl;
        } else {
            throw new Error('No checkout URL received from server');
        }

    } catch (error) {
        console.error("Payment error:", error);
        alert("Payment Error: " + error.message);
        btn.disabled = false;
        btnSpan.innerText = "Pay Now";
        btnIcon.className = "fa-solid fa-lock ml-2 text-sm";
    }
}
