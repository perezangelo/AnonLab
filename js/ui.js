/* ============================
   CARICAMENTO PARTIALS (ROBUSTO)
============================ */

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

        /* Sidebar: nessuna azione speciale */
        if (id === "sidebar") {
            // Speedtest interno rimosso
        }

        /* Header: attiva ticker continuo SUBITO dopo il caricamento */
        if (id === "header") {
            setTimeout(initTicker, 50);
        }

    } catch (err) {
        console.error(err);
        el.innerHTML = `<p class="error">Impossibile caricare ${file}</p>`;
    }
}

/* ============================
   FUNZIONE METEO (placeholder)
============================ */

function loadMeteo() {
    // In futuro potrai collegare un'API meteo reale
}

/* ============================
   FUNZIONE TICKER CONTINUO
============================ */

function initTicker() {
    const track = document.querySelector(".ticker-track");
    if (!track) return;

    // Evita duplicazioni multiple
    if (track.dataset.cloned === "true") return;

    // Duplica il contenuto per scorrimento continuo
    const clone = track.cloneNode(true);
    clone.dataset.cloned = "true";
    track.parentElement.appendChild(clone);

    // Calcola larghezza dinamica
    const totalWidth = track.scrollWidth;
    track.style.setProperty("--ticker-width", totalWidth + "px");
}

/* ============================
   DOM READY
============================ */

document.addEventListener("DOMContentLoaded", () => {
    loadPartial("header", "partials/header.html");
    loadPartial("ticker", "partials/ticker.html");   // AGGIUNTO
    loadPartial("sidebar", "partials/sidebar.html");
    loadPartial("footer", "partials/footer.html");

    loadMeteo();
    loadWorldFeed();
    loadCVEToday();
    loadCyberAlerts();
});

/* ============================
   SVG ICONS
============================ */

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

/* ============================
   WIDGET CVE DEL GIORNO
============================ */

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
                <a href="${cve.link}" target="_blank" rel="noopener noreferrer">Dettagli</a>
            </div>
        </div>
    `;
}

/* ============================
   WIDGET CYBER ALERT LIVE
============================ */

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

/* ============================
   WIDGET FEED DAL MONDO
============================ */

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

/* ============================
   HEADER GLASS SCROLL EFFECT
============================ */

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

/* ============================
   DROPDOWN NEWS — MENU A TENDINA
============================ */

document.addEventListener("click", function (e) {
    const dropdown = document.querySelector(".dropdown-news");
    if (!dropdown) return;

    // Se clicchi sul bottone → toggle
    if (dropdown.contains(e.target)) {
        dropdown.classList.toggle("open");
    } else {
        // Se clicchi fuori → chiudi
        dropdown.classList.remove("open");
    }
});
<!-- SCRIPT DEFINITIVO CALCOLATRICE -->
<script>
document.addEventListener("DOMContentLoaded", function () {
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('#calc-buttons .calc-btn');

    calcButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.textContent;

            if (value === 'C') {
                calcDisplay.textContent = '0';
                return;
            }

            if (value === '=') {
                try {
                    calcDisplay.textContent = eval(calcDisplay.textContent);
                } catch {
                    calcDisplay.textContent = 'Errore';
                }
                return;
            }

            if (calcDisplay.textContent === '0') {
                calcDisplay.textContent = value;
            } else {
                calcDisplay.textContent += value;
            }
        });
    });
});
</script>
