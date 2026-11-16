// ===============================
// MAIN SCRIPT — ANONLAB
// ===============================

console.log("AnonLab UI loaded");

// ===============================
// SESSION START
// ===============================

if (!sessionStorage.getItem("anonlabStartTime")) {
    sessionStorage.setItem(
        "anonlabStartTime",
        Date.now().toString()
    );
}

// ===============================
// RADIO — APERTURA PAGINA ON AIR
// ===============================

function initRadio() {
    const selector = document.getElementById("radioSelector");

    if (!selector || selector.dataset.ready === "true") return;
    selector.dataset.ready = "true";

    selector.addEventListener("change", () => {
        const url = selector.value;
        if (url) {
            window.open(url, "_blank");
        }
    });

    console.log("Radio inizializzata");
}

// ===============================
// PLAYER YOUTUBE
// ===============================

function initYouTubePlayer() {
    const selector = document.getElementById("ytSelector");
    const iframe = document.getElementById("ytPlayer");

    if (!selector || !iframe || selector.dataset.ready === "true") return;
    selector.dataset.ready = "true";

    selector.addEventListener("change", () => {
        const id = selector.value;
        if (id) {
            iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
    });

    console.log("YouTube Player inizializzato");
}

// ===============================
// NAVBAR MOBILE — HAMBURGER MENU
// ===============================

function initMobileMenu() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}

// ===============================
// ONLINE SESSION TIMER (CORRETTO & RESILIENTE)
// ===============================

