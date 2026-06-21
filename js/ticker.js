/* ============================================================
   TICKER — VERSIONE FINALE CON ICONE + COLORI NEON
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

    const wrapper = el.parentElement;
    const outer = wrapper.parentElement;

    wrapper.style.overflow = "visible";

    const item = tickerNews[tickerIndex];

    el.style.opacity = "0";

    setTimeout(() => {

        const colors = ["#00ffff", "#ff00ff", "#ff8800", "#00ff88", "#ff4444"];
        const neon = colors[Math.floor(Math.random() * colors.length)];

        const icons = ["🔹", "◆", "◉", "✦", "❯"];
        const icon = icons[Math.floor(Math.random() * icons.length)];

        /* ⭐ FIX 1: innerHTML invece di textContent */
        el.innerHTML = ` ${icon}  ${item.title}  ${icon} `;
        el.href = item.link || "#";

        el.style.color = "#ffffff";
        el.style.textDecoration = "none";
        el.style.fontWeight = "600";
        el.style.fontFamily = "inherit";
        el.style.display = "inline-block";
        el.style.whiteSpace = "nowrap";
        el.style.textShadow = `0 0 8px ${neon}`;

        /* ⭐ FIX 2: calcolo larghezza reale */
        el.style.width = el.scrollWidth + "px";

        el.style.transition = "opacity 0.5s";
        el.style.opacity = "1";

        pos = outer.offsetWidth;

        if (tickerFrame) cancelAnimationFrame(tickerFrame);

        scrollTicker();

    }, 200);

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

    /* ⭐ FIX 3: reset corretto */
    if (pos < -el.offsetWidth - 40) {
        pos = outer.offsetWidth + 40;
    }

    tickerFrame = requestAnimationFrame(scrollTicker);
}

/* ============================================================
   AVVIO AUTOMATICO
============================================================ */
document.addEventListener("DOMContentLoaded", loadTickerNews);
setInterval(loadTickerNews, 60000);
