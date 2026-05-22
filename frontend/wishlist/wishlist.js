(function () {
    function fmtType(type) {
        return type === "dayuse" ? "Dayuse" : "Trip";
    }

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function render() {
        const api = window.ClearPathWishlist;
        if (!api) return;

        const grid = document.getElementById("wishlistGrid");
        const empty = document.getElementById("wishlistEmpty");
        const countEl = document.getElementById("wishlistCount");
        if (!grid || !empty || !countEl) return;

        const items = api.getAll();
        countEl.textContent = String(items.length);

        if (items.length === 0) {
            grid.innerHTML = "";
            empty.style.display = "block";
            return;
        }

        empty.style.display = "none";
        grid.innerHTML = items
            .map((it) => {
                const title = escapeHtml(it.title);
                const price = escapeHtml(it.price);
                const img = escapeHtml(it.image || "");
                const gov = escapeHtml(it.gov || "");
                const loc = escapeHtml(it.location || "");
                const href = escapeHtml(it.href || "");
                const typeLabel = fmtType(it.type);

                const metaGov = gov ? `<span class="meta-chip">${gov}</span>` : "";
                const metaLoc = loc ? `<span class="meta-chip">${loc}</span>` : "";
                const metaType = `<span class="meta-chip meta-chip--pink">${typeLabel}</span>`;

                let targetHref = href;
                if (href) {
                    if (href.startsWith("package-details")) {
                        targetHref = "../package_details/" + href;
                    } else if (href.startsWith("dayuse")) {
                        targetHref = "../dayuse/" + href;
                    } else if (!href.startsWith("../")) {
                        targetHref = "../trips/" + href;
                    }
                }

                const viewBtn = href
                    ? `<a class="btn-outline" href="${targetHref}"><i class="fa-solid fa-arrow-up-right-from-square"></i> View</a>`
                    : `<a class="btn-outline" href="${it.type === "dayuse" ? "../dayuse/dayuse.html" : "../trips/trips.html"}"><i class="fa-solid fa-compass"></i> Browse</a>`;

                return `
                <article class="wishlist-item" data-wishlist-id="${escapeHtml(it.id)}">
                    <div class="img-box">
                        <img src="${img}" alt="${title}">
                    </div>
                    <div class="info">
                        <h4>${title}</h4>
                        <p>${price}</p>
                    </div>
                    <div class="wishlist-meta">
                        ${metaType}
                        ${metaGov}
                        ${metaLoc}
                    </div>
                    <div class="wishlist-item-actions">
                        ${viewBtn}
                        <button type="button" class="btn-outline btn-danger" data-action="remove">
                            <i class="fa-regular fa-trash-can"></i> Remove
                        </button>
                    </div>
                </article>
                `;
            })
            .join("");
    }

    function bind() {
        const api = window.ClearPathWishlist;
        if (!api) return;

        const grid = document.getElementById("wishlistGrid");
        const clearBtn = document.getElementById("btnClearWishlist");

        if (grid) {
            grid.addEventListener("click", function (e) {
                const btn = e.target && e.target.closest ? e.target.closest("button[data-action]") : null;
                if (!btn) return;
                const action = btn.getAttribute("data-action");
                if (action !== "remove") return;

                const card = btn.closest("[data-wishlist-id]");
                if (!card) return;
                const id = card.getAttribute("data-wishlist-id");
                api.remove(id);
                render();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", function () {
                const items = api.getAll();
                if (items.length === 0) return;
                const ok = confirm("Clear all saved items from your wishlist?");
                if (!ok) return;
                api.setAll([]);
                render();
            });
        }

        window.addEventListener("clearpath:wishlist-changed", render);
    }

    document.addEventListener("DOMContentLoaded", function () {
        bind();
        render();
    });
})();

