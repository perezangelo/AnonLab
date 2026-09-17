/* ============================
   ANONLAB — HOME NEWS
   Versione 1007

   Il browser chiama il proxy PHP AlterVista.
   Il proxy recupera i feed RSS lato server
   tramite cURL, evitando i problemi CORS.
============================ */

const HOME_NEWS_VERSION = "1007";

const HOME_NEWS_ENDPOINT =
    `https://angelonline.altervista.org/api/news-proxy.php?source=all&v=${HOME_NEWS_VERSION}`;

const HOME_NEWS_DEFAULT_IMAGE =
    "https://anonlab.it/img/anonymous.png";

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

    const imageValue =
        item.image ||
        item.thumbnail ||
        item.image_url ||
        item.imageUrl ||
        item.enclosureUrl ||
        "";

    return {
        title: String(item.title || "Notizia senza titolo").trim(),

        description: String(
            item.description ||
            item.summary ||
            item.content ||
            ""
        ).trim(),

        link: safeUrl(item.link || item.url || "", "#"),

        image: safeUrl(
            imageValue,
            HOME_NEWS_DEFAULT_IMAGE
        ),

        pubDate: String(dateValue).trim(),

        categories: categories
            .map(category => String(category).trim())
            .filter(Boolean),

        source: String(item.source || "Feed RSS").trim()
    };
}

function parseDate(item) {
    const timestamp = Date.parse(item.pubDate || "");
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getExcerpt(description, maxLength = 160) {
    const cleanText = String(description || "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleanText) {
        return "Nessuna descrizione disponibile.";
    }

    return cleanText.length > maxLength
        ? `${cleanText.slice(0, maxLength).trim()}...`
        : cleanText;
}

function deduplicateItems(items) {
    const seen = new Set();

    return items.filter(item => {
        const key = item.link || item.title;

        if (!key || seen.has(key)) {
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
        .sort((a, b) => parseDate(b) - parseDate(a))
        .slice(0, 8);

    if (!items.length) {
        renderError(
            container,
            "Nessuna notizia valida disponibile al momento."
        );
        return;
    }

    container.innerHTML = items.map((item, index) => {
        const title = escapeHtml(item.title);
        const description = escapeHtml(
            getExcerpt(item.description)
        );

        const category = escapeHtml(
            item.categories?.[0] || "News"
        );

        const date = parseDate(item)
            ? new Date(parseDate(item))
                .toLocaleDateString("it-IT")
            : "Oggi";

        const link = escapeHtml(
            safeUrl(item.link, "#")
        );

        const image = escapeHtml(
            safeUrl(item.image, HOME_NEWS_DEFAULT_IMAGE)
        );

        const source = escapeHtml(item.source);

        return `
            <article class="news-card" id="news-${index + 1}">
                <img
                    src="${image}"
                    class="news-thumb"
                    alt="${title}"
                    loading="lazy"
                    decoding="async"
                    onerror="this.onerror=null;this.src='${HOME_NEWS_DEFAULT_IMAGE}';"
                >

                <div class="news-content">
                    <h3 class="news-title">${title}</h3>

                    <div class="news-meta">
                        <span class="news-category">
                            ${category}
                        </span>

                        <span class="news-time">
                            ${escapeHtml(date)}
                        </span>
                    </div>

                    <p class="news-excerpt">
                        ${description}
                    </p>

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
                src="${HOME_NEWS_DEFAULT_IMAGE}"
                class="news-thumb"
                alt="Immagine predefinita per notizia"
            >

            <div class="news-content">
                <h3 class="news-title">
                    News temporaneamente non disponibili
                </h3>

                <p class="news-excerpt">
                    ${escapeHtml(message)}
                </p>
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

    const data = await response.json();

    if (
        !data ||
        data.success !== true ||
        !Array.isArray(data.items)
    ) {
        throw new Error(
            data?.error || "Risposta del proxy non valida"
        );
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
                <h3 class="news-title">
                    Caricamento delle ultime news...
                </h3>

                <p class="news-excerpt">
                    Recupero delle notizie dal mondo cyber in corso.
                </p>
            </div>
        </article>
    `;

    try {
        const items = await fetchNewsFromProxy();

        console.info(
            `Home news: ${items.length} articoli ricevuti.`
        );

        renderNews(container, items);
    } catch (error) {
        console.error("Errore caricamento news:", error);
        console.warn("Attivo il fallback locale.");

        renderNews(container, HOME_NEWS_FALLBACK);
    }
}

document.addEventListener(
    "DOMContentLoaded",
    loadHomeNews
);

