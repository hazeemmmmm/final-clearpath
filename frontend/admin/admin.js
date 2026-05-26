const API_BASE_URL = localStorage.getItem("clearpath_api_base") || "http://localhost:3000";
const ADMIN_TOKEN_KEY = "clearpath_admin_access_token";

const authCard = document.getElementById("authCard");
const panelCard = document.getElementById("panelCard");
const statusText = document.getElementById("statusText");

const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

const usersTableBody = document.getElementById("usersTableBody");
const experiencesTableBody = document.getElementById("experiencesTableBody");
const bookingsTableBody = document.getElementById("bookingsTableBody");
const destinationsTableBody = document.getElementById("destinationsTableBody");
const couponsTableBody = document.getElementById("couponsTableBody");
const staysTableBody = document.getElementById("staysTableBody");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = {
    reports: document.getElementById("reportsTab"),
    bookings: document.getElementById("bookingsTab"),
    stays: document.getElementById("staysTab"),
    users: document.getElementById("usersTab"),
    experiences: document.getElementById("experiencesTab"),
    destinations: document.getElementById("destinationsTab"),
    coupons: document.getElementById("couponsTab")
};

const experienceForm = document.getElementById("experienceForm");
const destinationForm = document.getElementById("destinationForm");
const couponForm = document.getElementById("couponForm");

function setStatus(message, isError = false) {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.style.color = isError ? "#b3002d" : "";
}

