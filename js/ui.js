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

        if (id === "sidebar") {
            requestAnimationFrame(() => {
                loadMeteo();
                initOroscopo();
            });
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
   METEO REALE — Open‑Meteo + Icone Neon (VERSIONE CORRETTA)
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

        /* ============================
           DESCRIZIONI COMPLETE
        ============================ */
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

            /* ⭐ MANCAVANO QUESTI → CAUSA “Condizioni sconosciute” */
            80: "Rovesci leggeri",
            81: "Rovesci",
            82: "Rovesci intensi",

            95: "Temporale",
            96: "Temporale con grandine",
            99: "Temporale forte con grandine"
        };

/* ============================================================
   OROSCOPO — VERSIONE DEFINITIVA CORRETTA
============================================================ */

async function initOroscopo() {
    const select = document.getElementById("oroscopo-select");
    const img = document.getElementById("oroscopo-img");
    const text = document.getElementById("oroscopo-text");
    const link = document.getElementById("oroscopo-link");

    if (!select || !img || !text || !link) return;

    try {
        // JSON con percorso ASSOLUTO
        const res = await fetch("https://anonlab.it/data/oroscopo.json");
        const data = await res.json();

        // Immagini con percorso ASSOLUTO
        const base = "https://anonlab.it/img/oroscopo/";

        function updateOroscopo() {
            const sign = select.value;

            img.src = base + sign + ".svg";
            text.textContent = data[sign] || "Oroscopo non disponibile";
            link.href = "https://www.google.com/search?q=oroscopo+" + sign;
        }

        updateOroscopo();
        select.addEventListener("change", updateOroscopo);

    } catch (e) {
        console.error("Errore oroscopo:", e);
        text.textContent = "Oroscopo non disponibile";
    }
}
/* ============================================================
   C) TICKER CONTINUO
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
   WAIT FOR SIDEBAR
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

        loadMeteo(); // fallback

    });

});
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
/* METEO ANONLAB 2.0 */

const METEO_ICONS = {
    0: "clear.svg",
    1: "cloud.svg",
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

const LOCATIONS = {
    "Varese": { lat: 45.8206, lon: 8.8251 },
    "Milano": { lat: 45.4642, lon: 9.1900 },
    "Roma": { lat: 41.9028, lon: 12.4964 },
    "Torino": { lat: 45.0703, lon: 7.6869 },
    "Napoli": { lat: 40.8518, lon: 14.2681 }
};

function initMeteo() {
    const select = document.getElementById("meteo-select");

    Object.keys(LOCATIONS).forEach(city => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        select.appendChild(opt);
    });

    const saved = localStorage.getItem("meteo-city") || "Varese";
    select.value = saved;

    loadMeteo(saved);

    select.addEventListener("change", () => {
        localStorage.setItem("meteo-city", select.value);
        loadMeteo(select.value);
    });
}

async function loadMeteo(city) {
    const { lat, lon } = LOCATIONS[city];

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const res = await fetch(url);
    const data = await res.json();

    updateCurrent(data.current_weather, city);
    updateWeek(data.daily);
}

function updateCurrent(current, city) {
    document.getElementById("meteo-city").textContent = city;
    document.getElementById("meteo-temp").textContent = `${current.temperature}°C`;

    const desc = weatherDescription(current.weathercode);
    document.getElementById("meteo-desc").textContent = desc;

    const icon = METEO_ICONS[current.weathercode] || "default.svg";
    document.getElementById("meteo-icon").src = `/img/meteo/${icon}`;
}

function updateWeek(daily) {
    const container = document.getElementById("meteo-week");
    container.innerHTML = "";

    for (let i = 0; i < 5; i++) {
        const code = daily.weathercode[i];
        const icon = METEO_ICONS[code] || "default.svg";

        const day = document.createElement("div");
        day.className = "meteo-day";

        day.innerHTML = `
            <img src="/img/meteo/${icon}">
            <span>${daily.temperature_2m_max[i]}°</span>
        `;

        container.appendChild(day);
    }
}

function weatherDescription(code) {
    const map = {
        0: "Sereno",
        1: "Poco nuvoloso",
        2: "Variabile",
        3: "Nuvoloso",
        45: "Nebbia",
        48: "Nebbia",
        51: "Pioggia leggera",
        53: "Pioggia",
        55: "Pioggia intensa",
        61: "Pioggia",
        63: "Pioggia",
        65: "Pioggia forte",
        71: "Neve",
        73: "Neve",
        75: "Neve intensa",
        95: "Temporale",
        96: "Temporale",
        99: "Temporale forte"
    };
    return map[code] || "N/D";
}

document.addEventListener("DOMContentLoaded", initMeteo);
