/* ============================================================
   TICKER REAL‑TIME — VERSIONE DEFINITIVA SENZA CSS AGGIUNTIVO
============================================================ */

async function loadTickerNews() {
    try {
        const track = await waitForTickerTrack();
        if (!track) return;

        const res = await fetch("/data/news.json?cache=" + Date.now());
        if (!res.ok) throw new Error("Errore caricamento news.json");

        const news = await res.json();

        if (!Array.isArray(news) || news.length === 0) {
            track.innerHTML = `<span class="ticker-item">Nessuna notizia disponibile</span>`;
            return;
        }

        // Genera contenuto
        const items = news
            .map(n => `<span class="ticker-item">${n.title}</span>`)
            .join("");

        // Duplicazione per scorrimento continuo
        track.innerHTML = items + items;

        // Calcolo larghezza e velocità
        requestAnimationFrame(() => {
            initTickerWidth(track);
        });

    } catch (err) {
        console.error("Ticker error:", err);
    }
}

/* ============================================================
   CALCOLO LARGHEZZA E VELOCITÀ (NO CSS AGGIUNTIVO)
============================================================ */

function initTickerWidth(track) {
    const width = track.scrollWidth / 2;

    // velocità proporzionale alla lunghezza
    const speed = Math.max(18, width / 12);

    track.style.animationDuration = speed + "s";
}

/* ============================================================
   ATTESA SICURA DELLA TRACCIA
============================================================ */

function waitForTickerTrack() {
    return new Promise(resolve => {
        const check = () => {
            const el = document.getElementById("ticker-track");
            if (el) resolve(el);
            else setTimeout(check, 80);
        };
        check();
    });
}

/* ============================================================
   AUTO‑REFRESH OGNI 60 SECONDI
============================================================ */

setInterval(loadTickerNews, 60000);

/* ============================================================
   AVVIO
============================================================ */

document.addEventListener("DOMContentLoaded", loadTickerNews);
