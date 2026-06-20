/* ============================================================
   TICKER SCORREVOLE CONTINUO — VERSIONE DEFINITIVA E STABILE
   Nessun CSS richiesto — tutto gestito via JS
============================================================ */

let tickerIndex = 0;
let tickerNews = [];
let pos = 0;
let speed = 1.00; // velocità stabile e lenta
let tickerFrame = null;

/* ============================================================
   CARICAMENTO NEWS DA GITHUB RAW
============================================================ */
async function loadTickerNews() {
    try {
        const url = "https://raw.githubusercontent.com/perezangelo/AnonLab/refs/heads/main/data/news.json?cache=" + Date.now();
        const res = await fetch(url);
        const data = await res.json();

        tickerNews = Array.isArray(data) && data.length > 0
            ? data
            : [{ title: "Nessuna notizia disponibile", link: "#" }];

        tickerIndex = 0;
        startTicker();

    } catch (e) {
        console.error("Errore ticker:", e);
        tickerNews = [{ title: "Errore nel caricamento delle news", link: "#" }];
        startTicker();
    }
}

/* ============================================================
   AVVIO TICKER (con reset del loop)
============================================================ */
function startTicker() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    const item = tickerNews[tickerIndex];

    el.textContent = item.title;
    el.href = item.link || "#";

    // Stile inline (niente CSS esterno)
    el.style.color = "#ffffff";
    el.style.textDecoration = "none";
    el.style.fontWeight = "600";
    el.style.fontFamily = "inherit";
    el.style.display = "inline-block";
    el.style.whiteSpace = "nowrap";

    // Reset posizione
    pos = el.parentElement.offsetWidth;

    // 🔥 STOPPA il vecchio loop prima di avviarne uno nuovo
    if (tickerFrame) cancelAnimationFrame(tickerFrame);

    // Avvia scorrimento
    scrollTicker();

    // Cambia news ogni 12 secondi
    setTimeout(() => {
        tickerIndex = (tickerIndex + 1) % tickerNews.length;
        startTicker();
    }, 12000);
}

/* ============================================================
   SCORRIMENTO CONTINUO (loop unico e stabile)
============================================================ */
function scrollTicker() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    pos -= speed;
    el.style.transform = `translateX(${pos}px)`;

    // Quando esce completamente → reset immediato
    if (pos < -el.offsetWidth) {
        pos = el.parentElement.offsetWidth;
    }

    tickerFrame = requestAnimationFrame(scrollTicker);
}

/* ============================================================
   AVVIO AUTOMATICO
============================================================ */
document.addEventListener("DOMContentLoaded", loadTickerNews);

// Aggiorna news ogni 60 secondi
setInterval(loadTickerNews, 60000);
