const images = [
    "./img/Alexandria seafrontjpg.jpg", "./img/Basata Echo Camp.webp", "./img/Cairo Down Town Hostel.webp",
    "./img/Dahab Bedouin Camp.webp", "./img/Elephantine island house.webp", "./img/Fayoum lakejpg.jpg",
    "./img/Kato Dool Nubian House.webp", "./img/Lazib Inn Resort.webp", "./img/Luxor Nile villajpg.jpg",
    "./img/Naama Bay Hotelwebp.webp", "./img/Old Cataract terracejpg.jpg", "./img/Roswtta Nile House.webp",
    "./img/Siwa oasis Lodgejpg.jpg", "./img/Wadi Gimal Lodge.webp", "./img/cairo_pyramids_1775971845389.png",
    "./img/egyptian_museum_1775972234399.png", "./img/nile_cruise_1775972271725.png", "./img/cairo_bazaar_1775972513201.png",
    "./img/hurghada resortwebp.webp", "./img/dahab-lagoon.jpg"
];

const governorates = [
    { name: "Cairo", themes: ["Pyramids", "Egyptian Museum", "Khan el-Khalili", "Felucca Ride", "Cairo Tower", "Citadel", "Al-Azhar", "Manial Palace", "Nile Cruise", "Old Cairo"] },
    { name: "Alexandria", themes: ["Bibliotheca Alexandrina", "Qaitbay Citadel", "Seaside Corniche", "Roman Amphitheater", "Montaza Palace", "Pompey's Pillar", "Catacombs", "Stanley Bridge", "Royal Jewelry"] },
    { name: "Luxor", themes: ["Valley of the Kings", "Karnak Temple", "Hatshepsut Temple", "Luxor Temple", "Nile Cruise", "Balloon Ride", "Mummification Museum", "Colossi of Memnon"] },
    { name: "Aswan", themes: ["Philae Temple", "Abu Simbel", "High Dam", "Nubian Village", "Elephantine Island", "Unfinished Obelisk", "Felucca Safari", "Botanical Garden"] },
    { name: "South Sinai", themes: ["Sharm El Sheikh Beach", "Dahab Snorkeling", "Mount Sinai", "St. Catherine's", "Blue Hole", "Ras Mohammed", "Safari Trek", "Tiran Island"] },
    { name: "Red Sea", themes: ["Hurghada Scuba", "Giftun Island", "Marsa Alam Desert", "El Gouna Resort", "Red Sea Submarine", "Desert Quad Safari", "Dolphin House", "Abu Dabbab"] },
    { name: "Matrouh", themes: ["Siwa Salt Lakes", "Cleopatra Bath", "Great Sand Sea", "Agiba Beach", "Rommel Cave", "Temple of the Oracle", "Shali Fortress", "Fatnas Island"] },
    { name: "Fayoum", themes: ["Wadi El Rayan", "Magic Lake", "Tunis Village", "Whale Valley (Wadi Hitan)", "Qarun Lake", "Pottery Class", "Karanis City", "Desert Waterfall"] },
    { name: "Giza", themes: ["Saqqara Step Pyramid", "Memphis City", "Dahshur Pyramids", "Sound & Light Show", "Grand Egyptian Museum", "Bahariya Oasis", "Giza Plateau", "Desert Horse Ride"] },
    { name: "New Valley", themes: ["White Desert", "Black Desert", "Crystal Mountain", "Farafra Hot Springs", "Dakhla Oasis", "Kharga Monuments", "Desert Camp", "Sandboarding"] }
];

const suffixes = [
    "Day Tour", "Safari", "Adventure", "Explorer", "Excursion", 
    "Getaway", "Experience", "Half-Day Trip", "Walking Tour", "Private Tour", 
    "Photography Tour", "VIP Experience", "Sunset Tour", "Sunrise Trip", "Night Tour"
];

const allPackages = governorates.map(gov => {
    let trips = [];
    for (let i = 0; i < 15; i++) {
        let theme = gov.themes[i % gov.themes.length];
        let suffix = suffixes[i % suffixes.length];
        // Generate a pseudo-random price between 300 and 1800 that looks realistic
        let price = Math.floor(Math.random() * 30 + 6) * 50; 
        
        // Consistent image selection based on index so it doesn't reshuffle constantly
        let imgIndex = (gov.name.length + i * 3) % images.length;
        
        trips.push({
            title: `${theme} ${suffix}`,
            price: price.toLocaleString() + " EGP / person",
            image: images[imgIndex]
        });
    }
    return { name: gov.name, trips: trips };
});

function renderTrips() {
    const container = document.getElementById("tripsContainer");
    if (!container) return;
    
    let html = "";
    
    allPackages.forEach(gov => {
        html += `
        <main class="content" style="margin-bottom: 20px;">
            <div class="section-title">
                <h2>Famous Trips in ${gov.name}</h2>
                <div class="arrows">
                    <button onclick="scrollL(this)"><i class="fa-solid fa-chevron-left"></i></button>
                    <button onclick="scrollR(this)"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="scroll-wrapper">
        `;
        
        gov.trips.forEach(trip => {
            const loc =
                gov.name === "Cairo"
                    ? "As Sawabi, Cairo Governorate"
                    : `${gov.name}, Egypt`;
            const params = new URLSearchParams({
                title: trip.title,
                price: trip.price,
                image: trip.image,
                gov: gov.name,
                loc: loc,
            });
            const detailHref = `../package_details/package-details.html?${params.toString()}`;
            html += `
                <a href="${detailHref}" class="card card--link">
                    <div class="img-box">
                        <img src="${trip.image}" alt="${trip.title.replace(/"/g, "&quot;")}">
                    </div>
                    <div class="info">
                        <h4>${trip.title}</h4>
                        <p>${trip.price}</p>
                    </div>
                </a>
            `;
        });
        
        html += `
            </div>
        </main>
        `;
    });
    
    container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", renderTrips);
