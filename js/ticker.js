/* ============================================================
   TICKER NEWS — VERSIONE OTTIMIZZATA E ROBUSTA
   ------------------------------------------------------------
   - Attende che la traccia esista nel DOM
   - Gestisce errori di rete e JSON
   - Gestisce caso "nessuna news"
   - Evita duplicazioni (gestite da initTicker in ui.js)
============================================================ */

async function loadTickerNews() {
    try {
        // Attende che la traccia sia presente nel DOM
        const track = await waitForTickerTrack();
        if (!track) return;

        // Carica il JSON
        const res = await fetch("/data/news.json");

        if (!res.ok) {
            throw new Error("Errore nel caricamento del JSON delle news");
        }

        const news = await res.json();

        // Se il JSON è vuoto → fallback
        if (!Array.isArray(news) || news.length === 0) {
            track.innerHTML = `<span class="ticker-item">Nessuna notizia disponibile</span>`;
            return;
        }

        // Genera i titoli
        const items = news
            .map(item => `<span class="ticker-item">${item.title}</span>`)
            .join("");

        // Inserisce gli elementi
        track.innerHTML = items;

        // La duplicazione è gestita da initTicker() in ui.js

    } catch (err) {
        console.error("Ticker error:", err);

        // Fallback visivo
        const track = document.querySelector(".ticker-track");
        if (track) {
            track.innerHTML = `<span class="ticker-item">Errore nel caricamento delle news</span>`;
        }
    }
}

/* ============================================================
   ATTESA SICURA DELLA TRACCIA DEL TICKER
   ------------------------------------------------------------
   - Il ticker viene caricato via partials
   - Quindi potrebbe non esistere subito
============================================================ */

function waitForTickerTrack() {
    return new Promise(resolve => {
        const check = () => {
            const el = document.querySelector(".ticker-track");
            if (el) resolve(el);
            else setTimeout(check, 80);
        };
        check();
    });
}

/* ============================================================
   AVVIO AUTOMATICO
============================================================ */

document.addEventListener("DOMContentLoaded", loadTickerNews);
