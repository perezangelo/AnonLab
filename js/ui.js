/* ============================================================
   PARTIALS LOADER — VERSIONE STABILE
============================================================ */

async function loadPartial(id, file) {
    const el = document.getElementById(id);
    if (!el) return Promise.resolve();   // ⭐ FIX 1

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(file, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok || !res.headers.get("content-type")?.includes("text/html")) {
            throw new Error(`Errore nel caricamento di ${file}`);
        }

        const html = await res.text();
        el.innerHTML = html;

        /* ============================================================
           SIDEBAR — INIZIALIZZAZIONE WIDGET
        ============================================================ */
        if (id === "sidebar") {
            requestAnimationFrame(() => {
                loadMeteo();
                initOroscopo();
                // ⭐ Il contatore visite verrà gestito nella PARTE 2
            });
        }

        return Promise.resolve();   // ⭐ FIX 2

    } catch (err) {
        console.error(err);
        el.innerHTML = `<p class="error">Impossibile caricare ${file}</p>`;
        return Promise.resolve();   // ⭐ FIX 3
    }
}

/* ============================================================
   METEO — Open‑Meteo + Icone Neon
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
            80: "Rovesci leggeri",
            81: "Rovesci",
            82: "Rovesci intensi",
            95: "Temporale",
            96: "Temporale con grandine",
            99: "Temporale forte con grandine"
        };

        const meteoIcon = {
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
            80: "rain.svg",
            81: "rain.svg",
            82: "rain.svg",
            95: "storm.svg",
            96: "storm.svg",
            99: "storm.svg"
        };

        cityEl.textContent = "Varese";
        tempEl.textContent = `${temp}°C`;
        descEl.textContent = meteoDesc[code] || "Condizioni sconosciute";

        iconEl.src = `/img/img/meteo/${meteoIcon[code] || "default.svg"}`;
        iconEl.style.width = "auto";
        iconEl.style.maxWidth = "100px";
        iconEl.style.height = "auto";

    } catch (e) {
        console.error(e);
        descEl.textContent = "Meteo non disponibile";
        descEl.style.color = "#ff4b6e";
        iconEl.src = "/img/img/meteo/default.svg";
    }
}

/* ============================================================
OROSCOPO — VERSIONE DEFINITIVA SKY TG24
============================================================ */
 
async function initOroscopo() {
 
const select = document.getElementById("oroscopo-select");
const img = document.getElementById("oroscopo-img");
const text = document.getElementById("oroscopo-text");
const link = document.getElementById("oroscopo-link");
 
if (!select || !img || !text || !link) return;
 
try {
 
const res = await fetch(
"https://anonlab.it/data/oroscopo.json"
);
 
const data = await res.json();
 
const baseImg =
"https://anonlab.it/img/oroscopo/";
 
function updateOroscopo() {
 
const sign = select.value;
const signLabel =
select.options[select.selectedIndex].text;
 
img.src =
`${baseImg}${sign}.svg`;
 
text.textContent =
data[sign] || "Oroscopo non disponibile";
 
link.href =
`https://tg24.sky.it/lifestyle/oroscopo/${sign}/oggi`;
 
link.target = "_blank";
link.rel = "noopener noreferrer";
 
link.textContent =
`Leggi l'oroscopo di ${signLabel} →`;
}
 
updateOroscopo();
 
select.addEventListener(
"change",
updateOroscopo
);
 
} catch (error) {
 
console.error(
"Errore oroscopo:",
error
);
 
text.textContent =
"Oroscopo non disponibile";
}
}
 
document.addEventListener(
"DOMContentLoaded",
initOroscopo
);

/* ============================================================
   OROSCOPO — ISCRIZIONE NEWSLETTER
============================================================ */

