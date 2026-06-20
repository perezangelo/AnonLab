/* ============================================================
   TICKER SCORREVOLE SENZA CSS — VERSIONE DEFINITIVA
============================================================ */

let tickerIndex = 0;
let tickerNews = [];
let pos = 0;
let speed = 1; // velocità scorrimento (px per frame)

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

function startTicker() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    const item = tickerNews[tickerIndex];

    el.textContent = item.title;
    el.href = item.link || "#";

    // Reset posizione
    pos = el.parentElement.offsetWidth;

    // Avvia scorrimento
    scrollTicker();

    // Cambia news ogni 12 secondi
    setTimeout(() => {
        tickerIndex = (tickerIndex + 1) % tickerNews.length;
        startTicker();
    }, 12000);
}

function scrollTicker() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    pos -= speed;
    el.style.transform = `translateX(${pos}px)`;

    // Quando esce dallo schermo → reset
    if (pos < -el.offsetWidth) {
        pos = el.parentElement.offsetWidth;
    }

    requestAnimationFrame(scrollTicker);
}

document.addEventListener("DOMContentLoaded", loadTickerNews);
setInterval(loadTickerNews, 60000);
