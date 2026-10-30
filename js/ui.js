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
        const res = await fetch("https://anonlab.it/data/oroscopo.json");
        const data = await res.json();
        const baseImg = "https://anonlab.it/img/oroscopo/";
         
        function updateOroscopo() {
            const sign = select.value;
            const signLabel = select.options[select.selectedIndex].text;
             
            img.src = `${baseImg}${sign}.svg`;
            text.textContent = data[sign] || "Oroscopo non disponibile";
            link.href = `https://tg24.sky.it/lifestyle/oroscopo/${sign}/oggi`;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = `Leggi l'oroscopo di ${signLabel} →`;
        }
         
        updateOroscopo();
        select.addEventListener("change", updateOroscopo);
         
    } catch (error) {
        console.error("Errore oroscopo:", error);
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
        loadMeteo();

        // ⭐ Inizializza il contatore SOLO quando la sidebar esiste
        if (typeof initVisitCounter === "function") {
            initVisitCounter();
        }
    });
});

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
   ANONLAB — CONTATORE VISITE · interfaccia (v2.4 Definitiva)
============================================================ */

var ANONLAB = ANONLAB || {};
ANONLAB.api    = "https://angelonline.altervista.org/counter/";
ANONLAB.pollMs = 15000;    
ANONLAB.pingMs = 60000;    

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
    var path = (window.location.pathname || "").toLowerCase();
    if (path === "" || path === "/" || path === "/index.html" || path.endsWith("/")) {
        return "index.html";
    }
    var parts = path.split("/").filter(function (s) { return s !== ""; });
    var last = parts.length ? parts[parts.length - 1] : "index.html";
    last = last.replace(/[^a-z0-9._-]/g, "").slice(0, 60);
    return (last === "" || last === "anonlab.it") ? "index.html" : last;
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
    if (el) {
        el.textContent = value;
    }
}

/* ============================================================
   AVVIO CONTATORE SICURO (DEFINIZIONI COMPLETE)
============================================================ */

function loadCounterData() {
    anonlabGet(ANONLAB.api + "update.php?page=" + encodeURIComponent(anonlabPage()) + "&vid=" + encodeURIComponent(ANONLAB.vid) + "&t=" + Date.now())
        .then(updateCounterUI)
        .catch(function (err) { console.error("Errore loadCounterData:", err); });
}

function initVisitCounter() {
    ANONLAB.vid = anonlabVisitId();

    // 1) Registra la visita e aggiorna l'interfaccia
    anonlabGet(ANONLAB.api + "update.php?page=" + encodeURIComponent(anonlabPage()) +
               "&vid=" + encodeURIComponent(ANONLAB.vid) +
               "&device=" + anonlabDevice() + "&t=" + Date.now())
        .then(updateCounterUI)
        .catch(function (err) { console.error("Errore update.php:", err); });

    // 2) Carica subito i dati
    loadCounterData();

    // 3) Timers periodici (evita duplicati)
    if (!window.__anonlabTimersStarted) {
        window.__anonlabTimersStarted = true;
        
        setInterval(function () {
            anonlabGet(ANONLAB.api + "update.php?ping=1&vid=" + encodeURIComponent(ANONLAB.vid) + "&t=" + Date.now())
                .catch(function () {});
        }, ANONLAB.pingMs);

        setInterval(loadCounterData, ANONLAB.pollMs);

        anonlabPulse();
    }
}