function iscriviOroscopo() {
    const email = document.getElementById("oroscopo-email")?.value.trim();
    const segno = document.getElementById("oroscopo-select")?.value;
    const optin = document.getElementById("oroscopo-optin")?.checked;

    if (!email || !email.includes("@")) {
        alert("Inserisci una email valida.");
        return;
    }

    if (!segno) {
        alert("Seleziona il tuo segno zodiacale.");
        return;
    }

    if (!optin) {
        alert("Seleziona la checkbox per ricevere ogni giorno il tuo oroscopo aggiornato.");
        return;
    }

    fetch("https://angelonline.altervista.org/backend/save-oroscopo.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, segno })
    })
    .then(r => r.text())
    .then(t => {
        alert(t || "Iscrizione registrata correttamente.");
    })
    .catch(() => {
        alert("Si è verificato un errore. Riprova più tardi.");
    });
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

    // Caricamento partials
    loadPartial("header", "partials/header.html");
    loadPartial("ticker", "partials/ticker.html").then(() => {
        if (typeof loadTickerNews === "function") loadTickerNews();
    });

    loadPartial("sidebar", "partials/sidebar.html");   // ⭐ Sidebar obbligatoria
    loadPartial("footer", "partials/footer.html");

    // Attende che la sidebar sia caricata
    waitForSidebar().then(() => {

        // Meteo (fallback)
        loadMeteo();

        // ⭐ Inizializza il contatore SOLO quando la sidebar esiste
        if (typeof initVisitCounter === "function") {
            initVisitCounter();   // <-- questa è la funzione corretta
        }

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


Action: create_file({"file_text":"/* ============================================================\n   ANONLAB — CONTATORE VISITE (frontend, versione migliorata)\n   - Data/ora/saluto dal SERVER (Europe/Rome), coerenti per tutti\n   - Conteggio \"Questa pagina\" corretto\n   - Lista pagine ordinata per visite e pulita\n   - Utenti online affidabili\n   - Aggiornamento periodico\n============================================================ */\n\n(function () {\n\n    \"use strict\";\n\n    var UPDATE_URL = \"https://angelonline.altervista.org/counter/update.php\";\n    var PROXY_URL  = \"https://angelonline.altervista.org/counter/proxy.php\";\n    var REFRESH_MS = 10000;\n\n    /* ------------------------------------------------------------\n       NORMALIZZA NOME PAGINA (coerente con update.php)\n    ------------------------------------------------------------ */\n    function currentPageName() {\n        var p = window.location.pathname || \"\";\n        p = p.split(\"?\")[0].split(\"#\")[0];\n        p = p.replace(/\\/+$/, \"\");          // rimuove slash finali\n        var parts = p.split(\"/\");\n        var last = parts[parts.length - 1]; // basename\n        if (!last || last.trim() === \"\") last = \"index.html\";\n        return last;\n    }\n\n    /* ------------------------------------------------------------\n       AVVIO\n    ------------------------------------------------------------ */\n    function initVisitCounter() {\n        if (window.__anonlabVisitCounterStarted) return;\n        window.__anonlabVisitCounterStarted = true;\n\n        var page = currentPageName();\n\n        /* 1) Incrementa una sola volta per caricamento */\n        fetch(UPDATE_URL + \"?page=\" + encodeURIComponent(page))\n            .then(function (r) { return r.json(); })\n            .then(function (data) { updateCounterUI(data); })\n            .catch(function (err) { console.error(\"Errore update.php:\", err); });\n\n        /* 2) Letture periodiche dal proxy (no incremento) */\n        setInterval(loadCounterData, REFRESH_MS);\n    }\n\n    /* ------------------------------------------------------------\n       LETTURA DAL PROXY\n    ------------------------------------------------------------ */\n    function loadCounterData() {\n        fetch(PROXY_URL + \"?cache=\" + Date.now())\n            .then(function (r) { return r.json(); })\n            .then(function (data) { updateCounterUI(data); })\n            .catch(function (err) { console.error(\"Errore counter frontend:\", err); });\n    }\n\n    /* ------------------------------------------------------------\n       HELPER\n    ------------------------------------------------------------ */\n    function setText(id, value) {\n        var el = document.getElementById(id);\n        if (el) el.textContent = value;\n    }\n\n    function formatNumber(n) {\n        n = Number(n) || 0;\n        return n.toLocaleString(\"it-IT\");\n    }\n\n    /* ------------------------------------------------------------\n       AGGIORNAMENTO UI\n    ------------------------------------------------------------ */\n    function updateCounterUI(data) {\n        if (!data || typeof data !== \"object\") return;\n\n        var pages  = data.pages  || {};\n        var today  = data.today  || {};\n        var online = data.online || {};\n        var server = data.server || {};\n\n        /* KPI principali */\n        setText(\"visit-counter\", formatNumber(data.total));\n        setText(\"page-counter\",  formatNumber(Object.keys(pages).length));\n\n        /* Dispositivi */\n        setText(\"dev-mobile\",  formatNumber(today.mobile));\n        setText(\"dev-desktop\", formatNumber(today.desktop));\n        setText(\"dev-tablet\",  formatNumber(today.tablet));\n\n        /* Utenti online */\n        setText(\"online-users\", formatNumber(Object.keys(online).length));\n\n        /* Pagina corrente */\n        var page = currentPageName();\n        setText(\"current-page-count\", formatNumber(pages[page]));\n\n        /* Lista pagine — ordinata per visite (desc) e pulita */\n        var listEl = document.getElementById(\"pages-list\");\n        if (listEl) {\n            listEl.innerHTML = \"\";\n            Object.keys(pages)\n                .filter(function (p) { return p && p.trim() !== \"\"; })\n                .sort(function (a, b) { return (pages[b] || 0) - (pages[a] || 0); })\n                .forEach(function (p) {\n                    var li = document.createElement(\"li\");\n                    if (p === page) li.setAttribute(\"aria-current\", \"page\");\n\n                    var name = document.createElement(\"span\");\n                    name.textContent = p;\n\n                    var count = document.createElement(\"strong\");\n                    count.style.marginLeft = \"6px\";\n                    count.textContent = formatNumber(pages[p]);\n\n                    li.appendChild(name);\n                    li.appendChild(document.createTextNode(\" — \"));\n                    li.appendChild(count);\n                    listEl.appendChild(li);\n                });\n        }\n\n        /* Saluto / Data / Ora dal SERVER (coerenti per tutti) */\n        setText(\"visit-greeting\", server.greeting || \"Ciao!\");\n        setText(\"visit-date\",     server.date     || \"--/--/----\");\n        setText(\"visit-time\",     server.time     || \"--:--:--\");\n    }\n\n    /* ------------------------------------------------------------\n       BOOT\n    ------------------------------------------------------------ */\n    if (document.readyState === \"loading\") {\n        document.addEventListener(\"DOMContentLoaded\", initVisitCounter);\n    } else {\n        initVisitCounter();\n    }\n\n    /* Esponi per uso manuale se serve */\n    window.initVisitCounter = initVisitCounter;\n    window.loadCounterData  = loadCounterData;\n\n})();\n","lint_rule_config":{"directive":"Fix these {blocking} blocking lint error(s) before continuing.","enabled":true,"rules":[{"id":"EB001","mode":"on"},{"id":"EB002","mode":"on"},{"id":"EB004","mode":"on"}]},"path":"/app/counter/counter.js","run_lint":true})
Observation: Create successful: /app/counter/counter.js