function initSessionTimer() {
    let timerInterval = null;

    function getStartTime() {
        let start = parseInt(sessionStorage.getItem("anonlabStartTime"), 10);
        if (isNaN(start) || !start) {
            start = Date.now();
            sessionStorage.setItem("anonlabStartTime", start.toString());
        }
        return start;
    }

    function updateDisplay(timerEl) {
        const startTime = getStartTime();
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));

        const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
        const seconds = String(elapsed % 60).padStart(2, "0");

        timerEl.textContent = `● ONLINE SESSION: ${hours}:${minutes}:${seconds}`;
    }

    function checkAndBindTimer() {
        const timer = document.getElementById("session-timer");

        if (!timer) return false;

        if (timer.dataset.timerStarted === "true" && timerInterval !== null) {
            return true;
        }

        timer.dataset.timerStarted = "true";

        updateDisplay(timer);

        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            const currentTimer = document.getElementById("session-timer");
            if (currentTimer && currentTimer !== timer) {
                checkAndBindTimer();
            } else if (currentTimer) {
                updateDisplay(currentTimer);
            }
        }, 1000);

        console.log("✅ ONLINE SESSION TIMER AVVIATO");
        return true;
    }

    checkAndBindTimer();

    const observer = new MutationObserver(() => {
        const timer = document.getElementById("session-timer");
        if (timer && timer.dataset.timerStarted !== "true") {
            checkAndBindTimer();
        }
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

/* === SIDEBAR COCKPIT VARESE: OROLOGIO + BAROMETRO + TACHIMETRO + METEO === */
(() => {
  const VARESE_LAT = 45.8206;
  const VARESE_LON = 8.8251;
  const VARESE_CITY = "Varese (VA) — 382m";
  const CACHE_KEY = "anonlab_cockpit_varese_v1";
  const CACHE_TTL = 10 * 60 * 1000; // 10 minuti

  let telemetryBooted = false;

  const wmoLabels = {
    0: "Sereno", 1: "Prevalent. sereno", 2: "Parz. nuvoloso", 3: "Nuvoloso",
    45: "Nebbia", 48: "Nebbia ghiacciata", 51: "Pioviggine", 53: "Pioviggine mod.",
    55: "Pioviggine forte", 61: "Pioggia debole", 63: "Pioggia moderata",
    65: "Pioggia forte", 71: "Neve debole", 73: "Neve moderata", 75: "Neve forte",
    80: "Rovesci deboli", 81: "Rovesci moderati", 82: "Rovesci forti",
    95: "Temporale", 96: "Temporale / grandine", 99: "Temporale forte"
  };

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

    if (!telemetryBooted) {
      telemetryBooted = true;
      initVareseTelemetry();
    }
  }

  function renderMeteo(cur) {
    if (!cur) return;
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const temp     = Number(cur.temperature_2m);
    const feels    = Number(cur.apparent_temperature);
    const hum      = Number(cur.relative_humidity_2m);
    const clouds   = Number(cur.cloud_cover);
    const pressure = Number(cur.pressure_msl);
    const wind     = Number(cur.wind_speed_10m);
    const gusts    = Number(cur.wind_gusts_10m);
    const windDir  = Number(cur.wind_direction_10m);

    setTxt("anon-meteo-city", VARESE_CITY);
    setTxt("anon-meteo-temp", Number.isFinite(temp) ? `${temp.toFixed(1)}°C` : "--.-°C");
    setTxt("anon-meteo-desc", wmoLabels[cur.weather_code] || "Condizioni attive");
    setTxt("anon-meteo-feels", Number.isFinite(feels) ? `${Math.round(feels)}°C` : "--");
    setTxt("anon-meteo-hum", Number.isFinite(hum) ? `${Math.round(hum)}%` : "--%");
    setTxt("anon-meteo-clouds", Number.isFinite(clouds) ? `${Math.round(clouds)}%` : "--%");

    // Barometro (960 - 1050 hPa)
    if (Number.isFinite(pressure)) {
      setTxt("anon-baro-val", `${Math.round(pressure)} hPa`);
      setGaugeNeedle("anon-baro-needle", pressure, 960, 1050);

      let trend = "Stabile";
      let trendCol = "#00eaff";
      if (pressure >= 1020) {
        trend = "Alta Pressione";
        trendCol = "#00ff99";
      } else if (pressure <= 1005) {
        trend = "Bassa Pressione";
        trendCol = "#ff4a4a";
      }
      const trendEl = document.getElementById("anon-baro-trend");
      if (trendEl) {
        trendEl.textContent = trend;
        trendEl.style.color = trendCol;
      }
    }

    // Tachimetro Vento (0 - 100 km/h)
    if (Number.isFinite(wind)) {
      setTxt("anon-wind-val", `${Math.round(wind)} km/h`);
      setGaugeNeedle("anon-wind-needle", wind, 0, 100);
      setTxt("anon-wind-dir", `Dir: ${windCompass(windDir)} (${Math.round(windDir)}°)`);
    }

    setTxt("anon-wind-gusts", Number.isFinite(gusts) ? `${Math.round(gusts)} km/h` : "-- km/h");
  }

  async function fetchVareseMeteo(forceRefresh = false) {
    const refreshBtn = document.getElementById("anon-refresh-btn");
    try {
      if (!forceRefresh) {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (cached && (Date.now() - cached.ts) < CACHE_TTL) {
            renderMeteo(cached.current);
            return;
          }
        }
      }

      if (refreshBtn) refreshBtn.textContent = "⏳ Sync";

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${VARESE_LAT}&longitude=${VARESE_LON}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover` +
        `&timezone=Europe%2FRome`;

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      if (data && data.current) {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          ts: Date.now(),
          current: data.current
        }));
        renderMeteo(data.current);
      }
      if (refreshBtn) refreshBtn.textContent = "🔄 Live";
    } catch (e) {
      const descEl = document.getElementById("anon-meteo-desc");
      if (descEl) descEl.textContent = "Dati meteo non disponibili";
      if (refreshBtn) refreshBtn.textContent = "🔄 Riprova";
    }
  }

  function initVareseTelemetry() {
    fetchVareseMeteo(false);
    setInterval(() => fetchVareseMeteo(true), CACHE_TTL);

    const refreshBtn = document.getElementById("anon-refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => fetchVareseMeteo(true));
    }
  }

  updateClockAndNet();
  setInterval(updateClockAndNet, 1000);
})();

// ===============================
// INIZIALIZZAZIONE SICURA (NO BLOCCHI SULLA HOME)
// ===============================

function startAnonLabApp() {

    // NAVBAR MOBILE
    setTimeout(() => {
        if (typeof initMobileMenu === "function") initMobileMenu();
    }, 300);

    // RADIO
    if (typeof initRadio === "function") initRadio();

    // YOUTUBE PLAYER
    if (typeof initYouTubePlayer === "function") initYouTubePlayer();

    // TIMER SESSIONE (Avvio garantito)
    initSessionTimer();
}

// ⭐ RISOLUZIONE DEL PROBLEMA HOME
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAnonLabApp);
} else {
    startAnonLabApp();
}

