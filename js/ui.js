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

/* ============================================================
   ANONLAB — CONTATORE VISITE · interfaccia (v2)
   Nessun CSS da aggiungere: lo stile e' nel riquadro.
   ============================================================ */

var ANONLAB = ANONLAB || {};
ANONLAB.api    = "https://angelonline.altervista.org/counter/";
ANONLAB.pollMs = 15000;   /* ogni quanto aggiornare i numeri   */
ANONLAB.pingMs = 60000;   /* battito per restare "online"      */

function anonlabVisitId() {
    try {
        var id = localStorage.getItem("anonlab_vid");
        if (!id) {
            id = Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem("anonlab_vid", id);
        }
        return id;
    } catch (e) {
        return "";
    }
}

function anonlabPage() {
    var parts = (window.location.pathname || "").toLowerCase().split("/").filter(function (s) { return s !== ""; });
    var last = parts.length ? parts[parts.length - 1] : "";
    last = last.replace(/[^a-z0-9._-]/g, "").slice(0, 60);
    return last || "index.html";
}

function anonlabDevice() {
    var touch = (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) || navigator.maxTouchPoints > 1;
    var w = (window.screen && window.screen.width) ? Math.min(window.innerWidth, window.screen.width) : window.innerWidth;
    if (touch) {
        if (w < 768) return "mobile";
        if (w < 1200) return "tablet";
    }
    return "desktop";
}

function anonlabGet(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) { return r.json(); });
}

function anonlabNum(value) {
    return new Intl.NumberFormat("it-IT").format(Number(value) || 0);
}

function anonlabSet(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
}

/* ============================================================
   AVVIO
   ============================================================ */
function initVisitCounter() {
    if (window.__anonlabVisitCounterStarted) return;
    window.__anonlabVisitCounterStarted = true;

    ANONLAB.vid = anonlabVisitId();

    /* 1) registra la visita: una sola volta per pagina caricata,
          e solo se il server non riconosce un bot */

    anonlabGet(ANONLAB.api + "update.php?page=" + encodeURIComponent(anonlabPage()) +
               "&vid=" + encodeURIComponent(ANONLAB.vid) +
               "&device=" + anonlabDevice() + "&t=" + Date.now())
        .then(updateCounterUI)
        .catch(function (err) { console.error("Errore update.php:", err); });

    /* 2) battito: tiene questo visitatore nella lista "online" */
    setInterval(function () {
        anonlabGet(ANONLAB.api + "update.php?ping=1&vid=" + encodeURIComponent(ANONLAB.vid) + "&t=" + Date.now())
            .catch(function () {});
    }, ANONLAB.pingMs);

    /* 3) aggiornamento dei numeri */
    loadCounterData();
    setInterval(loadCounterData, ANONLAB.pollMs);

    anonlabPulse();
}

/* ============================================================
   LETTURA DEI DATI
   ============================================================ */
function loadCounterData() {
    anonlabGet(ANONLAB.api + "proxy.php?t=" + Date.now())
        .then(updateCounterUI)
        .catch(function (err) { console.error("Errore counter frontend:", err); });
}

/* ============================================================
   AGGIORNAMENTO INTERFACCIA
   ============================================================ */
function updateCounterUI(data) {
    if (!data || data.error) return;

    /* numeri principali */
    anonlabSet("visit-unique",  anonlabNum(data.unique));
    anonlabSet("visit-counter", anonlabNum(data.total));
    anonlabSet("visit-today",   anonlabNum(data.today ? data.today.visits : 0));
    anonlabSet("online-users",  anonlabNum(data.online_count));
    anonlabSet("page-counter",  anonlabNum(data.total_pages));
    anonlabSet("current-page-count", anonlabNum((data.pages || {})[anonlabPage()]));

    /* dispositivi di oggi + barra proporzionale */
    var today   = data.today || {};
    var mobile  = Number(today.mobile) || 0;
    var desktop = Number(today.desktop) || 0;
    var tablet  = Number(today.tablet) || 0;
    var totale  = mobile + desktop + tablet;

    anonlabSet("dev-mobile",  anonlabNum(mobile));
    anonlabSet("dev-desktop", anonlabNum(desktop));
    anonlabSet("dev-tablet",  anonlabNum(tablet));

    [["bar-mobile", mobile], ["bar-desktop", desktop], ["bar-tablet", tablet]].forEach(function (coppia) {
        var bar = document.getElementById(coppia[0]);
        if (bar) bar.style.width = (totale ? Math.round(coppia[1] * 100 / totale) : 0) + "%";
    });

    /* elenco delle pagine, dalla piu' vista */
    var list = document.getElementById("pages-list");
    if (list) {
        var pages = data.pages || {};
        var nomi = Object.keys(pages).sort(function (a, b) { return pages[b] - pages[a]; });
        list.innerHTML = "";
        nomi.forEach(function (nome) {
            var li = document.createElement("li");
            li.style.cssText = "display:flex;justify-content:space-between;gap:10px;padding:3px 0;border-bottom:1px dashed rgba(255,255,255,.06);";

            var etichetta = document.createElement("span");
            etichetta.textContent = nome;
            etichetta.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

            var conteggio = document.createElement("span");
            conteggio.textContent = anonlabNum(pages[nome]);
            conteggio.style.cssText = "color:#00ffcc;font-weight:700;font-variant-numeric:tabular-nums;";

            li.appendChild(etichetta);
            li.appendChild(conteggio);
            list.appendChild(li);
        });
    }

    /* saluto, data e ora */
    var ora = new Date().getHours();
    var saluto = "Ciao!";
    if (ora < 12) saluto = "Buongiorno!";
    else if (ora < 18) saluto = "Buon pomeriggio!";
    else saluto = "Buona serata!";
    anonlabSet("visit-greeting", saluto);

    var adesso = new Date();
    anonlabSet("visit-date", adesso.toLocaleDateString("it-IT"));
    anonlabSet("visit-time", adesso.toLocaleTimeString("it-IT"));
}

/* ============================================================
   PALLINO "ONLINE" — rispetta chi ha ridotto le animazioni
   ============================================================ */
function anonlabPulse() {
    var dot = document.getElementById("online-dot");
    if (!dot) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var acceso = true;
    setInterval(function () {
        acceso = !acceso;
        dot.style.opacity = acceso ? "1" : ".35";
    }, 900);
}
