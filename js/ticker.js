/* ============================================================
   TICKER — VERSIONE "TRENO DI NEWS" (OTTIMIZZATA & VELOCE)
============================================================ */

let tickerNews = [];
let pos = 0;
let speed = 1.4;          // velocità scorrimento
let tickerFrame = null;

/* ============================================================
   CARICAMENTO NEWS
============================================================ */
async function loadTickerNews() {
    try {
        const url = "https://raw.githubusercontent.com/perezangelo/AnonLab/refs/heads/main/data/news.json?cache=" + Date.now();
        const res = await fetch(url);
        const data = await res.json();

        tickerNews = Array.isArray(data) && data.length > 0
            ? data
            : [{ title: "Nessuna notizia disponibile", link: "#", image: "" }];

        buildTickerTrain();
    } catch (e) {
        console.error("Errore ticker:", e);
        tickerNews = [{ title: "Errore nel caricamento delle news", link: "#", image: "" }];
        buildTickerTrain();
    }
}

/* ============================================================
   COSTRUZIONE "TRENO" DI NEWS
============================================================ */
function buildTickerTrain() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    const wrapper = el.parentElement;
    if (wrapper) wrapper.style.overflow = "hidden";

    const colors = ["#00ffff", "#ff00ff", "#ff8800", "#00ff88", "#ff4444"];
    const icons = ["◆", "◉", "✦", "❯"];

    let html = "";

    tickerNews.forEach((item, idx) => {
        const neon = colors[idx % colors.length];
        const icon = icons[idx % icons.length];

        const img = item.image && item.image.trim() !== ""
            ? item.image
            : "https://api.dicebear.com/9.x/bottts/svg?seed=" + idx;

        // Pulizia del titolo per evitare che eventuali virgolette rompano l'HTML
        const cleanTitle = String(item.title || "Notizia cyber").replace(/"/g, '&quot;');

        html += `
            <a href="${item.link || "#"}" style="
                color:#ffffff;
                text-decoration:none;
                font-weight:600;
                font-family:inherit;
                display:inline-flex;
                align-items:center;
                white-space:nowrap;
                margin-right:40px;
                text-shadow:0 0 8px ${neon};
            ">
                <img src="${img}" 
                     width="20" 
                     height="20"
                     alt=""
                     aria-hidden="true"
                     loading="lazy"
                     decoding="async"
                     style="width:20px;height:20px;object-fit:cover;border-radius:4px;margin-right:6px;flex-shrink:0;">
                <span style="margin-right:6px;">${icon}</span>
                <span>${cleanTitle}</span>
            </a>
        `;
    });

    // Duplico il contenuto per avere un loop continuo
    el.innerHTML = html + html;

    el.style.display = "inline-block";
    el.style.whiteSpace = "nowrap";
    el.style.transform = "translateX(0px)";

    pos = 0;

    if (tickerFrame) cancelAnimationFrame(tickerFrame);
    startContinuousScroll();
}

/* ============================================================
   SCORRIMENTO CONTINUO SENZA FORCED REFLOW
============================================================ */
function startContinuousScroll() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    const contentWidth = el.scrollWidth;

    function step() {
        pos -= speed;

        if (pos <= -contentWidth / 2) {
            pos += contentWidth / 2;
        }

        el.style.transform = `translateX(${pos}px)`;
        tickerFrame = requestAnimationFrame(step);
    }

    tickerFrame = requestAnimationFrame(step);
}
