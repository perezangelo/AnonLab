/* ============================
   HOME NEWS — CARICAMENTO NEWS DA RSS (con fallback + sorting)
============================ */

async function loadHomeNews() {
    const container = document.getElementById("home-news");
    if (!container) return;

    // FEED CYBER SICURO E COMPATIBILE
    const feedUrl = "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews";

    // Link esterni personalizzati (in ordine)
    const externalLinks = [
        "https://www.ctm360.com/blog/govtrap-campaign",
        "https://www.netskope.com/blog/work-moved-into-the-browser-security-didnt",
        "https://www.rubrik.com/blog/why-your-backups-might-not-save-you",
        "https://www.securityweek.com/anthropic-mcp-design-flaw-rce-risk",
        "https://www.gartner.com/en/articles/threat-intelligence-missing-link-ctem"
    ];

    try {
        const res = await fetch(feedUrl);
        const data = await res.json();

        let items = data.items || [];

        /* ============================
           FALLBACK 1 — se il feed cambia struttura
        ============================ */
        if (!Array.isArray(items) || items.length === 0) {
            console.warn("Feed vuoto o struttura cambiata. Uso fallback locale.");
            items = [
                {
                    title: "CTM360 Exposes Global GovTrap Campaign...",
                    description: "Analisi della campagna GovTrap...",
                    pubDate: new Date().toISOString(),
                    categories: ["Cyber"],
                    image: "/img/default-news.jpg"
                },
                {
                    title: "Work Moved Into the Browser...",
                    description: "La sicurezza del browser è la nuova frontiera...",
                    pubDate: new Date().toISOString(),
                    categories: ["Security"],
                    image: "/img/default-news.jpg"
                }
            ];
        }

        /* ============================
           ORDINAMENTO PER DATA REALE
        ============================ */
        items = items
            .map(item => ({
                ...item,
                parsedDate: item.pubDate ? new Date(item.pubDate) : new Date(0)
            }))
            .sort((a, b) => b.parsedDate - a.parsedDate)
            .slice(0, 5);

        /* ============================
           RENDERING NEWS
        ============================ */
        container.innerHTML = items
            .map((item, index) => {
                const category =
                    item.categories && item.categories.length > 0
                        ? item.categories[0]
                        : "News";

                const image =
                    item.thumbnail ||
                    item.image ||
                    (item.enclosure && item.enclosure.link) ||
                    "/img/default-news.jpg";

                const excerpt = item.description
                    ? item.description.replace(/<[^>]+>/g, "").slice(0, 140) + "..."
                    : "";

                const date = item.parsedDate
                    ? item.parsedDate.toLocaleDateString("it-IT")
                    : "Oggi";

                // Link esterno personalizzato
                const link = externalLinks[index] || item.link || "#";

                return `
                    <article class="news-card" id="news-${index + 1}">
                        <img src="${image}" class="news-thumb" alt="${item.title}">
                        <div class="news-content">
                            <h3 class="news-title">${item.title}</h3>

                            <div class="news-meta">
                                <span class="news-category">${category}</span>
                                <span class="news-time">${date}</span>
                            </div>

                            <p class="news-excerpt">${excerpt}</p>

                            <a href="${link}" class="news-link" target="_blank">
                                Leggi di più →
                            </a>
                        </div>
                    </article>
                `;
            })
            .join("");

    } catch (err) {
        console.error("Errore nel caricamento RSS:", err);

        /* ============================
           FALLBACK 2 — errore totale
        ============================ */
        container.innerHTML = `
            <article class="news-card">
                <img src="/img/default-news.jpg" class="news-thumb">
                <div class="news-content">
                    <h3 class="news-title">Impossibile caricare le news</h3>
                    <p class="news-excerpt">Il feed esterno non risponde. Riprova più tardi.</p>
                </div>
            </article>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadHomeNews);
    }
}

document.addEventListener("DOMContentLoaded", loadHomeNews);
