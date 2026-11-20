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
                if (typeof initRadio === "function") initRadio();
                if (typeof initYouTubePlayer === "function") initYouTubePlayer();
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

/* === SIDEBAR TELEMETRIA VARESE (IN `/js/ui.js`) === */
(() => {
  const VARESE_LAT = 45.8206;
  const VARESE_LON = 8.8251;
  const CACHE_KEY  = "anonlab_varese_telemetry_v2";
  const CACHE_TTL  = 10 * 60 * 1000;

  let telemetryBooted = false;
  let lastBoundBtn = null;

  function windCompass(deg) {
    const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
    return dirs[Math.round((Number(deg) || 0) / 45) % 8];
  }

  function setGaugeNeedle(id, value, min, max) {
    const el = document.getElementById(id);
    if (!el || !Number.isFinite(value)) return;
    const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
    const angle = -90 + ratio * 180;
    el.setAttribute("transform", `rotate(${angle.toFixed(1)} 60 62)`);
  }

  function updateClockAndNet() {
    const timeEl = document.getElementById("anon-clock-time");
    if (!timeEl) return;

    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const dateEl = document.getElementById("anon-clock-date");
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("it-IT", {
        timeZone: "Europe/Rome",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    }

    const utcEl = document.getElementById("anon-clock-utc");
    if (utcEl) {
      const hh = String(now.getUTCHours()).padStart(2, "0");
      const mm = String(now.getUTCMinutes()).padStart(2, "0");
      const ss = String(now.getUTCSeconds()).padStart(2, "0");
      utcEl.textContent = `${hh}:${mm}:${ss} UTC`;
    }

    const netEl = document.getElementById("anon-net-speed");
    if (netEl) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn && Number.isFinite(conn.downlink)) {
        netEl.textContent = `${conn.downlink} Mbps`;
      } else {
        netEl.textContent = navigator.onLine ? "Online" : "Offline";
      }
    }

    // Collega il pulsante Live se la sidebar è stata appena iniettata
    const btn = document.getElementById("anon-refresh-btn");
    if (btn && btn !== lastBoundBtn) {
      lastBoundBtn = btn;
      btn.addEventListener("click", () => fetchVareseAll(true));
    }

    if (!telemetryBooted) {
      telemetryBooted = true;
      fetchVareseAll(false);
      setInterval(() => fetchVareseAll(true), CACHE_TTL);
    }
  }

  function renderData(wx, aq) {
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    if (wx) {
      const hum      = Number(wx.relative_humidity_2m);
      const rain     = Number(wx.precipitation);
      const pressure = Number(wx.pressure_msl);
      const wind     = Number(wx.wind_speed_10m);
      const gusts    = Number(wx.wind_gusts_10m);
      const windDir  = Number(wx.wind_direction_10m);

      setTxt("anon-hum", Number.isFinite(hum) ? `${Math.round(hum)}%` : "--%");
      setTxt("anon-rain", Number.isFinite(rain) ? `${rain.toFixed(1)} mm` : "-- mm");

      if (Number.isFinite(pressure)) {
        setTxt("anon-baro-val", `${Math.round(pressure)} hPa`);
        setGaugeNeedle("anon-baro-needle", pressure, 960, 1050);

        let trend = "Stabile", col = "#00eaff";
        if (pressure >= 1020) { trend = "Alta Pressione"; col = "#00ff99"; }
        else if (pressure <= 1005) { trend = "Bassa Pressione"; col = "#ff4a4a"; }
        const tEl = document.getElementById("anon-baro-trend");
        if (tEl) { tEl.textContent = trend; tEl.style.color = col; }
      }

      if (Number.isFinite(wind)) {
        setTxt("anon-wind-val", `${Math.round(wind)} km/h`);
        setGaugeNeedle("anon-wind-needle", wind, 0, 100);
        setTxt("anon-wind-dir", `Dir: ${windCompass(windDir)} (${Math.round(windDir)}°)`);
      }

      setTxt("anon-wind-gusts", Number.isFinite(gusts) ? `${Math.round(gusts)} km/h` : "-- km/h");
    }

    if (aq) {
      const aqi  = Number(aq.european_aqi);
      const pm25 = Number(aq.pm2_5);
      const pm10 = Number(aq.pm10);
      const uv   = Number(aq.uv_index);

      if (Number.isFinite(aqi)) {
        let lbl = "Ottima", col = "#00ff99";
        if (aqi > 80)      { lbl = "Molto scarsa"; col = "#ff4a4a"; }
        else if (aqi > 60) { lbl = "Scarsa";       col = "#ff7b00"; }
        else if (aqi > 40) { lbl = "Discreta";     col = "#ffcc00"; }
        else if (aqi > 20) { lbl = "Buona";        col = "#00eaff"; }

        const valEl = document.getElementById("anon-aqi-val");
        const lblEl = document.getElementById("anon-aqi-label");
        if (valEl) { valEl.textContent = Math.round(aqi); valEl.style.color = col; }
        if (lblEl) { lblEl.textContent = lbl; lblEl.style.color = col; }
      }

      setTxt("anon-pm25", Number.isFinite(pm25) ? `${pm25.toFixed(1)} µg/m³` : "--");
      setTxt("anon-pm10", Number.isFinite(pm10) ? `${pm10.toFixed(1)} µg/m³` : "--");
      setTxt("anon-uv",   Number.isFinite(uv)   ? uv.toFixed(1) : "--");
    }
  }

  async function fetchVareseAll(force = false) {
    const btn = document.getElementById("anon-refresh-btn");
    try {
      if (!force) {
        try {
          const raw = sessionStorage.getItem(CACHE_KEY);
          if (raw) {
            const c = JSON.parse(raw);
            if (c && (Date.now() - c.ts) < CACHE_TTL) {
              renderData(c.wx, c.aq);
              return;
            }
          }
        } catch (_) {}
      }

      if (btn) btn.textContent = "⏳ Sync";

      const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${VARESE_LAT}&longitude=${VARESE_LON}&current=relative_humidity_2m,precipitation,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=Europe%2FRome`;
      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${VARESE_LAT}&longitude=${VARESE_LON}&current=european_aqi,pm2_5,pm10,uv_index&timezone=Europe%2FRome`;

      const [wxRes, aqRes] = await Promise.allSettled([
        fetch(wxUrl, { cache: "no-store" }).then(r => r.ok ? r.json() : null),
        fetch(aqUrl, { cache: "no-store" }).then(r => r.ok ? r.json() : null)
      ]);

      const wx = wxRes.status === "fulfilled" ? wxRes.value?.current : null;
      const aq = aqRes.status === "fulfilled" ? aqRes.value?.current : null;

      renderData(wx, aq);

      try {
        if (wx || aq) {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), wx, aq }));
        }
      } catch (_) {}

      if (btn) btn.textContent = "🔄 Live";
    } catch (_) {
      if (btn) btn.textContent = "🔄 Riprova";
    }
  }

  // Avvio immediato + osservazione del DOM appena #sidebar viene iniettato
  window.initVareseTelemetry = function () {
    updateClockAndNet();
    if (!window.__vareseClockStarted) {
      window.__vareseClockStarted = true;
      setInterval(updateClockAndNet, 1000);
    }
  };
})();

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
   PRE-FETCH IMMEDIATO DEI PARTIALS (Parte a tempo 0)
