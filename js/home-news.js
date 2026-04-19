/* ============================
   HOME NEWS — CARICAMENTO NEWS
============================ */

async function loadHomeNews() {
    const container = document.getElementById("home-news");
    if (!container) return;

    try {
        const res = await fetch("data/news.json");
        const news = await res.json();

        container.innerHTML = news
            .slice(0, 5)
            .map(n => `
                <article class="news-card">
                    <img src="${n.img}" class="news-thumb" alt="${n.title}">
                    <div class="news-content">
                        <h2 class="news-title">${n.title}</h2>
                        <div class="news-meta">
                            <span class="news-category">${n.category}</span>
                            <span class="news-time">${n.time}</span>
                        </div>
                        <p class="news-excerpt">${n.excerpt}</p>
                        <a href="${n.link}" class="news-link">Leggi di più →</a>
                    </div>
                </article>
            `)
            .join("");

    } catch (err) {
        container.innerHTML = "<p>Errore nel caricamento delle news.</p>";
        console.error("Errore nel caricamento delle news:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadHomeNews);
