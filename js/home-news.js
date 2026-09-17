/* ============================
   HOME NEWS — FEED MULTIPLO CYBER (versione definitiva)
   - The Hacker News
   - HackRead (via proxy PHP AlterVista)
   - DarkReading (via proxy PHP AlterVista)
============================ */

async function loadHomeNews() {
    const container = document.getElementById("home-news");
    if (!container) return;

    // FEED MULTIPLI UNIFORMATI (Uso diretto dei proxy JSON nativi per evitare blocchi)
    const feeds = [
        "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews",
        "https://angelonline.altervista.org/api/hackread.php",
        "https://altervista.org"
    ];

    // Link esterni personalizzati (in ordine)
    const externalLinks = [
        "https://www.ctm360.com/blog/govtrap-campaign",
        "https://www.netskope.com/blog/work-moved-into-the-browser-security-didnt",
        "https://www.rubrik.com/blog/why-your-backups-might-not-save-you",
        "https://www.securityweek.com/anthropic-mcp-design-flaw-rce-risk",
        "https://www.gartner.com/en/articles/threat-intelligence-missing-link-ctem"
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

        // CARICAMENTO MULTI-FEED
        for (const url of feeds) {
            try {
                const res = await fetch(url);
                const data = await res.json(); // Tutti gli endpoint ora restituiscono JSON nativo

                // Salta il feed se l'API PHP ha risposto con un errore interno strutturato
                if (data && data.error) {
                    console.warn(`Errore segnalato dall'endpoint [${url}]:`, data.error);
                    continue;
                }

                // Gestione dei dati: se è un array nativo (i nostri proxy PHP)
                if (Array.isArray(data)) {
                    allItems = allItems.concat(data);
                } 
                // Se sono dati provenienti dal servizio di pulizia rss2json standard
                else if (data && data.items && Array.isArray(data.items)) {
                    allItems = allItems.concat(data.items);
                }
            } catch (err) {
                console.warn("Errore nel recupero/parsing del feed:", url, err);
            }
        }

        // FALLBACK — nessun feed disponibile
        if (allItems.length === 0) {
            console.warn("Nessun feed disponibile. Uso fallback locale.");
            allItems = [
                {
                    title: "CTM360 Exposes Global GovTrap Campaign...",
                    description: "Analisi della campagna GovTrap e delle sue implicazioni sulla sicurezza globale.",
                    pubDate: new Date().toISOString(),
                    categories: ["Cyber"],
                    thumbnail: "/img/default-news.jpg",
                    link: "https://www.ctm360.com/blog/govtrap-campaign"
                },
                {
                    title: "Work Moved Into the Browser...",
                    description: "Perché la sicurezza del browser è la nuova frontiera della difesa aziendale.",
                    pubDate: new Date().toISOString(),
                    categories: ["Security"],
                    thumbnail: "/img/default-news.jpg",
                    link: "https://www.netskope.com/blog/work-moved-into-the-browser-security-didnt"
                }
            ];
        }

        // ORDINAMENTO PER DATA E LIMITE NEWS
        const maxNews = 8;

        allItems = allItems
            .map(item => ({
                ...item,
                parsedDate: item.pubDate ? new Date(item.pubDate) : new Date(0)
            }))
            .sort((a, b) => b.parsedDate - a.parsedDate)
            .slice(0, maxNews);

        // RENDERING NEWS
        container.innerHTML = allItems
            .map((item, index) => {
                const category =
                    item.categories && item.categories.length > 0
                        ? item.categories[0]
                        : "News";

                // FIX IMMAGINI MANCANTI / NON VALIDE / BLOCCATE (Incluso supporto nativo .thumbnail delle nuove API)
                const image =
                    (item.thumbnail && item.thumbnail.startsWith("http")) ? item.thumbnail :
                    (item.image && item.image.startsWith("http")) ? item.image :
                    (item.enclosure && item.enclosure.link && item.enclosure.link.startsWith("http")) ? item.enclosure.link :
                    "/img/cloud-hosting.jpg";

                const excerpt = item.description
                    ? item.description.replace(/<[^>]+>/g, "").slice(0, 160) + "..."
                    : "";

                const date = item.parsedDate && !isNaN(item.parsedDate)
                    ? item.parsedDate.toLocaleDateString("it-IT")
                    : "Oggi";

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

                            <a href="${link}" class="news-link" target="_blank" rel="noopener noreferrer">
                                Leggi l'articolo: ${item.title} →
                            </a>
                        </div>
                    </article>
                `;
            })
            .join("");

    } catch (err) {
        console.error("Errore critico nel caricamento globale RSS:", err);

        container.innerHTML = `
            <article class="news-card">
                <img src="/img/default-news.jpg" class="news-thumb" alt="Immagine predefinita per notizia">
                <div class="news-content">
                    <h3 class="news-title">Impossibile caricare le news</h3>
                    <p class="news-excerpt">Il feed esterno non risponde. Riprova più tardi.</p>
                </div>
            </article>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadHomeNews);