============================================================ */
// I file iniziano a scaricare subito in parallelo, prima ancora che il DOM sia pronto
const partialsCache = {
    header: fetch("partials/header.html").then(r => r.ok ? r.text() : "").catch(() => ""),
    ticker: fetch("partials/ticker.html").then(r => r.ok ? r.text() : "").catch(() => ""),
    sidebar: fetch("partials/sidebar.html").then(r => r.ok ? r.text() : "").catch(() => ""),
    footer: fetch("partials/footer.html").then(r => r.ok ? r.text() : "").catch(() => "")
};

/* ============================================================
   D) DOM READY — INIEZIONE ISTANTANEA (ZERO ATTESE)
============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Inietta Header e avvia subito il timer di sessione nell'header
    const headerEl = document.getElementById("header");
    if (headerEl) {
        headerEl.innerHTML = await partialsCache.header;
        if (typeof initSessionTimer === "function") initSessionTimer();
    }

    // 2. Inietta Ticker
    const tickerEl = document.getElementById("ticker");
    if (tickerEl) {
        tickerEl.innerHTML = await partialsCache.ticker;
        if (typeof loadTickerNews === "function") loadTickerNews();
    }

    // 3. Inietta Sidebar
    const sidebarEl = document.getElementById("sidebar");
    if (sidebarEl) {
        sidebarEl.innerHTML = await partialsCache.sidebar;
       const bmeteoBox = document.getElementById("bmeteo-container");
if (bmeteoBox) {
    let bmeteoLoaded = false;
    const load3BMeteo = () => {
        if (bmeteoLoaded) return;
        bmeteoLoaded = true;
        bmeteoBox.innerHTML = '<iframe src="https://www.3bmeteo.com/moduli_esterni/italia_7_giorni/ffffff/1461a1/5e5e5e" sandbox="allow-scripts allow-same-origin allow-popups" width="100%" height="340" frameborder="0" scrolling="no" title="Previsioni meteo 7 giorni"></iframe>';
    };
    ["wheel", "touchstart", "mousemove", "keydown"].forEach(ev => {
        window.addEventListener(ev, load3BMeteo, { once: true, passive: true });
    });
}

        const initSidebarWidgets = () => {
            loadMeteo();
            initOroscopo();
            if (typeof window.initVareseTelemetry === "function") window.initVareseTelemetry();
            if (typeof initRadio === "function") initRadio();
            if (typeof initYouTubePlayer === "function") initYouTubePlayer();
            if (typeof initCalculator === "function") initCalculator();
        };

        // Su Desktop la sidebar è visibile subito (parte istantaneamente);
        // su Mobile è in fondo alla pagina (aspetta lo scroll senza rubare banda all'LCP!)
        if ("IntersectionObserver" in window) {
            const sbObs = new IntersectionObserver((entries, obs) => {
                if (entries.some(e => e.isIntersecting)) {
                    obs.disconnect();
                    initSidebarWidgets();
                }
            }, { rootMargin: "50px" });
            sbObs.observe(sidebarEl);
        } else {
            initSidebarWidgets();
        }
    }

    // 4. Inietta Footer
    const footerEl = document.getElementById("footer");
    if (footerEl) {
        footerEl.innerHTML = await partialsCache.footer;
    }

    // 5. Contatore visite: parte dopo il completamento del caricamento per non interferire con l'LCP
    if (typeof initVisitCounter === "function") {
        if (document.readyState === "complete") {
            setTimeout(initVisitCounter, 1500);
        } else {
            window.addEventListener("load", () => setTimeout(initVisitCounter, 1500), { once: true });
        }
    }
});

/* ============================================================
   I) HEADER SCROLL EFFECT (Spostato dentro window scope sicuro)
============================================================ */

