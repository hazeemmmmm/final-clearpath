const I18N_STORAGE_KEY = "clearpath_lang";

var whenPickerInstance = null;
var flatpickrDefaultLocale = null;

const translations = {
    EN: {
        pageTitle: "ClearPath | Tourism Egypt",
        navHome: "🏠 Homes",
        navExperiences: "Experiences",
        navContact: "📞 Contact Us",
        btnLogin: "Login",
        btnRegister: "Register",
        modalLogin: "Login",
        phEmail: "Email Address",
        phPassword: "Password",
        modalContinue: "Continue",
        expChoose: "Choose Experience",
        expSubtitle: "What kind of adventure are you looking for?",
        expTrips: "Trips",
        expDayuse: "Dayuse",
        searchWhere: "Where",
        phSearchDest: "Search destinations",
        searchWhen: "When",
        phAddDates: "Add dates",
        searchWho: "Who",
        phAddGuests: "Add guests",
        guestAdults: "Adults",
        guestAdultsSub: "Ages 13 or above",
        guestChildren: "Children",
        guestChildrenSub: "Ages 2 – 12",
        guestInfants: "Infants",
        guestInfantsSub: "Under 2",
        guestPets: "Pets",
        guestPetsSub: "Bringing a service animal?",
        sectionCairo: "Popular stays in Cairo",
        sectionGiza: "Popular stays in Giza",
        sectionAlex: "Popular stays in Alexandria",
        sectionMatrouh: "Popular stays in Matrouh",
        sectionDahab: "Popular stays in Dahab",
        sectionNorthCoast: "Popular stays in North Coast",
        heroDiscover: "DISCOVER",
        heroEgypt: "EGYPT",
        heroSubtitle: "Where History Begins and Wonders Never End",
        heroDescription: "Explore the treasures of an ancient land, from the timeless pyramids to the beauty of the Nile.",
        heroCta: "Explore Now",
        heroProtocol: "Our Protocol",
        protocolTitle: "Our Protocol",
        protocolTransportTitle: "Transportation",
        protocolTransportDesc: "From the moment you arrive until your departure, we ensure a seamless experience. We provide dedicated transportation from the airport to your target destination, and back upon the completion of your program.",
        protocolHotelTitle: "Accommodation & Dining",
        protocolHotelDesc: "When you choose a Trip or Dayuse program, we recommend premium hotels perfectly tailored to your package. However, this is completely optional—you are free to choose any other hotel or location you prefer. If you opt for our recommended stay, it includes complimentary access to a lavish open-buffet breakfast served until 1:00 PM, alongside exceptional lunch and dinner experiences.",
        highlightHistoryTitle: "Ancient History",
        highlightHistoryText: "Walk through thousands of years of history.",
        highlightPlacesTitle: "Beautiful Places",
        highlightPlacesText: "From the Nile to the Red Sea, beauty is everywhere.",
        highlightExperienceTitle: "Unforgettable Experiences",
        highlightExperienceText: "Live unique adventures you'll never forget.",
        highlightMemoriesTitle: "Memories",
        highlightMemoriesText: "Capture moments that last a lifetime.",
        footerRights: "© 2026 ClearPath. All rights reserved.",
        guestWord: "guest",
        guestWordPlural: "guests",
        infantWord: "infant",
        infantWordPlural: "infants",
        petWord: "pet",
        petWordPlural: "pets",
    },
    AR: {
        pageTitle: "ClearPath | السياحة في مصر",
        navHome: "🏠 الرئيسية",
        navExperiences: "التجارب",
        navContact: "📞 اتصل بنا",
        btnLogin: "تسجيل الدخول",
        btnRegister: "إنشاء حساب",
        modalLogin: "تسجيل الدخول",
        phEmail: "البريد الإلكتروني",
        phPassword: "كلمة المرور",
        modalContinue: "متابعة",
        expChoose: "اختر التجربة",
        expSubtitle: "ما نوع المغامرة التي تبحث عنها؟",
        expTrips: "رحلات",
        expDayuse: "يوم استجمام",
        searchWhere: "أين",
        phSearchDest: "ابحث عن الوجهات",
        searchWhen: "متى",
        phAddDates: "أضف التواريخ",
        searchWho: "من",
        phAddGuests: "أضف الضيوف",
        guestAdults: "بالغون",
        guestAdultsSub: "13 سنة فأكثر",
        guestChildren: "أطفال",
        guestChildrenSub: "من 2 إلى 12 سنة",
        guestInfants: "رضع",
        guestInfantsSub: "أقل من سنتين",
        guestPets: "حيوانات أليفة",
        guestPetsSub: "إحضار حيوان خدمة؟",
        sectionCairo: "إقامات شهيرة في القاهرة",
        sectionGiza: "إقامات شهيرة في الجيزة",
        sectionAlex: "إقامات شهيرة في الإسكندرية",
        sectionMatrouh: "إقامات شهيرة في مطروح",
        sectionDahab: "إقامات شهيرة في دهب",
        sectionNorthCoast: "إقامات شهيرة في الساحل الشمالي",
        heroDiscover: "اكتشف",
        heroEgypt: "مصر",
        heroSubtitle: "حيث يبدأ التاريخ ولا تنتهي العجائب",
        heroDescription: "اكتشف كنوز أرض عريقة، من الأهرامات الخالدة إلى جمال النيل.",
        heroCta: "استكشف الآن",
        heroProtocol: "البروتوكول الخاص بنا",
        protocolTitle: "البروتوكول الخاص بنا",
        protocolTransportTitle: "الانتقالات",
        protocolTransportDesc: "من لحظة وصولك وحتى مغادرتك، نضمن لك تجربة سلسة. نوفر لك وسائل نقل مخصصة من المطار إلى وجهتك المطلوبة، ونعيدك مرة أخرى بعد انتهاء برنامجك.",
        protocolHotelTitle: "الإقامة وتناول الطعام",
        protocolHotelDesc: "عندما تختار برنامج رحلات أو يوم استجمام (Dayuse)، نوصي بفنادق مميزة تناسب باقتك تمامًا. ومع ذلك، هذا الخيار اختياري تمامًا، حيث يمكنك الإقامة في أي فندق أو مكان آخر تفضله. وفي حال اختيارك لإقامتنا الموصى بها، ستتضمن إقامتك 3 وجبات يوميًا تشمل إمكانية الدخول المجاني إلى بوفيه إفطار مفتوح فاخر يقدم حتى الساعة 1:00 ظهرًا، بالإضافة إلى وجبتي الغداء والعشاء.",
        highlightHistoryTitle: "تاريخ عريق",
        highlightHistoryText: "سر عبر آلاف السنين من التاريخ.",
        highlightPlacesTitle: "أماكن ساحرة",
        highlightPlacesText: "من النيل إلى البحر الأحمر، الجمال في كل مكان.",
        highlightExperienceTitle: "تجارب لا تُنسى",
        highlightExperienceText: "عِش مغامرات مميزة لن تنساها.",
        highlightMemoriesTitle: "ذكريات",
        highlightMemoriesText: "التقط لحظات تدوم مدى الحياة.",
        footerRights: "© 2026 ClearPath. جميع الحقوق محفوظة.",
        guestWord: "ضيف",
        guestWordPlural: "ضيوف",
        infantWord: "رضيع",
        infantWordPlural: "رضع",
        petWord: "حيوان أليف",
        petWordPlural: "حيوانات أليفة",
    },
};

