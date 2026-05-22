// theme.js - Handle Dark Mode / Light Mode state across the entire site

function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
    
    // Update icons if the toggle buttons exist
    const icons = document.querySelectorAll(".theme-icon");
    icons.forEach(icon => {
        if (isDark) {
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        } else {
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }
    });
}

function toggleTheme() {
    const isDark = document.body.classList.contains("dark-mode");
    const newThemeDark = !isDark;
    
    applyTheme(newThemeDark);
    localStorage.setItem("theme", newThemeDark ? "dark" : "light");
}

function initTheme() {
    // Check if user has explicitly saved a theme preference
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark") {
        applyTheme(true);
    } else if (savedTheme === "light") {
        applyTheme(false);
    } else {
        // Fallback to system preferences if no saved choice
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(systemPrefersDark);
    }
}

// Initialize layout as quickly as possible 
initTheme();
// And ensure icons update properly once DOM fully loads
document.addEventListener("DOMContentLoaded", initTheme);
