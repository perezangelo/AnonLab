/* ============================
   HOME NEWS — FEED MULTIPLO CYBER (versione corretta)
   - The Hacker News
   - HackRead (via proxy PHP AlterVista)
   - DarkReading
   - BleepingComputer
   - SecurityWeek
   - CyberNews
   - CISA Alerts
============================ */

async function loadHomeNews() {
    const container = document.getElementById("home-news");
    if (!container) return;

    // FEED MULTIPLI (via rss2json + proxy PHP HackRead)
    const feeds = [
        "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews",

        // ⭐ HackRead via proxy AlterVista (XML)
        "https://angelonline.altervista.org/api/hackread.php",

        "https://api.rss2json.com/v1/api.json?rss_url=https://www.darkreading.com/rss.xml",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.bleepingcomputer.com/feed/",
        "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/securityweek",
        "https://api.rss2json.com/v1/api.json?rss_url=https://cybernews.com/feed/",
        "https://api.rss2json.com/v1/api.json?rss_url=https://www.cisa.gov/news.xml"
    ];

    // Loader iniziale
    container.innerHTML = `
        <article class="news-card">
            <div class="news-content">
                <h3 class="news-title">Caricamento delle ultime news...</h3>
                <p class="news-excerpt">Recupero delle notizie dal mondo cyber in corso.</p>
            </div>
        </article>
    `;

    try {
        let allItems = [];

        /* ============================
           CARICAMENTO PARALLELO — Promise.allSettled()
           (non blocca gli altri feed se uno fallisce)
        ============================= */
        const results = await Promise.allSettled(
            feeds.map(async url => {
                const response = await fetch(url);

                // ⭐ HackRead (XML)
                if (url.includes("hackread.php")) {
                    const xmlText = await response.text();
                    const xml = new DOMParser().parseFromString(xmlText, "text/xml");

                    return [...xml.querySelectorAll("item")].map(item => ({
                        title: item.querySelector("title")?.textContent || "",
                        link: item.querySelector("link")?.textContent || "",
                        description: item.querySelector("description")?.textContent || "",
                        pubDate: item.querySelector("pubDate")?.textContent || "",
                        categories: [...item.querySelectorAll("category")].map(c => c.textContent)
                    }));
                }

                // ⭐ Feed RSS2JSON (JSON)
                const data = await response.json();
                return data.items || [];
            })
        );

        // Unisci tutti i risultati validi
        results.forEach(result => {
            if (result.status === "fulfilled") {
                allItems = allItems.concat(result.value);
            }
        });

        // FALLBACK — nessun feed disponibile
        if (allItems.length === 0) {
            allItems = [
                {
                    title: "Nessun feed disponibile",
                    description: "I servizi esterni non rispondono.",
                    pubDate: new Date().toISOString(),
                    categories: ["Cyber"],
                    thumbnail: "/img/default-news.jpg",
                    link: "#"
                }
            ];
        }

        /* ============================
           ORDINAMENTO PER DATA
           + aumento limite articoli
        ============================= */
        const maxNews = 20;

        allItems = allItems
            .map(item => ({
                ...item,
                parsedDate: item.pubDate ? new Date(item.pubDate) : new Date(0)
            }))
            .sort((a, b) => b.parsedDate - a.parsedDate)
            .slice(0, maxNews);

        /* ============================
           RENDERING NEWS
        ============================= */
        container.innerHTML = allItems
            .map((item, index) => {
                const category =
                    item.categories && item.categories.length > 0
                        ? item.categories[0]
                        : "News";

                // FIX IMMAGINI
                const image =
                    (item.thumbnail && item.thumbnail.startsWith("http")) ? item.thumbnail :
                    (item.image && item.image.startsWith("http")) ? item.image :
                    (item.enclosure && item.enclosure.link && item.enclosure.link.startsWith("http")) ? item.enclosure.link :
                    "/img/cloud-hosting.jpg";

                const excerpt = item.description
                    ? item.description.replace(/<[^>]+>/g, "").slice(0, 160) + "..."
                    : "";

                const date = item.parsedDate
                    ? item.parsedDate.toLocaleDateString("it-IT")
                    : "Oggi";

                // ⭐ CORREZIONE: usa SOLO il link originale
                const link = item.link || "#";

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

                            <a href="${link}" class="news-link" target="_blank" rel="noopener noreferrer">
                                Leggi l'articolo →
                            </a>
                        </div>
                    </article>
                `;
            })
            .join("");

    } catch (err) {
        console.error("Errore nel caricamento RSS:", err);

        container.innerHTML = `
            <article class="news-card">
                <img src="/img/default-news.jpg" class="news-thumb" alt="Immagine predefinita">
                <div class="news-content">
                    <h3 class="news-title">Impossibile caricare le news</h3>
                    <p class="news-excerpt">Il feed esterno non risponde. Riprova più tardi.</p>
                </div>
            </article>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadHomeNews);
