async function processPayment() {
    const btn = document.querySelector('.btn-glow span');
    const icon = document.querySelector('.btn-glow i');
    const emailInput = document.querySelector('input[type="email"]');
    
    if (emailInput && !emailInput.value) {
        alert("Please enter your PayPal email address.");
        return;
    }

    btn.innerText = "Processing...";
    icon.className = "fa-solid fa-spinner fa-spin ml-2 text-sm";
    
    // Retrieve token and bookingId from localStorage
    // NOTE: These must be set during your login and booking flow
    const token = localStorage.getItem('token');
    const bookingId = localStorage.getItem('currentBookingId');

    if (!token || !bookingId) {
        alert("Authentication or Booking details missing! Please ensure you are logged in and have selected a package.");
        btn.innerText = "Next";
        icon.className = "fa-solid fa-arrow-right ml-2 text-sm";
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/payment/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookingId: bookingId })
        });

        const data = await response.json();

        if (response.ok && data.approvalUrl) {
            // Redirect the user to PayPal's checkout page
            window.location.href = data.approvalUrl;
        } else {
            alert("Failed to initiate payment: " + (data.message || 'Unknown error'));
            btn.innerText = "Next";
            icon.className = "fa-solid fa-arrow-right ml-2 text-sm";
        }
    } catch (error) {
        console.error("Payment error:", error);
        alert("An error occurred while connecting to the server.");
        btn.innerText = "Next";
        icon.className = "fa-solid fa-arrow-right ml-2 text-sm";
    }
}