window.addEventListener("DOMContentLoaded", () => {
    let lastScrollUi = 0;
    window.addEventListener("scroll", () => {
        const header = document.querySelector(".site-header");
        if (!header) return;

        const current = window.scrollY;

        if (current > 20 && lastScrollUi <= 20) {
            header.classList.add("scrolled-header");
        } else if (current <= 20 && lastScrollUi > 20) {
            header.classList.remove("scrolled-header");
        }

        lastScrollUi = current;
    });
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
    var w = (window.screen && window.screen.width) ? window.screen.width : 1024;
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

function loadCounterData() {
    anonlabGet(ANONLAB.api + "update.php?ping=1&vid=" + encodeURIComponent(ANONLAB.vid) + "&t=" + Date.now())
        .then(updateCounterUI)
        .catch(function (err) { console.error("Errore loadCounterData:", err); });
}

function initVisitCounter() {
    ANONLAB.vid = anonlabVisitId();

    anonlabGet(ANONLAB.api + "update.php?page=" + encodeURIComponent(anonlabPage()) +
               "&vid=" + encodeURIComponent(ANONLAB.vid) +
               "&device=" + anonlabDevice() + "&t=" + Date.now())
        .then(updateCounterUI)
        .catch(function (err) { console.error("Errore update.php:", err); });

    if (!window.__anonlabTimersStarted) {
        window.__anonlabTimersStarted = true;
        setInterval(loadCounterData, 30000);
        anonlabPulse();
    }
}

function updateCounterUI(data) {
    if (!data || data.error) return;

    anonlabSet("visit-unique",   anonlabNum(data.unique));
    anonlabSet("visit-counter", anonlabNum(data.total));
    anonlabSet("visit-today",   anonlabNum(data.today ? data.today.visits : 0));
    anonlabSet("online-users",  anonlabNum(data.online_count));
    anonlabSet("page-counter",  anonlabNum(data.total_pages));
    
    var currentPageKey = anonlabPage();
    var pagesObj = data.pages || {};
    var pageViews = (pagesObj[currentPageKey] !== undefined) ? pagesObj[currentPageKey] : 0;
    anonlabSet("current-page-count", anonlabNum(pageViews));

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

    var list = document.getElementById("pages-list");
    if (list) {
        var pages = data.pages || {};
        var nomi = Object.keys(pages).sort(function (a, b) { return pages[b] - pages[a]; });
        var frag = document.createDocumentFragment();
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
            frag.appendChild(li);
        });
        list.innerHTML = "";
        list.appendChild(frag);
    }

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

function initUpdateNotification() {
    const currentUpdateId = "upd_2026_11_07_v2"; 
    const lastSeenUpdate = localStorage.getItem("anonlab_last_update_id");

    if (lastSeenUpdate === currentUpdateId) return;
    if (document.getElementById("anonlab-update-toast")) return;

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
                <button id="close-toast-btn" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0 4px;" aria-label="Chiudi notifica">✕</button>
            </div>
            <p style="margin: 0 0 6px 0; color: #fff; font-size: 0.85rem; font-weight: 600;">
                Nuovo aggiornamento rilasciato
            </p>
            <p style="margin: 0 0 10px 0; color: #ccc; font-size: 0.78rem; line-height: 1.4;">
                Abbiamo rinnovato la <strong>Sidebar</strong> e aggiornato le sezioni in<strong>Tools</strong>, <strong>news</strong> e <strong>cyber</strong>.
            </p>
            <a href="/tools.html" style="display: inline-block; color: #030712; background: #00eaff; text-decoration: none; font-size: 0.75rem; font-weight: bold; padding: 6px 12px; border-radius: 4px; transition: opacity 0.2s;">
                Scopri le novità →
            </a>
        </div>
    `;

    document.body.appendChild(toastContainer);

    const removeToast = () => {
        const el = document.getElementById("anonlab-update-toast");
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
    };

    const closeBtn = document.getElementById("close-toast-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            removeToast();
            localStorage.setItem("anonlab_last_update_id", currentUpdateId);
        });
    }

    setTimeout(() => {
        removeToast();
    }, 12000);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(initUpdateNotification, 2500);
    });
} else {
    setTimeout(initUpdateNotification, 2500);
}

/* ============================================================
   ⭐ CALCOLATRICE SIDEBAR — GESTIONE EVENTI IMMEDIATA
============================================================ */
document.addEventListener('click', function (e) {
    const btn = e.target.closest('.calc-btn');
    if (!btn) return;

    e.preventDefault();

    const display = document.getElementById('calc-display');
    if (!display) return;

    const value = btn.textContent.trim();

    // Reset C
    if (value === 'C') {
        display.textContent = '0';
        return;
    }

    // Tasto Uguale = (Calcolo)
    if (value === '=' || value === '==') {
        try {
            let expr = display.textContent.trim();
            expr = expr.replace(/×/g, '*').replace(/÷/g, '/');

            if (!/^[0-9+\-*/.() ]+$/.test(expr)) {
                display.textContent = 'Errore';
                return;
            }

            const result = Function('"use strict"; return (' + expr + ')')();

            if (result === undefined || !isFinite(result)) {
                display.textContent = 'Errore';
            } else {
                display.textContent = String(Math.round(result * 100000000) / 100000000);
            }
        } catch {
            display.textContent = 'Errore';
        }
        return;
    }

    // Cifre e Operatori
    if (display.textContent === '0' || display.textContent === 'Errore') {
        if (['+', '-', '*', '/'].includes(value)) {
            display.textContent = '0' + value;
        } else {
            display.textContent = value;
        }
    } else {
        const lastChar = display.textContent.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar) && ['+', '-', '*', '/'].includes(value)) {
            display.textContent = display.textContent.slice(0, -1) + value;
        } else {
            display.textContent += value;
        }
    }
});
