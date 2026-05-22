/**
 * ClearPath Wishlist (localStorage) — shared between pages.
 * Stored as an array of items with stable `id`.
 */
(function () {
    const STORAGE_KEY = "clearpath_wishlist_v1";

    function safeJsonParse(str, fallback) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return fallback;
        }
    }

    function getAll() {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = safeJsonParse(raw, []);
        return Array.isArray(parsed) ? parsed : [];
    }

    function setAll(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        try {
            window.dispatchEvent(new CustomEvent("clearpath:wishlist-changed"));
        } catch (e) {
            // CustomEvent optional
        }
    }

    function normalizeItem(item) {
        const it = item && typeof item === "object" ? item : {};
        const id = String(it.id || "").trim();
        if (!id) return null;

        const type = it.type === "dayuse" ? "dayuse" : "trip";
        const title = String(it.title || "").trim();
        const price = String(it.price || "").trim();
        const image = String(it.image || "").trim();
        const href = String(it.href || "").trim();
        const gov = it.gov ? String(it.gov).trim() : "";
        const location = it.location ? String(it.location).trim() : "";

        return {
            id,
            type,
            title,
            price,
            image,
            href,
            gov,
            location,
            savedAt: typeof it.savedAt === "number" ? it.savedAt : Date.now(),
        };
    }

    function upsert(item) {
        const it = normalizeItem(item);
        if (!it) return { ok: false };

        const all = getAll();
        const idx = all.findIndex((x) => x && x.id === it.id);
        if (idx >= 0) {
            all[idx] = { ...all[idx], ...it, savedAt: Date.now() };
        } else {
            all.unshift(it);
        }
        setAll(all);
        return { ok: true, item: it };
    }

    function remove(id) {
        const safeId = String(id || "").trim();
        if (!safeId) return { ok: false };
        const all = getAll().filter((x) => x && x.id !== safeId);
        setAll(all);
        return { ok: true };
    }

    function has(id) {
        const safeId = String(id || "").trim();
        if (!safeId) return false;
        return getAll().some((x) => x && x.id === safeId);
    }

    function toggle(item) {
        const it = normalizeItem(item);
        if (!it) return { ok: false, saved: false };
        if (has(it.id)) {
            remove(it.id);
            return { ok: true, saved: false, item: it };
        }
        upsert(it);
        return { ok: true, saved: true, item: it };
    }

    // Small, stable hash for IDs (non-crypto).
    function hashId(str) {
        const s = String(str || "");
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
        }
        // Convert to unsigned base36.
        return (h >>> 0).toString(36);
    }

    window.ClearPathWishlist = {
        STORAGE_KEY,
        getAll,
        setAll,
        upsert,
        remove,
        has,
        toggle,
        hashId,
    };
})();

