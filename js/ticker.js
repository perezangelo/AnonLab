/* ============================================================
   TICKER — VERSIONE DEFINITIVA (veloce + immagini + no spazi)
============================================================ */

let tickerIndex = 0;
let tickerNews = [];
let pos = 0;
let speed = 2.8;
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

        tickerIndex = 0;
        startTicker();

    } catch (e) {
        console.error("Errore ticker:", e);
        tickerNews = [{ title: "Errore nel caricamento delle news", link: "#", image: "" }];
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
    const outer = wrapper.parentElement;   // include Breaking

    wrapper.style.overflow = "visible";

    const item = tickerNews[tickerIndex];

    el.style.opacity = "0";

    setTimeout(() => {

        const colors = ["#00ffff", "#ff00ff", "#ff8800", "#00ff88", "#ff4444"];
        const neon = colors[Math.floor(Math.random() * colors.length)];

        const icons = ["◆", "◉", "✦", "❯"];
        const icon = icons[Math.floor(Math.random() * icons.length)];

        const img = item.image && item.image.trim() !== ""
            ? item.image
            : "https://picsum.photos/40/40?random=" + Math.random();

        el.innerHTML = `
            <img src="${img}" style="
                height:20px;width:20px;object-fit:cover;
                border-radius:4px;vertical-align:middle;margin-right:6px;">
            ${icon} ${item.title}
        `;

        el.href = item.link || "#";

        el.style.color = "#ffffff";
        el.style.textDecoration = "none";
        el.style.fontWeight = "600";
        el.style.fontFamily = "inherit";
        el.style.display = "inline-block";
        el.style.whiteSpace = "nowrap";
        el.style.textShadow = `0 0 8px ${neon}`;

        el.style.width = el.scrollWidth + "px";

        el.style.transition = "opacity 0.4s";
        el.style.opacity = "1";

        /* ⭐ PARTENZA DA TUTTA LA LARGHEZZA (Breaking incluso) */
        pos = outer.parentElement.offsetWidth;

        if (tickerFrame) cancelAnimationFrame(tickerFrame);

        scrollTicker();

    }, 150);

    setTimeout(() => {
        tickerIndex = (tickerIndex + 1) % tickerNews.length;
        startTicker();
    }, 9000);
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

    if (pos < -el.offsetWidth - 20) {
        pos = outer.parentElement.offsetWidth;
    }

    tickerFrame = requestAnimationFrame(scrollTicker);
}

/* ============================================================
   AVVIO AUTOMATICO
============================================================ */
document.addEventListener("DOMContentLoaded", loadTickerNews);
setInterval(loadTickerNews, 60000);

