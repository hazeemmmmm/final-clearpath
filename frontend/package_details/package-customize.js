/**
 * 10 customizable activities per governorate (matches trips_data.js regions).
 */
const ACTIVITIES_BY_GOV = {
    Cairo: [
        "Giza Pyramids & Sphinx guided visit",
        "Egyptian Museum (Tahrir) highlights tour",
        "Khan el-Khalili bazaar & coffee stop",
        "Saladin Citadel & Muhammad Ali Mosque",
        "Old Cairo: hanging church & Ben Ezra",
        "Nile felucca ride at sunset",
        "Cairo Tower panorama & photos",
        "Al-Azhar Park walk with city views",
        "Islamic Cairo lane walk (Muizz street)",
        "Dinner cruise with oriental show on the Nile",
    ],
    Alexandria: [
        "Bibliotheca Alexandrina guided tour",
        "Qaitbay Citadel & harbour walk",
        "Corniche stroll & Mediterranean views",
        "Roman Amphitheater visit",
        "Montaza Palace gardens & royal beach",
        "Catacombs of Kom el-Shoqafa",
        "Pompey's Pillar & underground galleries",
        "Stanley Bridge & Stanley neighbourhood",
        "Seafood lunch at a local restaurant",
        "Library manuscript museum (if open)",
    ],
    Luxor: [
        "Valley of the Kings (tombs entry)",
        "Karnak Temple complex walk",
        "Luxor Temple at sunset or evening",
        "Hatshepsut Temple (Deir el-Bahari)",
        "Colossi of Memnon photo stop",
        "Hot-air balloon at sunrise (optional)",
        "Nile felucca toward Banana Island",
        "Luxor Museum artefacts tour",
        "Medinet Habu temple visit",
        "West Bank scenic bike or tuk-tuk loop",
    ],
    Aswan: [
        "Philae Temple by motorboat",
        "Abu Simbel day trip (early start)",
        "Nubian village visit & tea",
        "Felucca around Elephantine Island",
        "Unfinished Obelisk quarry site",
        "Aswan High Dam viewpoint",
        "Kitchener Island botanical garden",
        "Traditional Nubian dinner experience",
        "Sunset sail on a felucca",
        "Aswan spice & souk stroll",
    ],
    "South Sinai": [
        "Sharm El Sheikh beach & bay time",
        "Ras Mohammed snorkeling by boat",
        "Dahab Blue Hole & lagoon snorkel",
        "Mount Sinai sunrise hike (optional night)",
        "St. Catherine's Monastery visit",
        "Coloured Canyon jeep safari",
        "Tiran Island boat & snorkeling",
        "Bedouin tea in the desert",
        "Boat snorkeling with lunch",
        "Naama Bay evening walk & cafés",
    ],
    "Red Sea": [
        "Hurghada reef snorkeling or intro dive",
        "Giftun Island full-day boat trip",
        "Orange Bay or white-sand beach stop",
        "Desert quad bike to Bedouin camp",
        "Dolphin watching & swim stop",
        "Glass-bottom boat or semi-submarine",
        "El Gouna lagoons & marina walk",
        "Mangrove channel kayak or SUP",
        "Seafood dinner by the marina",
        "Marina promenade sunset time",
    ],
    Matrouh: [
        "Siwa salt lakes & floating photo stop",
        "Cleopatra Spring swim & relax",
        "Shali Fortress climb & old town views",
        "Oracle Temple of Amun visit",
        "Great Sand Sea 4×4 dunes",
        "Fatnas Island sunset & tea",
        "Traditional Siwi lunch with dates",
        "Cleopatra bath & hot spring dip",
        "Desert camp evening (optional)",
        "Bike loop around the oasis",
    ],
    Fayoum: [
        "Wadi El Rayan waterfalls & lakes",
        "Magic Lake picnic & sand dunes",
        "Tunis village pottery workshop",
        "Whale Valley (Wadi Hitan) fossils",
        "Qarun Lake birdwatching stop",
        "Wadi Hitan visitor centre & trail",
        "Horse or donkey cart countryside ride",
        "Fayoum city old market walk",
        "Sandboarding on dunes (seasonal)",
        "Traditional Egyptian lunch in Tunis",
    ],
    Giza: [
        "Giza Plateau: pyramids & Sphinx up close",
        "Grand Egyptian Museum highlights",
        "Saqqara Step Pyramid complex",
        "Dahshur Bent & Red Pyramids",
        "Pyramids Sound & Light show (evening)",
        "Short camel ride with pyramid backdrop",
        "Panorama point photos & free time",
        "Papyrus or perfume demo (optional)",
        "Solar boat museum (if open)",
        "Lunch with pyramid view",
    ],
    "New Valley": [
        "White Desert national park formations",
        "Crystal Mountain stop & photos",
        "Black Desert volcanic hills",
        "Farafra hot springs dip",
        "Overnight desert camp under stars",
        "Sandboarding on white dunes",
        "4×4 ridge-line adventure",
        "Bedouin-style dinner in camp",
        "Stargazing & quiet desert time",
        "Oasis village walk & tea house",
    ],
};

function getPackageGov() {
    const fromBody = document.body && document.body.dataset.packageGov;
    if (fromBody) return fromBody;
    const p = new URLSearchParams(window.location.search);
    return p.get("gov") || "Cairo";
}

function renderCustomizeActivities() {
    const gov = getPackageGov();
    const list = ACTIVITIES_BY_GOV[gov] || ACTIVITIES_BY_GOV.Cairo;
    const container = document.getElementById("customizeActivitiesList");
    const regionEl = document.getElementById("customizeModalRegion");
    if (!container) return;

    if (regionEl) regionEl.textContent = gov;

    container.innerHTML = "";
    list.forEach(function (label, i) {
        const row = document.createElement("label");
        row.className = "activity-item";
        row.setAttribute("for", "act-" + i);
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.id = "act-" + i;
        cb.name = "pkg-activity";
        cb.value = String(i);
        const span = document.createElement("span");
        span.textContent = label;
        row.appendChild(cb);
        row.appendChild(span);
        container.appendChild(row);
    });
}

function openCustomizeModal() {
    renderCustomizeActivities();
    const m = document.getElementById("customizeModal");
    if (m) m.style.display = "block";
}

function closeCustomizeModal() {
    const m = document.getElementById("customizeModal");
    if (m) m.style.display = "none";
}

function saveCustomizeSelection() {
    const container = document.getElementById("customizeActivitiesList");
    if (!container) return;

    const selected = [];
    container.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
        const span = cb.nextElementSibling;
        if (span) selected.push(span.textContent);
    });

    if (selected.length === 0) {
        alert("Please choose at least one activity for your trip.");
        return;
    }

    const gov = getPackageGov();
    const summary =
        "Region: " + gov + "\n\nSelected activities (" + selected.length + "):\n\n• " + selected.join("\n• ");
    alert(summary);
    closeCustomizeModal();
}

window.openCustomizeModal = openCustomizeModal;
window.closeCustomizeModal = closeCustomizeModal;
window.saveCustomizeSelection = saveCustomizeSelection;
