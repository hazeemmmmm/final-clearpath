document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const API_BASE_URLS = [
        localStorage.getItem("clearpath_api_base"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ].filter(Boolean);

    async function requestWithApiFallback(path, options) {
        let lastError = null;

        for (const baseUrl of API_BASE_URLS) {
            try {
                const response = await fetch(`${baseUrl}${path}`, options);
                localStorage.setItem("clearpath_api_base", baseUrl);
                return response;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error("Could not reach backend server.");
    }

    if (registerForm) {
        registerForm.setAttribute('novalidate', true);

        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const firstName = document.getElementById('FirstName').value.trim();
            const lastName = document.getElementById('LastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const ageDate = document.getElementById('age').value;

            const maleRadio = document.getElementById('Male').checked;
            const femaleRadio = document.getElementById('inlineRadio2').checked;

            if (firstName === '' || lastName === '') {
                alert('Please enter both your First Name and Last Name.');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email === '' || !emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            const phoneRegex = /^\d{10,15}$/;
            if (!phoneRegex.test(phoneNumber)) {
                alert('Phone number must contain only digits and be 10 to 15 digits.');
                return;
            }

            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&._-]{8,}$/;
            if (!passwordRegex.test(password)) {
                alert('Password must be at least 8 characters long, contain at least one uppercase letter, and at least one number.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }

            if (ageDate === '') {
                alert('Please select your Date of Birth.');
                return;
            }

            if (!maleRadio && !femaleRadio) {
                alert('Please select your Gender (Male or Female).');
                return;
            }

            const gender = maleRadio ? 'male' : 'female';

            const payload = {
                fullName: `${firstName} ${lastName}`.trim(),
                email,
                password,
                phoneNumber,
                gender
            };

            try {
                const response = await requestWithApiFallback("/auth/register", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result?.message || 'Registration failed');
                }

                alert('Registration successful! Please verify your email OTP, then login.');
                window.location.href = '../login/my_project/login.html';
            } catch (error) {
                alert(`Registration error: ${error.message || "Failed to connect to backend. Make sure server is running."}`);
            }
        });
    }
});
