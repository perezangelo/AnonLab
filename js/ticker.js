/* ============================================================
   TICKER SCORREVOLE — VERSIONE DEFINITIVA E STABILE
   Nessun CSS richiesto — tutto gestito via JS
============================================================ */

let tickerIndex = 0;
let tickerNews = [];
let pos = 0;
let speed = 0.35; // velocità costante e fluida
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
   AVVIO TICKER (fade + neon + reset loop)
============================================================ */
function startTicker() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    const item = tickerNews[tickerIndex];

    /* Fade-out */
    el.style.opacity = "0";

    setTimeout(() => {

        /* Imposta testo e link */
        el.textContent = item.title;
        el.href = item.link || "#";

        /* Stile inline (no CSS esterno) */
        el.style.color = "#ffffff";
        el.style.textDecoration = "none";
        el.style.fontWeight = "600";
        el.style.fontFamily = "inherit";
        el.style.display = "inline-block";
        el.style.whiteSpace = "nowrap";

        /* Effetto neon leggero */
        el.style.textShadow = "0 0 6px rgba(0,255,255,0.6)";

        /* Fade-in */
        el.style.transition = "opacity 0.6s";
        el.style.opacity = "1";

        /* Reset posizione */
        const fullWidth = el.parentElement.parentElement.offsetWidth;
        pos = fullWidth;

        /* Stop vecchio loop */
        if (tickerFrame) cancelAnimationFrame(tickerFrame);

        /* Avvia scorrimento */
        scrollTicker();

    }, 250);

    /* Cambia news ogni 12 secondi */
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

    /* Reset solo quando esce da TUTTO il ticker (titolo + contenuto) */
    const fullWidth = el.parentElement.parentElement.offsetWidth;

    if (pos < -el.offsetWidth) {
        pos = fullWidth;
    }

    tickerFrame = requestAnimationFrame(scrollTicker);
}

/* ============================================================
   AVVIO AUTOMATICO
============================================================ */
document.addEventListener("DOMContentLoaded", loadTickerNews);

/* Aggiorna news ogni 60 secondi */
setInterval(loadTickerNews, 60000);
