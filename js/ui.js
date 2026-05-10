/* ============================================================
   A) CARICAMENTO PARTIALS — VERSIONE OTTIMIZZATA E ROBUSTA
============================================================ */

async function loadPartial(id, file) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(file, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
            throw new Error(`Errore nel caricamento di ${file}`);
        }

        el.innerHTML = await res.text();

        // Se abbiamo appena caricato la sidebar → avvia il meteo
        if (id === "sidebar") {
            requestAnimationFrame(() => loadMeteo());
        }

        if (id === "header") {
            requestAnimationFrame(initTicker);
        }

    } catch (err) {
        console.error(err);
        el.innerHTML = `<p class="error">Impossibile caricare ${file}</p>`;
    }
}

/* ============================================================
   METEO REALE — Open‑Meteo + Icone Neon
============================================================ */

async function loadMeteo() {
    const cityEl = document.getElementById("meteo-city");
    const tempEl = document.getElementById("meteo-temp");
    const descEl = document.getElementById("meteo-desc");
    const iconEl = document.getElementById("meteo-icon");

    if (!cityEl || !tempEl || !descEl || !iconEl) return;

    try {
        const lat = 45.8206;
        const lon = 8.8251;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;

        const res = await fetch(url);
        const data = await res.json();

        const temp = data.current.temperature_2m;
        const code = data.current.weather_code;

        const meteoDesc = {
            0: "Sereno",
            1: "Prevalentemente sereno",
            2: "Parzialmente nuvoloso",
            3: "Nuvoloso",
            45: "Nebbia",
            48: "Nebbia ghiacciata",
            51: "Pioviggine leggera",
            53: "Pioviggine",
            55: "Pioviggine intensa",
            61: "Pioggia leggera",
            63: "Pioggia",
            65: "Pioggia intensa",
            71: "Neve leggera",
            73: "Neve",
            75: "Neve intensa",
            95: "Temporale",
            96: "Temporale con grandine",
            99: "Temporale forte con grandine"
        };

        const meteoIcon = {
            0: "clear.svg",
            1: "clear.svg",
            2: "cloud.svg",
            3: "cloud.svg",
            45: "fog.svg",
            48: "fog.svg",
            51: "rain.svg",
            53: "rain.svg",
            55: "rain.svg",
            61: "rain.svg",
            63: "rain.svg",
            65: "rain.svg",
            71: "snow.svg",
            73: "snow.svg",
            75: "snow.svg",
            95: "storm.svg",
            96: "storm.svg",
            99: "storm.svg"
        };

        cityEl.textContent = "Varese";
        tempEl.textContent = `${temp}°C`;
        descEl.textContent = meteoDesc[code] || "Condizioni sconosciute";
        iconEl.src = `/img/meteo/${meteoIcon[code] || "default.svg"}`;

    } catch (e) {
        console.error(e);
        descEl.textContent = "Meteo non disponibile";
        descEl.style.color = "#ff4b6e";
        iconEl.src = "/img/meteo/default.svg";
    }
}

/* ============================================================
   C) TICKER CONTINUO — VERSIONE OTTIMIZZATA
============================================================ */

function initTicker() {
    const track = document.querySelector(".ticker-track");
    if (!track) return;

    if (track.dataset.cloned === "true") return;

    const clone = track.cloneNode(true);
    clone.dataset.cloned = "true";
    track.parentElement.appendChild(clone);

    const totalWidth = track.scrollWidth;
    track.style.setProperty("--ticker-width", totalWidth + "px");
}

/* ============================================================
   WAIT FOR SIDEBAR — NECESSARIO PER I WIDGET
============================================================ */

function waitForSidebar() {
    return new Promise(resolve => {
        const check = () => {
            const sidebar = document.getElementById("sidebar");
            if (sidebar && sidebar.innerHTML.trim() !== "") {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}
/* ============================================================
   D) DOM READY — VERSIONE OTTIMIZZATA
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    loadPartial("header", "/partials/header.html");
    loadPartial("ticker", "/partials/ticker.html");
    loadPartial("sidebar", "/partials/sidebar.html");
    loadPartial("footer", "/partials/footer.html");

    waitForSidebar().then(() => {

        if (typeof initVisitCounter === "function") {
            initVisitCounter();
        }

        // loadMeteo() ora parte anche da loadPartial()
        // qui rimane come fallback
        loadMeteo();

    });

});
/* ============================================================
   E) SVG ICONS
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
   F) WIDGET CVE DEL GIORNO
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
   G) WIDGET CYBER ALERT LIVE
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
   H) WIDGET FEED DAL MONDO
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
   I) HEADER SCROLL EFFECT
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
   L) DROPDOWN NEWS
============================================================ */

document.addEventListener("click", function (e) {
    const dropdown = document.querySelector(".dropdown-news");
    if (!dropdown) return;

    dropdown.classList.toggle("open", dropdown.contains(e.target));
});

/* ============================================================
   M) CALCOLATRICE
============================================================ */

(function ensureCalculatorLoaded() {

    if (!document.getElementById("sidebar")) {
        return setTimeout(ensureCalculatorLoaded, 150);
    }

    if (!document.getElementById("calc-display")) {
        return setTimeout(ensureCalculatorLoaded, 150);
    }

    const mainLoaded = [...document.querySelectorAll("script")]
        .some(s => s.src.includes("/assets/js/main.js"));

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

    if (typeof initCalculator === "function") {
        initCalculator();
    }

})();

