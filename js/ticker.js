/* ============================================================
   TICKER SCORREVOLE — VERSIONE DEFINITIVA E STABILE
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

    const wrapper = el.parentElement;          // .ticker-content
    const outer = wrapper.parentElement;       // .ticker

    /* FIX DEFINITIVO: wrapper controllato */
    wrapper.style.width = "100%";
    wrapper.style.overflow = "hidden";   // il testo NON può uscire
    outer.style.overflow = "hidden";     // sicurezza

    const item = tickerNews[tickerIndex];

    /* Fade-out */
    el.style.opacity = "0";

    setTimeout(() => {

        /* 🎨 Colore neon dinamico */
        const colors = ["#00ffff", "#ff00ff", "#ff8800", "#00ff88", "#ff4444"];
        const neon = colors[Math.floor(Math.random() * colors.length)];

        /* 🖼️ Icona separatore */
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
        el.style.textShadow = `0 0 8px ${neon}`;

        /* Fade-in */
        el.style.transition = "opacity 0.6s";
        el.style.opacity = "1";

        /* Reset posizione: parte da DESTRA del ticker */
        pos = outer.offsetWidth;

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

    const outer = el.parentElement.parentElement;

    pos -= speed;
    el.style.transform = `translateX(${pos}px)`;

    /* Reset quando esce COMPLETAMENTE dal ticker */
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
