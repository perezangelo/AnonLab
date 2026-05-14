/* ============================================================
   METEO ANONLAB 2.0 — VERSIONE DEFINITIVA
============================================================ */

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

/* ============================================================
   INIZIALIZZAZIONE METEO
============================================================ */

function initMeteo() {

    const select = document.getElementById("meteo-select");
    if (!select) return; // ← evita crash se sidebar non pronta

    // Popola il menu città
    Object.keys(LOCATIONS).forEach(city => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        select.appendChild(opt);
    });

    // Città salvata
    const saved = localStorage.getItem("meteo-city") || "Varese";
    select.value = saved;

    // Carica meteo iniziale
    loadMeteo(saved);

    // Cambio città
    select.addEventListener("change", () => {
        localStorage.setItem("meteo-city", select.value);
        loadMeteo(select.value);
    });
}

/* ============================================================
   CARICAMENTO DATI METEO
============================================================ */

async function loadMeteo(city) {

    const select = document.getElementById("meteo-select");
    if (!select) return; // sicurezza

    const { lat, lon } = LOCATIONS[city];
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        updateCurrent(data.current_weather);
        updateWeek(data.daily);

    } catch (e) {
        console.error("Errore meteo:", e);
    }
}

/* ============================================================
   METEO ATTUALE
============================================================ */

function updateCurrent(current) {

    const tempEl = document.getElementById("meteo-temp");
    const descEl = document.getElementById("meteo-desc");
    const iconEl = document.getElementById("meteo-icon");

    if (!tempEl || !descEl || !iconEl) return;

    tempEl.textContent = `${current.temperature}°C`;
    descEl.textContent = weatherDescription(current.weathercode);

    const icon = METEO_ICONS[current.weathercode] || "default.svg";
    iconEl.src = `img/img/meteo/${icon}`;
}

/* ============================================================
   METEO SETTIMANALE
============================================================ */

function updateWeek(daily) {

    const container = document.getElementById("meteo-week");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 5; i++) {
        const code = daily.weathercode[i];
        const icon = METEO_ICONS[code] || "default.svg";

        const day = document.createElement("div");
        day.className = "meteo-day";

        day.innerHTML = `
            <img src="img/img/meteo/${icon}">
            <span>${daily.temperature_2m_max[i]}°</span>
        `;

        container.appendChild(day);
    }
}

/* ============================================================
   DESCRIZIONI METEO
============================================================ */

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
