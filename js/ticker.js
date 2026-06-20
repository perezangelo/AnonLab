/* ============================================================
   TICKER SCORREVOLE — VERSIONE DEFINITIVA CON SEPARATORE
   Nessun CSS richiesto — tutto gestito via JS
============================================================ */

let tickerIndex = 0;
let tickerNews = [];
let pos = 0;
let speed = 1.2;
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
   AVVIO TICKER
============================================================ */
function startTicker() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    /* Allarga contenitore per evitare tagli */
    el.parentElement.style.width = "100%";
    el.parentElement.style.overflow = "visible";

    const item = tickerNews[tickerIndex];

    /* Fade-out */
    el.style.opacity = "0";

    setTimeout(() => {

        /* SEPARATORE GRAFICO */
        const separator = "  ❯❯  ";

        /* Testo completo con separatore */
        el.textContent = item.title + separator;

        el.href = item.link || "#";

        /* Stile inline */
        el.style.color = "#ffffff";
        el.style.textDecoration = "none";
        el.style.fontWeight = "600";
        el.style.fontFamily = "inherit";
        el.style.display = "inline-block";
        el.style.whiteSpace = "nowrap";
        el.style.textShadow = "0 0 6px rgba(0,255,255,0.6)";

        /* Fade-in */
        el.style.transition = "opacity 0.6s";
        el.style.opacity = "1";

        /* Reset posizione */
        const fullWidth = el.parentElement.offsetWidth;
        pos = fullWidth;

        /* Stop vecchio loop */
        if (tickerFrame) cancelAnimationFrame(tickerFrame);

        /* Avvia scorrimento */
        scrollTicker();

    }, 200);

    /* Cambio news */
    setTimeout(() => {
        tickerIndex = (tickerIndex + 1) % tickerNews.length;
        startTicker();
    }, 12000);
}

/* ============================================================
   SCORRIMENTO CONTINUO
============================================================ */
function scrollTicker() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    pos -= speed;
    el.style.transform = `translateX(${pos}px)`;

    const fullWidth = el.parentElement.offsetWidth;

    /* Reset quando esce completamente */
    if (pos < -el.offsetWidth) {
        pos = fullWidth;
    }

    tickerFrame = requestAnimationFrame(scrollTicker);
}

/* ============================================================
   AVVIO AUTOMATICO
============================================================ */
document.addEventListener("DOMContentLoaded", loadTickerNews);
setInterval(loadTickerNews, 60000);
