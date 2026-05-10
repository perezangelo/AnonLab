/* ============================================================
   A) CARICAMENTO PARTIALS — VERSIONE OTTIMIZZATA E ROBUSTA
   ------------------------------------------------------------
   - Timeout sicuro
   - Controllo MIME
   - Evita duplicazioni
   - Evita errori silenziosi
============================================================ */

async function loadPartial(id, file) {
    const el = document.getElementById(id);
    if (!el) return; // Se il container non esiste, evita errori

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(file, { signal: controller.signal });
        clearTimeout(timeout);

        // Controllo MIME per evitare caricamenti errati
        if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
            throw new Error(`Errore nel caricamento di ${file}`);
        }

        el.innerHTML = await res.text();

        // Il ticker deve essere inizializzato SOLO dopo il caricamento dell'header
        if (id === "header") {
            requestAnimationFrame(initTicker);
        }

    } catch (err) {
        console.error(err);
        el.innerHTML = `<p class="error">Impossibile caricare ${file}</p>`;
    }
}

/* ============================================================
   B) METEO — usa data/meteo.json (custom neon)
============================================================ */

async function loadMeteo() {
    const cityEl = document.getElementById("meteo-city");
    const tempEl = document.getElementById("meteo-temp");
    const descEl = document.getElementById("meteo-desc");

    // Se gli elementi non esistono, esci
    if (!cityEl || !tempEl || !descEl) return;

    try {
        const res = await fetch("/data/data/meteo.json");
        if (!res.ok) throw new Error("Errore meteo.json");

        const data = await res.json();

        cityEl.textContent = data.city || "Varese";
        tempEl.textContent = data.temp || "--°C";
        descEl.textContent = data.desc || "Dati non disponibili";

    } catch (e) {
        console.error(e);
        descEl.textContent = "Meteo non disponibile";
        descEl.style.color = "#ff4b6e";
    }
}
/* ============================================================
   C) TICKER CONTINUO — VERSIONE OTTIMIZZATA
   ------------------------------------------------------------
   - Evita duplicazioni
   - Usa dataset come flag
   - Calcolo larghezza più stabile
============================================================ */

function initTicker() {
    const track = document.querySelector(".ticker-track");
    if (!track) return;

    // Evita di clonare più volte
    if (track.dataset.cloned === "true") return;

    const clone = track.cloneNode(true);
    clone.dataset.cloned = "true";
    track.parentElement.appendChild(clone);

    // Calcolo larghezza per animazione continua
    const totalWidth = track.scrollWidth;
    track.style.setProperty("--ticker-width", totalWidth + "px");
}

/* ============================================================
   D) DOM READY — VERSIONE OTTIMIZZATA
   ------------------------------------------------------------
   - Carica i partials
   - Carica i widget SOLO dopo che la sidebar è pronta
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Percorso dinamico per funzionare in tutte le cartelle
const base = window.location.pathname.includes("/") ? "../" : "";

loadPartial("header", "/partials/header.html");
loadPartial("ticker", "/partials/ticker.html");
loadPartial("sidebar", "/partials/sidebar.html");
loadPartial("footer", "/partials/footer.html");

    // Carica i widget solo dopo che la sidebar è pronta
    waitForSidebar().then(() => {
    if (typeof initVisitCounter === "function") {
        initVisitCounter();
    }

    loadMeteo();

        /* ============================================================
       FIX METEO — VERSIONE COMPLETA, STABILE E OTTIMIZZATA
    ============================================================ */
    setTimeout(() => {
        const loader = document.getElementById("meteo-loader");
        if (loader) loader.textContent = "Inizializzazione widget meteo...";

        // 1) Rimuove eventuali script esistenti del widget
        document.querySelectorAll('script[src*="weatherwidget.io"]').forEach(s => s.remove());

        // 2) Rimuove eventuali iframe generati male
        document.querySelectorAll('.weatherwidget-io iframe').forEach(i => i.remove());

        // 3) Ricrea lo script originale
        const script = document.createElement("script");
        script.src = "https://weatherwidget.io/js/widget.min.js";
        script.async = true;

        // 4) Fallback automatico se il widget non parte
        script.onload = () => {
            setTimeout(() => {
                const iframe = document.querySelector('.weatherwidget-io iframe');
                if (!iframe) {
                    console.warn("⚠️ Meteo non inizializzato, retry...");
                    if (window.__weatherwidget_init) {
                        window.__weatherwidget_init();
                    }
                } else if (loader) {
                    loader.textContent = "Meteo aggiornato";
                    setTimeout(() => loader.remove(), 1500);
                }
            }, 900);
        };

        // 5) Inserisce lo script nel body
        document.body.appendChild(script);

        // 6) Fallback finale se proprio non parte
        setTimeout(() => {
            const iframe = document.querySelector('.weatherwidget-io iframe');
            if (!iframe && loader) {
                loader.textContent = "Meteo non disponibile";
                loader.style.color = "#ff4b6e";
                loader.style.textShadow = "0 0 6px #ff4b6e";
            }
        }, 4000);

    }, 450);
/* ============================================================
   E) SVG ICONS — OK
============================================================ */

