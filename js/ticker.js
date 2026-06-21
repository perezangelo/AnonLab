/* ============================================================
   TICKER — VERSIONE FINALE CON ICONE + COLORI NEON
============================================================ */

let tickerIndex = 0;
let tickerNews = [];
let pos = 0;
let speed = 1.2;   // ⭐ CORRETTO: punto, non virgola
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

    const wrapper = el.parentElement;      // .ticker-content
    const outer = wrapper.parentElement;   // .ticker

    /* ⭐ FIX CRITICO: impedisce il taglio */
    wrapper.style.overflow = "visible";

    const item = tickerNews[tickerIndex];

    /* Fade-out */
    el.style.opacity = "0";

    setTimeout(() => {

        /* 🎨 Colori neon dinamici */
        const colors = ["#00ffff", "#ff00ff", "#ff8800", "#00ff88", "#ff4444"];
        const neon = colors[Math.floor(Math.random() * colors.length)];

        /* 🖼️ Icone dinamiche */
        const icons = ["🔹", "◆", "◉", "✦", "❯"];
        const icon = icons[Math.floor(Math.random() * icons.length)];

        /* Testo completo */
        el.textContent = ` ${icon}  ${item.title}  ${icon} `;
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
        el.style.transition = "opacity 0.5s";
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
