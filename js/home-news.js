/* ============================================
   HOME NEWS — CARICAMENTO NEWS CON IMMAGINI
============================================ */

document.addEventListener("DOMContentLoaded", () => {
    loadHomeNews();
});

async function loadHomeNews() {
    const container = document.getElementById("home-news");
    if (!container) return;

    try {
        const res = await fetch("/data/news.json");
        const news = await res.json();

        // HERO fallback rotation
        const heroFallback = ["/img/hero1.jpg", "/img/hero2.jpg", "/img/hero3.jpg"];
        let heroIndex = 0;

        const html = news.map(article => {
            // Se manca l’immagine → usa HERO1/2/3 a rotazione
            const img = article.image && article.image.trim() !== ""
                ? article.image
                : heroFallback[(heroIndex++) % heroFallback.length];

            return `
                <article class="news-card">
                    <img src="${img}" alt="${article.title}" class="news-thumb">

                    <div class="news-content">
                        <h3 class="news-title">${article.title}</h3>

                        <div class="news-meta">
                            <span class="news-category">${article.category}</span>
                            <span class="news-time">${article.time}</span>
                        </div>

                        <p class="news-excerpt">${article.excerpt}</p>

                        <a href="${article.url}" class="news-link">Leggi di più →</a>
                    </div>
                </article>
            `;
        }).join("");

        container.innerHTML = html;

    } catch (err) {
        console.error("Errore nel caricamento delle news:", err);
        container.innerHTML = "<p>Impossibile caricare le news.</p>";
    }
}
