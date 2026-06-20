/* ============================================================
   TICKER SCORREVOLE — VERSIONE DEFINITIVA
   Nessun CSS richiesto — tutto via JS
============================================================ */

let tickerIndex = 0;
let tickerNews = [];
let pos = 0;
let speed = 0.35;
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

    /* 🔥 FIX DEFINITIVO: il testo deve scorrere nel contenitore ESTERNO */
    const outer = el.parentElement.parentElement; // .ticker
    const inner = el.parentElement;               // .ticker-content

    inner.style.width = "100%";
    inner.style.overflow = "visible"; // impedisce il taglio
    outer.style.overflow = "hidden";  // il ticker vero

    const item = tickerNews[tickerIndex];

    /* Fade-out */
    el.style.opacity = "0";

    setTimeout(() => {

        /* 🎨 Colore dinamico */
        const colors = ["#00ffff", "#ff00ff", "#ff8800", "#00ff88", "#ff4444"];
        const neon = colors[Math.floor(Math.random() * colors.length)];

        /* 🖼️ Icona tra le news */
        const icon = " 🔹 ";

        /* Testo completo */
        el.textContent = icon + item.title + icon;

        el.href = item.link || "#";

        /* Stile inline */
        el.style.color = "#ffffff";
        el.style.textDecoration = "none";
        el.style.fontWeight = "600";
        el.style.fontFamily = "inherit";
        el.style.display = "inline-block";
        el.style.whiteSpace = "nowrap";

        /* Neon dinamico */
        el.style.textShadow = `0 0 8px ${neon}`;

        /* Fade-in */
        el.style.transition = "opacity 0.6s";
        el.style.opacity = "1";

        /* Reset posizione: larghezza TOTALE del ticker */
        const fullWidth = outer.offsetWidth;
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

    const outer = el.parentElement.parentElement;

    /* Reset quando esce da TUTTO il ticker */
    if (pos < -el.offsetWidth) {
        pos = outer.offsetWidth;
    }

    tickerFrame = requestAnimationFrame(scrollTicker);
}

/* ============================================================
   AVVIO AUTOMATICO
============================================================ */
document.addEventListener("DOMContentLoaded", loadTickerNews);
setInterval(loadTickerNews, 60000);
