/* ============================
   ANONLAB — HOME NEWS
   Versione 1011 (Immagini WebP ottimizzate + Lazy Load)
============================ */

const HOME_NEWS_VERSION = "1010";
const HOME_NEWS_DEFAULT_IMAGE = "https://anonlab.it/img/cloud-hosting.jpg";
const HOME_NEWS_ENDPOINT = `https://angelonline.altervista.org/api/news-proxy.php?source=all&v=${HOME_NEWS_VERSION}`;

const HOME_NEWS_FALLBACK = [
    {
        title: "AnonLab Cyber News",
        description: "Le fonti RSS non sono temporaneamente disponibili.",
        pubDate: new Date().toISOString(),
        categories: ["Cybersecurity"],
        image: HOME_NEWS_DEFAULT_IMAGE,
        link: "https://anonlab.it/cyber.html",
        source: "AnonLab"
    }
];

function escapeHtml(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function safeUrl(value, fallback = "#") {
    try {
        const url = new URL(String(value || ""), window.location.href);
        if (url.protocol === "http:" || url.protocol === "https:") {
            return url.href;
        }
    } catch (error) {
        console.warn("URL non valida:", value);
    }
    return fallback;
}

function optimizeNewsImageUrl(url) {
    if (!url || url === HOME_NEWS_DEFAULT_IMAGE) return HOME_NEWS_DEFAULT_IMAGE;

    // 1. Immagini Blogger/Google: ridimensiona nativamente in WebP (480px)
    if (/blogger\.googleusercontent\.com|bp\.blogspot\.com/i.test(url)) {
        return url
            .replace(/\/s\d+(?:-[^/]+)?\//i, "/s480-rw/")
            .replace(/=s\d+(?:-[^&]+)?$/i, "=s480-rw");
    }

    // 2. Immagini locali anonlab.it: lasciale invariate
    if (/^https?:\/\/(www\.)?anonlab\.it\//i.test(url)) {
        return url;
    }

    // 3. Altre immagini esterne RSS: ottimizza a 480x308 WebP
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=480&h=308&fit=cover&output=webp`;
}

// ⭐ NORMALIZZAZIONE UNIVERSALE
function normalizeItem(item = {}) {
    let cat = "News";
    if (Array.isArray(item.categories) && item.categories.length > 0) {
        cat = item.categories[0];
    } else if (typeof item.category === "string" && item.category.trim() !== "") {
        cat = item.category;
    }

    const imageValue =
        item.img ||
        item.image ||
        item.thumbnail ||
        item.image_url ||
        item.imageUrl ||
        item.enclosureUrl ||
        "";

    const descValue =
        item.excerpt ||
        item.description ||
        item.summary ||
        item.content ||
        "";

    const dateValue =
        item.time ||
        item.pubDate ||
        item.published ||
        item.updated ||
        item.date ||
        "";

    const originalImage = safeUrl(imageValue, HOME_NEWS_DEFAULT_IMAGE);

    return {
        title: String(item.title || "Notizia senza titolo").trim(),
        description: String(descValue).trim(),
        link: safeUrl(item.link || item.url || "", "#"),
        image: optimizeNewsImageUrl(originalImage),
        fallbackImage: originalImage,
        pubDate: String(dateValue).trim(),
        category: String(cat).trim(),
        source: String(item.source || "Feed Cyber").trim()
    };
}

function getTimestamp(item) {
    const timestamp = Date.parse(item.pubDate || "");
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getExcerpt(value, maxLength = 160) {
    const text = String(value || "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!text) return "Nessuna descrizione disponibile.";
    return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
}

function removeDuplicates(items) {
    const seen = new Set();
    return items.filter(item => {
        const key = item.link || item.title;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function renderNews(container, rawItems) {
    const items = removeDuplicates(
        rawItems
            .map(normalizeItem)
            .filter(item => item.title && item.link !== "#")
    ).slice(0, 8);

    if (!items.length) {
        renderError(container, "Nessuna notizia valida disponibile al momento.");
        return;
    }

    container.innerHTML = items.map((item, index) => {
        const title = escapeHtml(item.title);
        const description = escapeHtml(getExcerpt(item.description));
        const category = escapeHtml(item.category);
        const image = escapeHtml(item.image);
        const fallbackImage = escapeHtml(item.fallbackImage);
        const link = escapeHtml(item.link);
        const source = escapeHtml(item.source);

        let displayDate = item.pubDate;
        const ts = getTimestamp(item);
        if (ts > 0) {
            displayDate = new Date(ts).toLocaleDateString("it-IT");
        } else if (!displayDate) {
            displayDate = "Oggi";
        }

        return `
            <article class="news-card" id="news-${index + 1}">
                <img
                    src="${image}"
                    data-fallback="${fallbackImage}"
                    class="news-thumb"
                    width="140"
                    height="90"
                    alt="${title}"
                    loading="lazy"
                    decoding="async"
                    style="aspect-ratio: 140/90; object-fit: cover;"
                    onerror="if(this.dataset.fallback && this.src !== this.dataset.fallback){this.src=this.dataset.fallback;}else{this.onerror=null;this.src='${HOME_NEWS_DEFAULT_IMAGE}';}"
                >

                <div class="news-content">
                    <h3 class="news-title">${title}</h3>

                    <div class="news-meta">
                        <span class="news-category">${category}</span>
                        <span class="news-time">${escapeHtml(displayDate)}</span>
                    </div>

                    <p class="news-excerpt">${description}</p>

                    <a
                        href="${link}"
                        class="news-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Leggi l'articolo: ${title}"
                        style="display: inline-flex; align-items: center; min-height: 44px; padding: 6px 12px;"
                    >
                        Leggi l'articolo →
                    </a>

                    <small class="news-source">Fonte: ${source}</small>
                </div>
            </article>
        `;
    }).join("");
}

function renderError(container, message) {
    container.innerHTML = `
        <article class="news-card">
            <img src="${HOME_NEWS_DEFAULT_IMAGE}" class="news-thumb" width="140" height="90" alt="News AnonLab" loading="lazy" decoding="async">
            <div class="news-content">
                <h3 class="news-title">News temporaneamente non disponibili</h3>
                <p class="news-excerpt">${escapeHtml(message)}</p>
            </div>
        </article>
    `;
}

async function fetchNewsFromProxy() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(HOME_NEWS_ENDPOINT, {
            method: "GET",
            mode: "cors",
            credentials: "omit",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();

        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.items)) return data.items;

        throw new Error("Formato JSON non riconosciuto");
    } finally {
        clearTimeout(timeoutId);
    }
}

async function loadHomeNews() {
    const container = document.getElementById("home-news");
    if (!container) return;

    try {
        const items = await fetchNewsFromProxy();
        renderNews(container, items);
    } catch (error) {
        console.warn("Proxy non disponibile, carico fallback:", error);
        renderNews(container, HOME_NEWS_FALLBACK);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("home-news");
    if (!container) return;

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            if (entries.some(e => e.isIntersecting)) {
                obs.disconnect();
                loadHomeNews();
            }
        }, { rootMargin: "500px" });
        observer.observe(container);
    } else {
        loadHomeNews();
    }
});
