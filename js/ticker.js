/* ============================================================
   TICKER ROTANTE CLICCABILE — VERSIONE DEFINITIVA
============================================================ */

let tickerIndex = 0;
let tickerNews = [];

async function loadTickerNews() {
    try {
        // URL RAW aggiornato da GitHub Actions
        const url = "https://raw.githubusercontent.com/perezangelo/AnonLab/refs/heads/main/data/news.json?cache=" + Date.now();
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error("Errore nel caricamento del JSON delle news");
        }

        const news = await res.json();

        // Se il JSON è vuoto → fallback
        if (!Array.isArray(news) || news.length === 0) {
            tickerNews = [{ title: "Nessuna notizia disponibile", link: "#" }];
        } else {
            tickerNews = news;
        }

        tickerIndex = 0;
        updateTicker();

    } catch (err) {
        console.error("Ticker error:", err);
        tickerNews = [{ title: "Errore nel caricamento delle news", link: "#" }];
        updateTicker();
    }
}

function updateTicker() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    const item = tickerNews[tickerIndex];

    el.textContent = item.title;
    el.href = item.link || "#";

    tickerIndex = (tickerIndex + 1) % tickerNews.length;

    setTimeout(updateTicker, 4000); // cambia ogni 4 secondi
}

// Carica news al caricamento pagina
document.addEventListener("DOMContentLoaded", loadTickerNews);

// Aggiorna ogni minuto
setInterval(loadTickerNews, 60000);
