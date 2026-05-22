/**
 * Fills package-details.html from URL query params.
 * Gallery images are chosen from the package region (Cairo uses the Cairo image set).
 */
(function () {
    const cairoGallery = [
        "./img/cairo_bazaar_1775972513201.png",
        "./img/cairo_pyramids_1775971845389.png",
        "./img/egyptian_museum_1775972234399.png",
        "./img/nile_cruise_1775972271725.png",
    ];

    const fallbackPool = [
        "./img/cairo_bazaar_1775972513201.png",
        "./img/cairo_pyramids_1775971845389.png",
        "./img/egyptian_museum_1775972234399.png",
        "./img/nile_cruise_1775972271725.png",
        "./img/cairo_pyramids_1775971845389.png",
    ];

    function galleryForGov(govName, mainImage) {
        if (govName === "Cairo") {
            return [...cairoGallery];
        }
        const g = govName || "";
        const hash = g.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
        const imgs = [];
        for (let i = 0; i < 4; i++) {
            imgs.push(fallbackPool[(hash + i * 7) % fallbackPool.length]);
        }
        if (mainImage && !imgs.includes(mainImage)) {
            imgs[0] = mainImage;
        }
        return imgs;
    }

    function parseQuery() {
        const p = new URLSearchParams(window.location.search);
        return {
            title: p.get("title"),
            price: p.get("price"),
            image: p.get("image"),
            gov: p.get("gov"),
        };
    }

    function fill() {
        const q = parseQuery();
        const gov = q.gov || "Cairo";
        if (document.body) document.body.dataset.packageGov = gov;

        const titleEl = document.getElementById("pkgTitle");
        const descEl = document.getElementById("pkgDesc");
        const priceLine = document.getElementById("pkgPriceLine");
        const galleryEls = document.querySelectorAll(".package-gallery img");

        const safeTitle =
            (q.title && String(q.title)) || "Engage with Egyptian life & Bazzar";

        if (titleEl) titleEl.textContent = safeTitle;

        if (descEl) {
            const area = gov === "Cairo" ? "Cairo" : gov || "Egypt";
            descEl.textContent =
                "Engage with local Egyptian culture and life and experience the nightlife — markets, landmarks, and authentic moments around " +
                area +
                ".";
        }

        const mainImg = q.image ? String(q.image) : null;
        const imgs = galleryForGov(gov, mainImg);
        galleryEls.forEach((img, i) => {
            if (imgs[i]) {
                img.src = imgs[i];
                img.alt = safeTitle + " — photo " + (i + 1);
            }
        });

        if (priceLine && q.price) {
            const price = String(q.price);
            const display = price.replace(/person/gi, "guest").replace(/\/\s*person/i, "/ guest");
            priceLine.textContent = "From " + display;
        } else if (priceLine) {
            priceLine.textContent = "From 1,860 EGP / guest";
        }

        document.title = safeTitle + " | ClearPath";
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fill);
    } else {
        fill();
    }
})();
