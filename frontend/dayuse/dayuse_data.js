const dayuseImages = [
    "./img/Basata Echo Camp.webp", "./img/Alexandria seafrontjpg.jpg", "./img/Cairo Down Town Hostel.webp",
    "./img/Dahab Bedouin Camp.webp", "./img/Fayoum lakejpg.jpg", "./img/Lazib Inn Resort.webp",
    "./img/Naama Bay Hotelwebp.webp", "./img/Wadi Gimal Lodge.webp", "./img/hurghada resortwebp.webp",
    "./img/dahab-lagoon.jpg", "./img/Alex city center inn.webp", "./img/Blue Serenity villa.webp",
    "./img/Kato Dool Nubian House.webp", "./img/Sunny Days Duesthouse.webp", "./img/Starlight Beach Camp.webp",
    "./img/coral coast hotelwebp.webp", "./img/Akhenaton grang hotel.webp"
];

const dayuseGovernorates = [
    { name: "Ain Sokhna", themes: ["Porto Sokhna Resort", "Stella Di Mare", "Mövenpick Resort", "Cancun Beach", "Blue Blue Sokhna", "Jaz Little Venice", "Teda Swiss Inn", "Marina Wadi Degla", "Ocean Blue", "Blumar El Sokhna"] },
    { name: "North Coast", themes: ["Marassi Beach", "Hacienda Bay", "Amwaj Resort", "Marina El Alamein", "Almaza Bay", "Bo Islands", "Fouka Bay", "Diplomats Village", "Caesar Bay", "Swan Lake"] },
    { name: "Alexandria", themes: ["Four Seasons San Stefano", "Tolip Hotel", "Paradise Inn Beach", "Hilton Corniche", "Sheraton Montazah", "Steigenberger Cecil", "Aifu Resort", "Windsor Palace", "Borg El Arab Resort", "Africana Hotel"] },
    { name: "Cairo", themes: ["Nile Ritz-Carlton Pool", "Marriott Mena House", "Fairmont Nile City", "Kempinski Nile Pool", "Dusit Thani LakeView", "Grand Nile Tower", "Royal Maxim Palace", "Sofitel El Gezirah", "Triumph Luxury", "The St. Regis"] },
    { name: "Hurghada", themes: ["Steigenberger Aqua Magic", "Desert Rose Resort", "Sunrise Crystal Bay", "Jaz Aquamarine", "Titanic Palace", "Sindbad Club", "Makadi Bay Resort", "Albatros Aqua Park", "Dana Beach Resort", "Hawaii Le Jardin"] },
    { name: "Dahab", themes: ["Blue Hole Camp", "Lagoon Club", "Ali Baba Camp", "Coral Coast Hotel", "Penguin Village", "Dahab Paradise", "Tirana Dahab Resort", "Swiss Inn Resort", "Bedouin Moon Hotel", "Nexthouse Dahab"] },
    { name: "Sharm El-Sheikh", themes: ["Rixos Seagate Break", "Savoy Hotel Pool", "Four Seasons Sharm", "Hyatt Regency", "Coral Sea Waterworld", "Sunrise Arabian Beach", "Baron Resort", "Stella Di Mare Beach", "Reef Oasis Blue Bay", "Sultan Gardens"] },
    { name: "Ras Sedr", themes: ["Mousa Coast Resort", "Matarma Bay", "Green Sudr", "Moon Beach Resort", "La Hacienda", "Golden Beach", "Sinai Stars", "Blue Lagoon Resort", "Paradise Ras Sudr", "Holiday Inn Resort"] },
    { name: "Marsa Matrouh", themes: ["Beau Site Hotel", "Carols Beau Rivage", "Jaz Almaza Resort", "Porto Matrouh Pool", "Adriatica Hotel", "Belle Vue Hotel", "Cleopatra Beach Resort", "Negresco Hotel", "Ghazala Bay", "White Sandy Beach"] },
    { name: "Fayoum", themes: ["Lazib Inn Resort", "Tunis Village Lodge", "Tzila Lodge", "Sobek Lodge", "Byoum Lakeside Hotel", "Zad El Mosafer", "Helnan Auberge", "Kom El Dikka", "Remal El Rayan", "Fayoum Oasis Retreat"] }
];

const dayuseTags = ["Relaxation", "Family Fun", "Aqua Park", "Couples Retreat", "Luxury Pool", "Beach Access", "Chill & Grill", "Sunny Escape", "Water Sports", "VIP Lounge"];

const dayuseVideoOptions = [
    "https://www.youtube.com/embed/zQ8iX0Xyq-M", // Egypt Drone Placeholder
    "https://www.youtube.com/embed/t1Z52sE9E0c", // Egypt Promo
    "https://www.youtube.com/embed/1B1aAXYkE6k"  // Cairo/Pyramids Drone
];

const allDayusePackages = dayuseGovernorates.map((gov, i) => {
    let packages = [];
    for (let j = 0; j < 10; j++) {
        let theme = gov.themes[j];
        let tag = dayuseTags[j % dayuseTags.length];
        let price = Math.floor(Math.random() * 20 + 5) * 100; // random from 500 to 2400 EGP
        let imgIndex = (i * 10 + j) % dayuseImages.length;
        
        let videoUrl;
        let customCover;
        // The very FIRST package globally (Ain Sokhna - Porto Sokhna Resort)
        if (i === 0 && j === 0) {
            customCover = "PUT_YOUR_COVER_IMAGE_LINK_HERE.jpg"; // <-- PASTE YOUR PICTURE LINK HERE
            videoUrl = "https://www.youtube.com/embed/pgX2Kco_1lA";
        } else {
            videoUrl = dayuseVideoOptions[(i + j) % dayuseVideoOptions.length];
        }
        
        packages.push({
            id: `package-${i}-${j}`,
            title: `${theme} - ${tag}`,
            price: price.toLocaleString() + " EGP / person",
            image: dayuseImages[imgIndex],
            location: gov.name,
            video: videoUrl,
            videoCover: customCover,
            description: `Enjoy a perfect dayuse at ${theme} located in ${gov.name}. This package includes pool access, complimentary drinks, and access to select facilities. Treat yourself and your loved ones to an unforgettable escape!`,
            rating: (Math.random() * 1 + 4).toFixed(1) // 4.0 to 5.0
        });
    }
    return { name: gov.name, packages: packages };
});