function getCurrentLang() {
    const v = localStorage.getItem(I18N_STORAGE_KEY);
    return v === "AR" || v === "EN" ? v : "EN";
}

function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    document.documentElement.lang = lang === "AR" ? "ar" : "en";
    document.documentElement.dir = lang === "AR" ? "rtl" : "ltr";
    document.body.classList.toggle("lang-ar", lang === "AR");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (key && t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (key && t[key] !== undefined) el.placeholder = t[key];
    });

    const isHomePage = !!document.getElementById("searchBar") || !!document.querySelector(".hero-section");
    if (isHomePage) {
        document.title = t.pageTitle;
    }

    const cur = document.getElementById("currentLang");
    if (cur) cur.textContent = lang;

    if (isHomePage) {
        document.querySelectorAll(".card .info p").forEach((p) => {
            if (!p.dataset.priceEn) p.dataset.priceEn = p.textContent.trim();
            const m = p.dataset.priceEn.match(/^([\d,]+)\s*EGP\s*\/\s*night$/i);
            if (m) {
                p.textContent = lang === "AR" ? `${m[1]} ج.م / ليلة` : p.dataset.priceEn;
            }
        });
    }

    if (whenPickerInstance && window.flatpickr) {
        try {
            if (lang === "AR" && flatpickr.l10ns && flatpickr.l10ns.ar) {
                whenPickerInstance.set("locale", flatpickr.l10ns.ar);
            } else if (flatpickrDefaultLocale !== null) {
                whenPickerInstance.set("locale", flatpickrDefaultLocale);
            }
        } catch (e) {
            /* flatpickr locale optional */
        }
    }

    updateGuestDisplay();
}

