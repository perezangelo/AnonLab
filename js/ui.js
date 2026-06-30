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
   OROSCOPO — VERSIONE DEFINITIVA
============================================================ */

async function initOroscopo() {
    const select = document.getElementById("oroscopo-select");
    const img = document.getElementById("oroscopo-img");
    const text = document.getElementById("oroscopo-text");
    const link = document.getElementById("oroscopo-link");

    if (!select || !img || !text || !link) return;

    try {
        const res = await fetch("https://anonlab.it/data/oroscopo.json");
        const data = await res.json();

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

    fetch("https://angelonline.altervista.org/save-oroscopo.php", {
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
        .some(s => s.src.includes("/js/main.js"));

    if (!mainLoaded) {
        const script = document.createElement("script");
        script.src = "/js/main.js";
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

/* ============================================================
   CONTATORE VISITE — VERSIONE DEFINITIVA
============================================================ */

function initVisitCounter() {

    // 🔥 REGISTRA LA VISITA SU ALTERVISTA
    fetch("https://angelonline.altervista.org/counter/update.php", {
        method: "POST"
    });

    // 🔥 POI LEGGE IL JSON AGGIORNATO TRAMITE PROXY
    fetch("https://angelonline.altervista.org/counter/proxy.php?cache=" + Date.now())
        .then(r => r.json())
        .then(data => {
            updateCounterUI(data);
        })
        .catch(err => console.error("Errore counter frontend:", err));
}

/* ============================================================
   AGGIORNAMENTO UI DEL CONTATORE
============================================================ */

function updateCounterUI(data) {

    const elTotal       = document.getElementById("visit-counter");
    const elPagesTotal  = document.getElementById("page-counter");
    const elCurrentPage = document.getElementById("current-page-count");
    const elPagesList   = document.getElementById("pages-list");

    const elOnline      = document.getElementById("online-users");
    const elMobile      = document.getElementById("dev-mobile");
    const elDesktop     = document.getElementById("dev-desktop");
    const elTablet      = document.getElementById("dev-tablet");

    const elGreeting    = document.getElementById("visit-greeting");
    const elDate        = document.getElementById("visit-date");
    const elTime        = document.getElementById("visit-time");

    /* ============================================================
       KPI PRINCIPALI
    ============================================================ */
    if (elTotal)      elTotal.textContent      = data.total ?? 0;
    if (elPagesTotal) elPagesTotal.textContent = Object.keys(data.pages || {}).length;

    /* ============================================================
       DISPOSITIVI
    ============================================================ */
    if (elMobile)  elMobile.textContent  = data.today?.mobile  ?? 0;
    if (elDesktop) elDesktop.textContent = data.today?.desktop ?? 0;
    if (elTablet)  elTablet.textContent  = data.today?.tablet  ?? 0;

    /* ============================================================
       UTENTI ONLINE
    ============================================================ */
    if (elOnline) elOnline.textContent = Object.keys(data.online || {}).length;

    /* ============================================================
       PAGINA CORRENTE
    ============================================================ */
    const currentPage = window.location.pathname.replace("/", "") || "index.html";
    const pageCount   = data.pages?.[currentPage] ?? 0;

    if (elCurrentPage) elCurrentPage.textContent = pageCount;

    /* ============================================================
       LISTA PAGINE VISITATE
    ============================================================ */
    if (elPagesList) {
        elPagesList.innerHTML = "";
        if (data.pages) {
            Object.keys(data.pages).forEach(page => {
                const li = document.createElement("li");
                li.textContent = `${page}: ${data.pages[page]}`;
                elPagesList.appendChild(li);
            });
        }
    }

    /* ============================================================
       SALUTO DINAMICO
    ============================================================ */
    if (elGreeting) {
        const hour = new Date().getHours();
        let greeting = "Ciao!";
        if (hour < 12) greeting = "Buongiorno!";
        else if (hour < 18) greeting = "Buon pomeriggio!";
        else greeting = "Buona serata!";
        elGreeting.textContent = greeting;
    }

    /* ============================================================
       DATA E ORA
    ============================================================ */
    const now = new Date();

    if (elDate)
        elDate.textContent = now.toLocaleDateString("it-IT");

    if (elTime)
        elTime.textContent = now.toLocaleTimeString("it-IT");
}

