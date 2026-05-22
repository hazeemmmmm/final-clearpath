(function () {
    function getSaveButton() {
        const row = document.querySelector(".package-actions-row");
        if (!row) return null;
        return row.querySelector('button[aria-label="Save"]');
    }

    function getPackageFromQuery() {
        const p = new URLSearchParams(window.location.search);
        const title = p.get("title") || document.getElementById("pkgTitle")?.textContent || "Package";
        const price = p.get("price") || document.getElementById("pkgPriceLine")?.textContent || "";
        const image = p.get("image") || document.querySelector(".package-gallery img")?.getAttribute("src") || "";
        const gov = p.get("gov") || (document.body && document.body.dataset.packageGov) || "";
        const loc = p.get("loc") || (gov ? `${gov}, Egypt` : "Egypt");

        const idBase = ["trip", title, price, gov, image].join("|");
        const id = "trip_" + window.ClearPathWishlist.hashId(idBase);

        // Use current URL (keeps query params so we can open same package again)
        const href = window.location.pathname.split("/").pop() + window.location.search;

        return {
            id,
            type: "trip",
            title,
            price: price.replace(/^From\s+/i, ""),
            image,
            gov,
            location: loc,
            href,
        };
    }

    function setSavedUI(btn, saved) {
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
    }

    function init() {
        const api = window.ClearPathWishlist;
        if (!api) return;

        const btn = getSaveButton();
        if (!btn) return;

        const pkg = getPackageFromQuery();

        // initial state
        setSavedUI(btn, api.has(pkg.id));

        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const res = api.toggle(pkg);
            if (res && res.ok) {
                setSavedUI(btn, !!res.saved);
            }
        });

        window.addEventListener("clearpath:wishlist-changed", function () {
            setSavedUI(btn, api.has(pkg.id));
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