/* ============================================================
   AGGIORNAMENTO INTERFACCIA
============================================================ */
function updateCounterUI(data) {
    if (!data || data.error) return;

    /* 1. Numeri principali */
    anonlabSet("visit-unique",   anonlabNum(data.unique));
    anonlabSet("visit-counter", anonlabNum(data.total));
    anonlabSet("visit-today",   anonlabNum(data.today ? data.today.visits : 0));
    anonlabSet("online-users",  anonlabNum(data.online_count));
    anonlabSet("page-counter",  anonlabNum(data.total_pages));
    
    var currentPageKey = anonlabPage();
    var pagesObj = data.pages || {};
    var pageViews = (pagesObj[currentPageKey] !== undefined) ? pagesObj[currentPageKey] : 0;
    anonlabSet("current-page-count", anonlabNum(pageViews));

    /* 2. Dispositivi di oggi + barre proporzionali */
    var today   = data.today || {};
    var mobile  = Number(today.mobile) || 0;
    var desktop = Number(today.desktop) || 0;
    var tablet  = Number(today.tablet) || 0;
    var totale  = mobile + desktop + tablet;

    anonlabSet("dev-mobile",  anonlabNum(mobile));
    anonlabSet("dev-desktop", anonlabNum(desktop));
    anonlabSet("dev-tablet",  anonlabNum(tablet));

    var percMobile  = totale ? Math.round(mobile * 100 / totale) : 0;
    var percDesktop = totale ? Math.round(desktop * 100 / totale) : 0;
    var percTablet  = totale ? Math.round(tablet * 100 / totale) : 0;

    var barMobile  = document.getElementById("bar-mobile");
    var barDesktop = document.getElementById("bar-desktop");
    var barTablet  = document.getElementById("bar-tablet");

    if (barMobile)  barMobile.style.width  = percMobile + "%";
    if (barDesktop) barDesktop.style.width = percDesktop + "%";
    if (barTablet)  barTablet.style.width  = percTablet + "%";

    /* 3. Elenco delle pagine viste */
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

    /* 4. Saluto, data e ora */
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
   PALLINO "ONLINE"
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
} // ⭐ Chiusura corretta aggiunta per eliminare l'Unexpected end of input!

// ============================================================
// WIDGET AGGIORNAMENTI DINAMICO (CON CHIUSURA AUTOMATICA)
// ============================================================
function initUpdateNotification() {
  const currentUpdateId = "upd_2026_10_30"; // ID aggiornato
  const lastSeenUpdate = localStorage.getItem("anonlab_last_update_id");

  if (lastSeenUpdate === currentUpdateId) return;

  const toastContainer = document.createElement("div");
  toastContainer.id = "anonlab-update-toast";
  toastContainer.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9990;
      max-width: 320px;
      background: #030712;
      border: 1px solid #00eaff;
      border-radius: 8px;
      padding: 14px 16px;
      box-shadow: 0 0 20px rgba(0, 234, 255, 0.25);
      font-family: Arial, sans-serif;
      animation: fadeInLeft 0.4s ease;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-family: ui-monospace, monospace; font-size: 0.70rem; color: #34d399; background: #0a0f14; padding: 2px 6px; border-radius: 4px; border: 1px solid #1e293b;">
          ● SYSTEM REVISION
        </span>
        <button id="close-toast-btn" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0 4px;">✕</button>
      </div>
      <p style="margin: 0 0 6px 0; color: #fff; font-size: 0.85rem; font-weight: 600;">
        Piattaforma in costante evoluzione
      </p>
      <p style="margin: 0 0 10px 0; color: #ccc; font-size: 0.78rem; line-height: 1.4;">
        Abbiamo aggiornato la guida <strong>OSINT Tools Explained</strong>, i video formativi e rivisto i moduli della <strong>SOC Dashboard</strong>.
      </p>
      <a href="/osint-tools-explained.html" style="display: inline-block; color: #030712; background: #00eaff; text-decoration: none; font-size: 0.75rem; font-weight: bold; padding: 6px 12px; border-radius: 4px; transition: opacity 0.2s;">
        Esplora le novità →
      </a>
    </div>
  `;

  document.body.appendChild(toastContainer);

  // Funzione unificata per chiudere e memorizzare la lettura
  const dismissToast = () => {
    const el = document.getElementById("anonlab-update-toast");
    if (el) {
      el.remove();
      localStorage.setItem("anonlab_last_update_id", currentUpdateId);
    }
  };

  // Chiusura manuale tramite pulsante ✕
  document.getElementById("close-toast-btn").addEventListener("click", dismissToast);

  // Chiusura automatica dopo 12 secondi (tempo ottimale di lettura)
  setTimeout(dismissToast, 12000);
}

// Avvia la notifica dopo 2,5 secondi dal caricamento della pagina
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(initUpdateNotification, 2500);
});
