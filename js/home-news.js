/* ============================
   ANONLAB — HOME NEWS
   Versione 1005

   Il browser chiama soltanto il proxy PHP
   dello stesso dominio. I feed RSS vengono
   recuperati lato server con cURL.
============================ */

const HOME_NEWS_VERSION = "1005";

const HOME_NEWS_ENDPOINT =
https://angelonline.altervista.org/api/news-proxy.php?source=all&v=${HOME_NEWS_VERSION}`;

const HOME_NEWS_FALLBACK = [
    {
        title: "CTM360 Exposes Global GovTrap Campaign",
        description:
            "Analisi della campagna GovTrap e delle sue implicazioni sulla sicurezza globale.",
        pubDate: new Date().toISOString(),
        categories: ["Cybersecurity"],
        image: "/img/default-news.jpg",
        link: "https://www.ctm360.com/blog/govtrap-campaign",
        source: "fallback"
    },
    {
        title: "Work Moved Into the Browser",
        description:
            "Perché la sicurezza del browser è la nuova frontiera della difesa aziendale.",
        pubDate: new Date().toISOString(),
        categories: ["Security"],
        image: "/img/default-news.jpg",
        link: "https://www.netskope.com/blog/work-moved-into-the-browser-security-didnt",
        source: "fallback"
    },
    {
        title: "Why Your Backups Might Not Save You",
        description:
            "Strategie di resilienza, backup e recupero dopo un incidente informatico.",
        pubDate: new Date().toISOString(),
        categories: ["Resilience"],
        image: "/img/default-news.jpg",
        link: "https://www.rubrik.com/blog/why-your-backups-might-not-save-you",
        source: "fallback"
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
        const url = new URL(String(value), window.location.origin);

        if (url.protocol === "http:" || url.protocol === "https:") {
            return url.href;
        }
    } catch (error) {
        console.warn("URL non valida:", value);
    }

    return fallback;
}

function normalizeItem(item = {}) {
    const categories = Array.isArray(item.categories)
        ? item.categories
        : [];

    const dateValue =
        item.pubDate ||
        item.published ||
        item.updated ||
        item.date ||
        "";

    return {
        title: String(item.title || "Notizia senza titolo").trim(),
        description: String(
            item.description ||
            item.summary ||
            item.content ||
            ""
        ).trim(),
        link: safeUrl(item.link || item.url || "#"),
        image: safeUrl(
            item.image ||
            item.thumbnail ||
            item.image_url ||
            item.imageUrl ||
            "/img/cloud-hosting.jpg",
            "/img/cloud-hosting.jpg"
        ),
        pubDate: String(dateValue).trim(),
        categories: categories
            .map(category => String(category).trim())
            .filter(Boolean),
        source: String(item.source || "feed").trim()
    };
}

function getDate(item) {
    const timestamp = Date.parse(item.pubDate);

    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getCategory(item) {
    return item.categories?.[0] || "News";
}

function getExcerpt(description, maxLength = 160) {
    const clean = String(description || "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!clean) {
        return "Nessuna descrizione disponibile.";
    }

    return clean.length > maxLength
        ? `${clean.slice(0, maxLength).trim()}...`
        : clean;
}

function deduplicateItems(items) {
    const seen = new Set();

    return items.filter(item => {
        const key = item.link || item.title;

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function renderNews(container, rawItems) {
    const items = deduplicateItems(
        rawItems
            .map(normalizeItem)
            .filter(item => item.title && item.link !== "#")
    )
        .sort((a, b) => getDate(b) - getDate(a))
        .slice(0, 8);

    if (!items.length) {
        renderError(container, "Nessuna notizia disponibile al momento.");
        return;
    }

    container.innerHTML = items.map((item, index) => {
        const title = escapeHtml(item.title);
        const category = escapeHtml(getCategory(item));
        const date = getDate(item)
            ? new Date(getDate(item)).toLocaleDateString("it-IT")
            : "Oggi";
        const excerpt = escapeHtml(getExcerpt(item.description));
        const link = safeUrl(item.link);
        const image = safeUrl(item.image, "/img/cloud-hosting.jpg");
        const source = escapeHtml(item.source);

        return `
            <article class="news-card" id="news-${index + 1}">
                <img
                    src="${image}"
                    class="news-thumb"
                    alt="${title}"
                    loading="lazy"
                    decoding="async"
                    onerror="this.onerror=null;this.src='/img/cloud-hosting.jpg';"
                >

                <div class="news-content">
                    <h3 class="news-title">${title}</h3>

                    <div class="news-meta">
                        <span class="news-category">${category}</span>
                        <span class="news-time">${escapeHtml(date)}</span>
                    </div>

                    <p class="news-excerpt">${excerpt}</p>

                    <a
                        href="${link}"
                        class="news-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Leggi l'articolo →
                    </a>

                    <small class="news-source">
                        Fonte: ${source}
                    </small>
                </div>
            </article>
        `;
    }).join("");
}

function renderError(container, message) {
    container.innerHTML = `
        <article class="news-card">
            <img
                src="/img/default-news.jpg"
                class="news-thumb"
                alt="Immagine predefinita per notizia"
            >

            <div class="news-content">
                <h3 class="news-title">News temporaneamente non disponibili</h3>
                <p class="news-excerpt">${escapeHtml(message)}</p>
            </div>
        </article>
    `;
}

async function fetchNewsFromProxy() {
    const response = await fetch(HOME_NEWS_ENDPOINT, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Proxy news HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.toLowerCase().includes("application/json")) {
        throw new Error("Il proxy non ha restituito JSON");
    }

    const data = await response.json();

    if (!data || data.success !== true || !Array.isArray(data.items)) {
        throw new Error(data?.error || "Risposta proxy non valida");
    }

    return data.items;
}

async function loadHomeNews() {
    const container = document.getElementById("home-news");

    if (!container) {
        console.warn("Elemento #home-news non trovato.");
        return;
    }

    container.innerHTML = `
        <article class="news-card">
            <div class="news-content">
                <h3 class="news-title">Caricamento delle ultime news...</h3>
                <p class="news-excerpt">
                    Recupero delle notizie dal mondo cyber in corso.
                </p>
            </div>
        </article>
    `;

    try {
        const items = await fetchNewsFromProxy();

        console.info(
            `Home news: ${items.length} articoli ricevuti dal proxy.`
        );

        renderNews(container, items);
    } catch (error) {
        console.error("Errore caricamento news:", error);

        console.warn("Attivo il fallback locale.");

        renderNews(container, HOME_NEWS_FALLBACK);
    }
}

document.addEventListener("DOMContentLoaded", loadHomeNews);

