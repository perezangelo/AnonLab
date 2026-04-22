/* ============================
   HOME NEWS — CARICAMENTO NEWS DA RSS
============================ */

async function loadHomeNews() {
    const container = document.getElementById("home-news");
    if (!container) return;

    const feedUrl = "https://rss.app/feeds/v1.1/438ni62sumVqiCeO.json";

    try {
        const res = await fetch(feedUrl);
        const data = await res.json();

        const items = data.items.slice(0, 5); // Prime 5 notizie

        container.innerHTML = items
            .map((item, index) => {
                
                // Categoria dal feed
                const category =
                    item.categories && item.categories.length > 0
                        ? item.categories[0]
                        : "News";

                // Immagine dal feed
                const image =
                    item.image ||
                    (item.enclosure && item.enclosure.link) ||
                    "img/default-news.jpg";

                // Excerpt pulito
                const excerpt = item.description
                    ? item.description.replace(/<[^>]+>/g, "").slice(0, 140) + "..."
                    : "";

                // Data formattata
                const date = new Date(item.pubDate).toLocaleDateString("it-IT");

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

                            <a href="${item.link}" class="news-link" target="_blank">
                                Leggi di più →
                            </a>
                        </div>
                    </article>
                `;
            })
            .join("");

    } catch (err) {
        container.innerHTML = "<p>Errore nel caricamento delle news.</p>";
        console.error("Errore nel caricamento RSS:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadHomeNews);
