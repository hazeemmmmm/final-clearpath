const togglePassword = document.querySelector('#togglePassword');
const passwordInput = document.querySelector('#password');
const loginForm = document.querySelector("#loginForm");
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

if (togglePassword) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        this.classList.toggle('ri-eye-line');
        this.classList.toggle('ri-eye-off-line');
        
        this.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await requestWithApiFallback("/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message || "Login failed");
            }

            const accessToken = data?.data?.accessToken;
            const refreshToken = data?.data?.refreshToken;
            if (!accessToken) {
                throw new Error("Access token missing in response");
            }

            localStorage.setItem("clearpath_access_token", accessToken);
            if (refreshToken) {
                localStorage.setItem("clearpath_refresh_token", refreshToken);
            }

            alert("Login successful!");
            window.location.href = "../../../home/home.html";
        } catch (error) {
            alert(`Login error: ${error.message || "Failed to connect to backend. Make sure server is running."}`);
        }
    });
}