window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    window.scrollY > 20 ? nav.classList.add("shrink") : nav.classList.remove("shrink");
});

function toggleLang() {
    document.getElementById("langMenu").classList.toggle("show");
}

function changeLang(lang, e) {
    if (e) e.preventDefault();
    localStorage.setItem(I18N_STORAGE_KEY, lang);
    applyTranslations(lang);
    document.getElementById("langMenu").classList.remove("show");
}

const modal = document.getElementById("authModal");
const modalTitle = document.getElementById("modalTitle");

function openAuth(type) {
    modal.style.display = "block";
    modalTitle.innerText = type === 'login' ? 'Login' : 'Create Account';
}

function scrollL(btn) {
    const container = btn.closest('main').querySelector('.scroll-wrapper');
    container.scrollBy({ left: -350, behavior: 'smooth' });
}

function scrollR(btn) {
    const container = btn.closest('main').querySelector('.scroll-wrapper');
    container.scrollBy({ left: 350, behavior: 'smooth' });
}

function scrollToPackages() {
    const target = document.getElementById("availablePackages");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeAuth() {
    modal.style.display = "none";
}

const experiencesModal = document.getElementById("experiencesModal");

function openExperiences(e) {
    if (e) e.preventDefault();
    if (experiencesModal) {
        experiencesModal.style.display = "block";
    }
}

function closeExperiences() {
    if (experiencesModal) {
        experiencesModal.style.display = "none";
    }
}

window.onclick = function(event) {
    if (event.target == modal) closeAuth();
    if (experiencesModal && event.target == experiencesModal) closeExperiences();
    const customizeModalEl = document.getElementById("customizeModal");
    if (customizeModalEl && event.target === customizeModalEl && typeof window.closeCustomizeModal === "function") {
        window.closeCustomizeModal();
    }
    if (!event.target.matches('.dropbtn')) {
        const langMenu = document.getElementById("langMenu");
        if (langMenu) langMenu.classList.remove("show");
    }
}

function focusInput(item) {
    const allItems = document.querySelectorAll('.search-item');
    allItems.forEach(el => el.classList.remove('active'));
    
    item.classList.add('active');
    
    const searchBar = document.getElementById('searchBar');
    if (searchBar) searchBar.classList.add('active-bar');

    const input = item.querySelector('input');
    if (input) input.focus();
}

document.addEventListener('click', (e) => {
    const searchBar = document.getElementById('searchBar');
    const dropdown = document.getElementById('locationDropdown');
    const whereItem = document.getElementById('whereItem');
    
    if (dropdown && whereItem && !whereItem.contains(e.target)) {
        dropdown.classList.remove('show');
    }
    
    const guestDropdown = document.getElementById('guestDropdown');
    const whoItem = document.getElementById('whoItem');
    if (guestDropdown && whoItem && !whoItem.contains(e.target)) {
        guestDropdown.classList.remove('show');
    }

    if(searchBar && !searchBar.contains(e.target) && e.target.id !== 'navbar') {
        const allItems = document.querySelectorAll('.search-item');
        allItems.forEach(el => el.classList.remove('active'));
        searchBar.classList.remove('active-bar');
    }
});

const egyptLocations = [
    "Alexandria, Alexandria Governorate",
    "Ain Sokhna, Ataka Qism",
    "El Gouna, Second Hergada Qism",
    "Hurghada, Second Hergada Qism",
    "Aswan",
    "Cairo, Cairo Governorate",
    "Luxor, Luxor Governorate",
    "Sharm El-Sheikh, South Sinai Governorate",
    "Dahab, South Sinai Governorate",
    "Siwa, Matrouh Governorate"
];

function filterLocations() {
    const input = document.getElementById("whereInput");
    const filter = input.value.toUpperCase();
    const dropdown = document.getElementById("locationDropdown");
    
    dropdown.innerHTML = "";
    
    if (!filter) {
        dropdown.classList.remove("show");
        return;
    }
    
    let hasMatches = false;
    
    egyptLocations.forEach(loc => {
        if (loc.toUpperCase().indexOf(filter) > -1) {
            hasMatches = true;
            
            const div = document.createElement("div");
            div.className = "location-item-dropdown";
            
            const regex = new RegExp(`(${filter})`, "gi");
            const highlightLoc = loc.replace(regex, "<strong>$1</strong>");
            
            div.innerHTML = `
                <div class="location-icon"><i class="fa-solid fa-location-dot"></i></div>
                <div class="location-text">
                    <span class="location-main">${highlightLoc}</span>
                </div>
            `;
            
            div.onclick = function(e) {
                e.stopPropagation();
                input.value = loc.split(',')[0];
                dropdown.classList.remove("show");
            };
            
            dropdown.appendChild(div);
        }
    });
    
    if (hasMatches) {
        dropdown.classList.add("show");
    } else {
        dropdown.classList.remove("show");
    }
}

const whereInput = document.getElementById('whereInput');
if (whereInput) {
    whereInput.addEventListener('focus', function() {
        if (this.value) {
            filterLocations();
        }
    });
}

// Initialize Flatpickr for the "When" date input
document.addEventListener("DOMContentLoaded", function() {
    // Splash Screen Logic
    const splash = document.getElementById("splashScreen");
    if (splash) {
        // Prevent background scrolling while splash is visible
        document.body.style.overflow = "hidden";
        
        // Wait 20 seconds as requested by the user
        setTimeout(() => {
            splash.classList.add("hidden");
            document.body.style.overflow = "auto";
            
            // Remove from DOM after CSS transition finishes
            setTimeout(() => {
                splash.remove();
            }, 1000);
        }, 5000);
    }

    const whenInput = document.getElementById("whenInput");
    if (whenInput) {
        whenPickerInstance = flatpickr(whenInput, {
            mode: "range",
            minDate: "today",
            showMonths: 2,
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "M j",
            onOpen: function(selectedDates, dateStr, instance) {
                const searchBar = document.getElementById('searchBar');
                if (searchBar) searchBar.classList.add('active-bar');
            }
        });
        flatpickrDefaultLocale = whenPickerInstance.config.locale;
    }

    const saved = getCurrentLang();
    applyTranslations(saved);

    const whoItem = document.getElementById('whoItem');
    if (whoItem) {
        whoItem.addEventListener('click', function(e) {
            const guestDropdown = document.getElementById('guestDropdown');
            if (guestDropdown && !guestDropdown.classList.contains('show')) {
                guestDropdown.classList.add('show');
            }
        });
    }
    
    // Initialize buttons
    ['adults', 'children', 'infants', 'pets'].forEach(updateCircleBtns);
});

let guests = { adults: 0, children: 0, infants: 0, pets: 0 };

function updateGuest(type, change, event) {
    if (event) event.stopPropagation();
    
    let current = guests[type];
    if (change === -1 && current === 0) return;
    
    // Enforce max limit of 4
    if (change === 1) {
        if (type === 'adults' || type === 'children') {
            // Need +1 for the adult that gets auto-added if clicking child when adult=0
            let projectedExtra = (guests.adults === 0 && type !== 'adults') ? 2 : 1;
            if ((guests.adults + guests.children + projectedExtra - 1) >= 4) return;
        } else {
            if (guests[type] >= 4) return;
        }
    }
    
    if (change === 1 && type !== 'adults' && guests.adults === 0) {
        guests.adults = 1;
        document.getElementById('adultsCount').innerText = guests.adults;
    }
    
    guests[type] += change;
    
    if (type === 'adults' && guests.adults === 0) {
        guests.children = 0;
        guests.infants = 0;
        guests.pets = 0;
        ['children', 'infants', 'pets'].forEach(t => {
            let el = document.getElementById(t + 'Count');
            if(el) el.innerText = 0;
        });
    }
    
    document.getElementById(type + 'Count').innerText = guests[type];
    ['adults', 'children', 'infants', 'pets'].forEach(updateCircleBtns);
    updateGuestDisplay();
}

function updateCircleBtns(type) {
    const el = document.getElementById(type + 'Count');
    if (!el) return;
    
    const btnMinus = el.previousElementSibling;
    if (btnMinus) {
        btnMinus.disabled = guests[type] === 0;
    }
    
    const btnPlus = el.nextElementSibling;
    if (btnPlus) {
        if (type === 'adults' || type === 'children') {
            btnPlus.disabled = (guests.adults + guests.children) >= 4;
        } else {
            btnPlus.disabled = guests[type] >= 4;
        }
    }
}

function updateGuestDisplay() {
    let totalGuests = guests.adults + guests.children;
    let parts = [];
    const lang = getCurrentLang();
    const t = translations[lang] || translations.EN;

    if (totalGuests > 0) {
        parts.push(`${totalGuests} ${totalGuests > 1 ? t.guestWordPlural : t.guestWord}`);
    }
    if (guests.infants > 0) {
        parts.push(`${guests.infants} ${guests.infants > 1 ? t.infantWordPlural : t.infantWord}`);
    }
    if (guests.pets > 0) {
        parts.push(`${guests.pets} ${guests.pets > 1 ? t.petWordPlural : t.petWord}`);
    }

    const whoInput = document.getElementById('whoInput');
    if (whoInput) {
        if (parts.length > 0) {
            whoInput.value = lang === "AR" ? parts.join("، ") : parts.join(", ");
        } else {
            whoInput.value = '';
        }
    }
}

// Modal logic for Home Page "Explore Now" Flow
function openStayTypeModal() {
    const stayTypeModal = document.getElementById('stayTypeModal');
    if (stayTypeModal) stayTypeModal.style.display = 'block';
}

function closeStayTypeModal() {
    const stayTypeModal = document.getElementById('stayTypeModal');
    if (stayTypeModal) stayTypeModal.style.display = 'none';
}

function openDestinationModal(type) {
    closeStayTypeModal();
    const destinationsModal = document.getElementById('destinationsModal');
    const selectedStayTypeText = document.getElementById('selectedStayTypeText');
    if (destinationsModal) {
        if (selectedStayTypeText) {
            selectedStayTypeText.textContent = 'Showing ' + type + ' for: Where would you like to go?';
        }
        destinationsModal.style.display = 'block';
    }
}

function closeDestinationsModal() {
    const destinationsModal = document.getElementById('destinationsModal');
    if (destinationsModal) destinationsModal.style.display = 'none';
}

function goToDestination(locationId) {
    window.location.href = '../destinations/package_locations.html#' + locationId;
}

window.addEventListener('click', function(event) {
    const stayTypeModal = document.getElementById('stayTypeModal');
    const destinationsModal = document.getElementById('destinationsModal');
    const protocolModal = document.getElementById('protocolModal');
    if (event.target == stayTypeModal) {
        closeStayTypeModal();
    }
    if (event.target == destinationsModal) {
        closeDestinationsModal();
    }
    if (event.target == protocolModal) {
        closeProtocolModal();
    }
});

// Modal logic for Protocol Modal
function openProtocolModal() {
    const protocolModal = document.getElementById('protocolModal');
    if (protocolModal) protocolModal.style.display = 'block';
}

function closeProtocolModal() {
    const protocolModal = document.getElementById('protocolModal');
    if (protocolModal) protocolModal.style.display = 'none';
}

