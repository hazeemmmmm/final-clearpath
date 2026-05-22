function renderDayuses() {
    const container = document.getElementById("dayuseContainer");
    if (!container) return;
    
    let html = "";
    
    allDayusePackages.forEach(gov => {
        html += `
        <main class="content" style="margin-bottom: 20px;">
            <div class="section-title">
                <h2>Famous Dayuse in ${gov.name}</h2>
                <div class="arrows">
                    <button onclick="scrollL(this)"><i class="fa-solid fa-chevron-left"></i></button>
                    <button onclick="scrollR(this)"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="scroll-wrapper">
        `;
        
        gov.packages.forEach(pkg => {
            // Encode the package data into stringified JSON so we can easily pass it
            const packageData = encodeURIComponent(JSON.stringify(pkg));
            html += `
                <div class="card card--link" onclick="openPackageModal('${packageData}')">
                    <div class="img-box">
                        <img src="${pkg.image}" alt="${pkg.title.replace(/"/g, "&quot;")}">
                    </div>
                    <div class="info">
                        <h4>${pkg.title}</h4>
                        <p>${pkg.price}</p>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
        </main>
        `;
    });
    
    container.innerHTML = html;
}

function openPackageModal(encodedPkgData) {
    const pkg = JSON.parse(decodeURIComponent(encodedPkgData));
    
    const modal = document.getElementById('packageModal');
    const modalImg = document.getElementById('pkgModalImg');
    const modalTitle = document.getElementById('pkgModalTitle');
    const modalLocation = document.getElementById('pkgModalLocation');
    const modalPrice = document.getElementById('pkgModalPrice');
    const modalRating = document.getElementById('pkgModalRating');
    const modalDesc = document.getElementById('pkgModalDesc');
    const modalVideo = document.getElementById('pkgModalVideo');
    const modalVideoCover = document.getElementById('pkgModalVideoCover');
    const playButtonOverlay = document.getElementById('playButtonOverlay');
    
    // Reset video player state
    modalVideo.style.display = 'none';
    modalVideoCover.style.display = 'block';
    playButtonOverlay.style.display = 'flex';
    modalVideo.src = ""; // Clear iframe src initially

    // Store the base video URL dynamically
    document.getElementById('videoContainer').dataset.videoUrl = pkg.video;
    
    // Automatically extract YouTube ID to get the authentic video thumbnail
    let coverImg = pkg.image;
    if (pkg.video) {
        const match = pkg.video.match(/embed\/([^?]+)/);
        if (match && match[1]) {
            coverImg = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
    }
    
    // Set the cover image (use custom cover if valid, else youtube thumbnail, else package image)
    const hasCustomCover = pkg.videoCover && pkg.videoCover !== "PUT_YOUR_COVER_IMAGE_LINK_HERE.jpg";
    modalVideoCover.src = hasCustomCover ? pkg.videoCover : coverImg;

    modalImg.src = pkg.image;
    modalImg.alt = pkg.title;
    modalTitle.textContent = pkg.title;
    modalLocation.textContent = `📍 ${pkg.location}, Egypt`;
    modalPrice.textContent = `💰 ${pkg.price}`;
    modalRating.textContent = `⭐ ${pkg.rating} / 5.0`;
    modalDesc.textContent = pkg.description;
    
    modal.style.display = 'block';

    // Wishlist save button (optional)
    try {
        const api = window.ClearPathWishlist;
        const btn = document.getElementById("btnSaveDayuse");
        if (api && btn) {
            const idBase = ["dayuse", pkg.id || "", pkg.title || "", pkg.price || "", pkg.location || ""].join("|");
            const wid = "dayuse_" + api.hashId(idBase);
            const item = {
                id: wid,
                type: "dayuse",
                title: pkg.title,
                price: pkg.price,
                image: pkg.image,
                gov: pkg.location,
                location: "Egypt",
                href: "dayuse.html",
            };

            const setBtn = function (saved) {
                const icon = btn.querySelector("i");
                if (icon) {
                    icon.classList.toggle("fa-regular", !saved);
                    icon.classList.toggle("fa-solid", saved);
                }
                const textNode = btn.childNodes && btn.childNodes.length ? btn.childNodes[btn.childNodes.length - 1] : null;
                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                    textNode.textContent = saved ? " Saved" : " Save";
                } else {
                    btn.innerHTML = `${saved ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>'}${saved ? " Saved" : " Save"}`;
                }
                btn.setAttribute("data-saved", saved ? "1" : "0");
            };

            setBtn(api.has(item.id));

            // Avoid stacking listeners each time modal opens
            if (!btn.dataset.boundWishlist) {
                btn.addEventListener("click", function (e) {
                    e.preventDefault();
                    const current = btn.dataset.wishlistItem ? JSON.parse(btn.dataset.wishlistItem) : null;
                    if (!current) return;
                    const res = api.toggle(current);
                    if (res && res.ok) setBtn(!!res.saved);
                });
                btn.dataset.boundWishlist = "1";
            }

            btn.dataset.wishlistItem = JSON.stringify(item);
        }
    } catch (e) {
        // wishlist optional
    }
}

function closePackageModal() {
    document.getElementById('packageModal').style.display = 'none';
    document.getElementById('pkgModalVideo').src = ""; // Stop video playback
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('packageModal');
    const authModal = document.getElementById('authModal');
    const expModal = document.getElementById('experiencesModal');
    if (event.target == modal) {
        modal.style.display = "none";
        document.getElementById('pkgModalVideo').src = ""; // Stop video playback
    }
    if (event.target == authModal) {
        closeAuth();
    }
    if (event.target == expModal) {
        closeExperiences();
    }
}

function playLocationVideo() {
    const container = document.getElementById('videoContainer');
    const videoUrl = container.dataset.videoUrl;
    
    if (videoUrl) {
        document.getElementById('pkgModalVideoCover').style.display = 'none';
        document.getElementById('playButtonOverlay').style.display = 'none';
        
        const iframe = document.getElementById('pkgModalVideo');
        iframe.style.display = 'block';
        
        // Append ?autoplay=1 so it starts immediately when revealed
        const separator = videoUrl.includes('?') ? '&' : '?';
        iframe.src = videoUrl + separator + 'autoplay=1';
    }
}

document.addEventListener("DOMContentLoaded", renderDayuses);
