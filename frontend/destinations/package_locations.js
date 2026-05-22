// package_locations.js
// Specific logic for the package locations page

document.addEventListener("DOMContentLoaded", function() {
    // Check if there is a hash in the URL to scroll to
    if (window.location.hash) {
        setTimeout(() => {
            const el = document.querySelector(window.location.hash);
            if (el) {
                // Scroll with offset for navbar
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({top: y, behavior: 'smooth'});
            }
        }, 300); // slight delay to ensure rendering
    }
});