const alertIcon = `
<svg class="alert-icon" viewBox="0 0 24 24" aria-hidden="true">
  <path fill="#ff4b6e" d="M12 2L2 22h20L12 2zm0 6l1 8h-2l1-8zm0 10a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
</svg>
`;

const feedIcon = `
<svg class="feed-icon" viewBox="0 0 24 24" aria-hidden="true">
  <path fill="#00eaff" d="M3 3v2c9.4 0 17 7.6 17 17h2C22 11.8 12.2 2 3 2zm0 6v2c5 0 9 4 9 9h2c0-6.1-4.9-11-11-11zm0 6v2c1.7 0 3 1.3 3 3h2c0-2.8-2.2-5-5-5z"/>
</svg>
`;

/* ============================================================
   F) WIDGET CVE DEL GIORNO — OTTIMIZZATO
============================================================ */

async function loadCVEToday() {
    const box = document.getElementById("cve-today");
    if (!box) return;

    const cve = {
        id: "CVE-2026-12345",
        severity: "High",
        desc: "Vulnerabilità RCE in un componente molto diffuso.",
        link: "https://nvd.nist.gov/vuln/detail/CVE-2026-12345",
        img: "img/hero3.jpg"
    };

    box.innerHTML = `
        <div class="box-img-row">
            <img src="${cve.img}" class="box-thumb" alt="Immagine ${cve.id}">
            <div>
                <strong>${cve.id}</strong> — 
                <span style="color:#d32f2f">${cve.severity}</span><br>
                ${cve.desc}<br>
                <a href="${cve.link}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style="color:#ff7b00 !important; text-decoration:none;"
                   onmouseover="this.style.color='#ff9a40'"
                   onmouseout="this.style.color='#ff7b00'">
                   Dettagli →
                </a>
            </div>
        </div>
    `;
}
/* ============================================================
   G) WIDGET CYBER ALERT LIVE — OTTIMIZZATO
============================================================ */

async function loadCyberAlerts() {
    const list = document.getElementById("alert-live");
    if (!list) return;

    const alerts = [
        { text: "Attacco DDoS in corso su infrastrutture EU" },
        { text: "Nuova campagna phishing su larga scala" },
        { text: "Exploit attivo su Apache ActiveMQ" },
        { text: "Malware bancario in rapida diffusione" }
    ];

    list.innerHTML = alerts
        .map(a => `
            <li class="alert-item">
                ${alertIcon}
                <span>${a.text}</span>
            </li>
        `)
        .join("");
}

/* ============================================================
   H) WIDGET FEED DAL MONDO — OTTIMIZZATO
============================================================ */

async function loadWorldFeed() {
    const feed = document.getElementById("world-feed");
    if (!feed) return;

    const items = [
        { text: "Aumentano gli attacchi supply-chain" },
        { text: "Cresce l’adozione Zero Trust" },
        { text: "Nuove normative EU sulla cybersicurezza" },
        { text: "AI nei SOC di nuova generazione" }
    ];

    feed.innerHTML = items
        .map(i => `
            <div class="feed-item">
                ${feedIcon}
                <span>${i.text}</span>
            </div>
        `)
        .join("");
}

/* ============================================================
   I) HEADER SCROLL EFFECT — OTTIMIZZATO
============================================================ */

let lastScroll = 0;

window.addEventListener("scroll", () => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    const current = window.scrollY;

    if (current > 20 && lastScroll <= 20) {
        header.classList.add("scrolled-header");
    } else if (current <= 20 && lastScroll > 20) {
        header.classList.remove("scrolled-header");
    }

    lastScroll = current;
});

/* ============================================================
   L) DROPDOWN NEWS — OTTIMIZZATO
============================================================ */

document.addEventListener("click", function (e) {
    const dropdown = document.querySelector(".dropdown-news");
    if (!dropdown) return;

    dropdown.classList.toggle("open", dropdown.contains(e.target));
});

/* ============================================================
   M) CALCOLATRICE — VERSIONE OTTIMIZZATA
   ------------------------------------------------------------
   - Polling ridotto
   - Caricamento sicuro
   - Evita loop infiniti
============================================================ */

(function ensureCalculatorLoaded() {

    // Attende che la sidebar sia caricata
    if (!document.getElementById("sidebar")) {
        return setTimeout(ensureCalculatorLoaded, 150);
    }

    // Attende che la calcolatrice sia nel DOM
    if (!document.getElementById("calc-display")) {
        return setTimeout(ensureCalculatorLoaded, 150);
    }

    // Controlla se main.js è già stato caricato
    const mainLoaded = [...document.querySelectorAll("script")]
        .some(s => s.src.includes("/assets/js/main.js"));

    // Se non è caricato → caricalo
    if (!mainLoaded) {
        const script = document.createElement("script");
        script.src = "/assets/js/main.js";
        script.onload = () => {
            console.log("main.js caricato automaticamente");
            if (typeof initCalculator === "function") initCalculator();
        };
        document.body.appendChild(script);
        return;
    }

    // Se è già caricato → inizializza
    if (typeof initCalculator === "function") {
        initCalculator();
    }

})();