function getToken() {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

function setToken(token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
}

async function apiRequest(path, options = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (e) {
        payload = null;
    }

    if (!response.ok) {
        const msg = payload?.message || "Request failed";
        throw new Error(msg);
    }

    return payload;
}

function showPanel() {
    if (!window.location.pathname.includes("admin_dashboard.html")) {
        window.location.href = "admin_dashboard.html";
    }
}

function showAuth() {
    if (window.location.pathname.includes("admin_dashboard.html")) {
        window.location.href = "admin.html";
    }
}

function activateTab(tabName) {
    tabButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    Object.keys(tabContents).forEach((name) => {
        if (tabContents[name]) {
            tabContents[name].classList.toggle("active", name === tabName);
        }
    });
}

function safeFullName(user) {
    const first = user.firstName || "";
    const last = user.lastName || "";
    const full = `${first} ${last}`.trim();
    return full || "Unknown";
}

async function loadUsers() {
    usersTableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    try {
        // Backend has "Admin" in one route and "admin" elsewhere.
        // We still call the documented endpoint and show a clear error if role mismatch exists server-side.
        const data = await apiRequest("/user/admin/all");
        const users = data?.users || data?.data || [];

        if (!users.length) {
            usersTableBody.innerHTML = "<tr><td colspan='4'>No users found.</td></tr>";
            return;
        }

        usersTableBody.innerHTML = users
            .map((user) => `
                <tr>
                    <td>${safeFullName(user)}</td>
                    <td>${user.email || "-"}</td>
                    <td>${user.role || "-"}</td>
                    <td>
                        <button class="theme-toggle" data-action="history" data-user-id="${user._id}">History</button>
                        <button class="danger-btn" data-action="delete" data-user-id="${user._id}">Delete</button>
                    </td>
                </tr>
            `)
            .join("");
    } catch (error) {
        usersTableBody.innerHTML = `<tr><td colspan='4'>${error.message}</td></tr>`;
        setStatus(`Users error: ${error.message}`, true);
    }
}

async function loadExperiences() {
    experiencesTableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    try {
        const data = await apiRequest("/experience?limit=50");
        const experiences = data?.data || [];

        if (!experiences.length) {
            experiencesTableBody.innerHTML = "<tr><td colspan='4'>No experiences found.</td></tr>";
            return;
        }

        experiencesTableBody.innerHTML = experiences
            .map((exp) => `
                <tr>
                    <td>${exp.name || "-"}</td>
                    <td>${exp.type || "-"}</td>
                    <td>${exp.base_price || "-"}</td>
                    <td>
                        <button class="danger-btn" data-experience-id="${exp._id}">Delete</button>
                    </td>
                </tr>
            `)
            .join("");
    } catch (error) {
        experiencesTableBody.innerHTML = `<tr><td colspan='4'>${error.message}</td></tr>`;
        setStatus(`Experiences error: ${error.message}`, true);
    }
}


async function loadBookings() {
    if(!bookingsTableBody) return;
    bookingsTableBody.innerHTML = `
        <tr>
            <td>John Doe</td>
            <td>Pyramids Trip</td>
            <td>2026-05-01</td>
            <td>$150</td>
            <td><span style="color:green;font-weight:bold;">Completed</span></td>
            <td><button class="danger-btn">Refund</button></td>
        </tr>
        <tr>
            <td>Jane Smith</td>
            <td>Red Sea Package</td>
            <td>2026-05-02</td>
            <td>$400</td>
            <td><span style="color:orange;font-weight:bold;">Pending</span></td>
            <td><button class="danger-btn">Cancel</button></td>
        </tr>
    `;
}

async function loadStays() {
    if(!staysTableBody) return;
    staysTableBody.innerHTML = `
        <tr>
            <td>Hazem</td>
            <td>The St. Regis Cairo</td>
            <td>Hotel</td>
            <td>2026-06-10 to 2026-06-15</td>
            <td>$2,100</td>
            <td><span style="color:green;font-weight:bold;">Confirmed</span></td>
            <td><button class="danger-btn">Cancel</button></td>
        </tr>
        <tr>
            <td>Sarah M.</td>
            <td>Cozy Zamalek Apartment</td>
            <td>Apartment</td>
            <td>2026-07-01 to 2026-07-05</td>
            <td>$350</td>
            <td><span style="color:orange;font-weight:bold;">Pending</span></td>
            <td><button class="danger-btn">Cancel</button></td>
        </tr>
    `;
}

async function loadDestinations() {
    if(!destinationsTableBody) return;
    destinationsTableBody.innerHTML = `
        <tr>
            <td>Cairo</td>
            <td>Capital of Egypt</td>
            <td><button class="danger-btn">Delete</button></td>
        </tr>
        <tr>
            <td>Alexandria</td>
            <td>Mediterranean Port City</td>
            <td><button class="danger-btn">Delete</button></td>
        </tr>
    `;
}

async function loadCoupons() {
    if(!couponsTableBody) return;
    couponsTableBody.innerHTML = `
        <tr>
            <td>SUMMER20</td>
            <td>20%</td>
            <td>2026-08-31</td>
            <td><button class="danger-btn">Delete</button></td>
        </tr>
    `;
}

async function loadReports() {
    const totalRevenueEl = document.getElementById("totalRevenue");
    const totalBookingsEl = document.getElementById("totalBookings");
    const activityLogEl = document.getElementById("activityLog");
    
    if (totalRevenueEl) totalRevenueEl.textContent = "$550.00";
    if (totalBookingsEl) totalBookingsEl.textContent = "2";
    if (activityLogEl) {
        activityLogEl.innerHTML = `
            <div class="log-item"><span class="log-time">10 mins ago</span> Jane Smith registered an account.</div>
            <div class="log-item"><span class="log-time">1 hour ago</span> John Doe completed payment for Pyramids Trip.</div>
            <div class="log-item"><span class="log-time">3 hours ago</span> Admin added new destination "Alexandria".</div>
            <div class="log-item"><span class="log-time">1 day ago</span> System backup completed successfully.</div>
        `;
    }
}

async function loadAllData() {
    await Promise.all([
        loadReports(),
        loadBookings(),
        loadStays(),
        loadUsers(), 
        loadExperiences(), 
        loadDestinations(),
        loadCoupons()
    ]);
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("emailInput").value.trim();
        const password = document.getElementById("passwordInput").value;

        setStatus("Signing in...");

        try {
            const result = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            const token = result?.data?.accessToken;
            if (!token) {
                throw new Error("Access token missing from login response.");
            }

            setToken(token);
            showPanel();
        } catch (error) {
            setStatus(`Login failed: ${error.message}`, true);
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        clearToken();
        showAuth();
    });
}

tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

// Sidebar navigation - Navigate to different pages
const sidebarLinks = document.querySelectorAll(".sidebar-link");
const pageMap = {
    reports: "admin_dashboard.html",
    bookings: "manage_bookings.html",
    stays: "manage_stays.html",
    users: "manage_users.html",
    experiences: "manage_experiences.html",
    destinations: "manage_destinations.html",
    coupons: "manage_coupons.html"
};

sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const tabName = link.dataset.tab;
        const page = pageMap[tabName];
        if (page) {
            window.location.href = page;
        }
    });
});

if (usersTableBody) {
    usersTableBody.addEventListener("click", async (event) => {
        const btn = event.target.closest("button");
        if (!btn) return;
        
        const userId = btn.dataset.userId;
        const action = btn.dataset.action;
        
        if (action === "history") {
            alert("Showing history for user " + userId);
            return;
        }
        
        if (action === "delete") {
            if (!confirm("Delete this user?")) return;
            try {
                await apiRequest(`/user/admin/delete/${userId}`, { method: "DELETE" });
                setStatus("User deleted.");
                await loadUsers();
            } catch (error) {
                setStatus(`Delete user failed: ${error.message}`, true);
            }
        }
    });
}

if (experiencesTableBody) {
    experiencesTableBody.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-experience-id]");
        if (!button) return;

        const id = button.dataset.experienceId;
        if (!confirm("Delete this experience?")) return;

        try {
            await apiRequest(`/experience/${id}`, { method: "DELETE" });
            setStatus("Experience deleted.");
            await loadExperiences();
        } catch (error) {
            setStatus(`Delete experience failed: ${error.message}`, true);
        }
    });
}


if (experienceForm) {
    experienceForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const payload = {
            name: document.getElementById("expName").value.trim(),
            type: document.getElementById("expType").value,
            governorate: document.getElementById("expGovernorate").value,
            description: document.getElementById("expDescription").value.trim(),
            duration_days: Number(document.getElementById("expDuration").value),
            base_price: Number(document.getElementById("expPrice").value),
            capacity: Number(document.getElementById("expCapacity").value || 10),
            image_url: document.getElementById("expImage").value.trim(),
            destination: document.getElementById("expDestination").value.trim(),
            itinerary: []
        };

        const addonsInput = document.getElementById("expAddons").value.trim();
        if (addonsInput) {
            try { payload.custom_addons = JSON.parse(addonsInput); } 
            catch(e) { setStatus("Add-ons must be valid JSON.", true); return; }
        }

        const datesInput = document.getElementById("expDates").value.trim();
        if (datesInput) {
            try {
                payload.availableDates = JSON.parse(datesInput);
            } catch (e) {
                setStatus("Available dates must be valid JSON.", true);
                return;
            }
        }

        try {
            await apiRequest("/experience", {
                method: "POST",
                body: JSON.stringify(payload)
            });
            experienceForm.reset();
            setStatus("Experience created.");
            await loadExperiences();
        } catch (error) {
            setStatus(`Create experience failed: ${error.message}`, true);
        }
    });
}


if (destinationForm) {
    destinationForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        // Mock API call for adding destination
        destinationForm.reset();
        setStatus("Destination created (mock).");
        await loadDestinations();
    });
}

if (couponForm) {
    couponForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        // Mock API call for creating coupon
        couponForm.reset();
        setStatus("Coupon created (mock).");
        await loadCoupons();
    });
}

async function init() {
    // TEMPORARY BYPASS for testing
    const isDashboard = window.location.pathname.includes("admin_dashboard.html");

    if (isDashboard) {
        setStatus("Bypass active. Loading mock data...");
        await loadAllData();
        setStatus("Admin data loaded (Bypass).");
    } else {
        // If on login page, automatically jump to dashboard
        window.location.href = "admin_dashboard.html";
    }
}

init();
