/* ============================
   CARICAMENTO PARTIALS (ROBUSTO)
============================ */

async function loadPartial(id, file) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
        const res = await fetch(file, { cache: "no-store" });
        if (!res.ok) throw new Error(`Errore nel caricamento di ${file}`);

        const html = await res.text();
        el.innerHTML = html;

        // Attiva Speedtest solo dopo che la sidebar è caricata
        if (id === "sidebar") {
            const btn = document.getElementById("speedtest-start");
            if (btn && typeof startSpeedTest === "function") {
                btn.addEventListener("click", startSpeedTest);
            }
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
   DOM READY
============================ */

document.addEventListener("DOMContentLoaded", () => {

    // Attiva dark-mode globale
    document.body.classList.add("dark-mode");

    loadPartial("header", "partials/header.html");
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
            <img 
                src="${cve.img}" 
                class="box-thumb" 
                alt="${cve.id}"
                loading="lazy"
                decoding="async"
            >
            <div>
                <strong>${cve.id}</strong> — <span style="color:#d32f2f">${cve.severity}</span><br>
                ${cve.desc}<br>
                <a href="${cve.link}" target="_blank" rel="noopener">Dettagli</a>
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
   LIBRESPEED – SPEED TEST PRO
============================ */

let st = new Speedtest({
    telemetry_level: "basic",
    test_order: "P_D_U",
    auto_start: false,
    time_dl_max: 8,
    time_ul_max: 8,
    ping_allow_jitter: true,
    server_select: "auto",

    servers: [
        {
            name: "AnonLab Server",
            server: "https://anonlab.it/speedtest/",
            dlURL: "garbage.php",
            ulURL: "backend.php",
            pingURL: "empty.php",
            getIpURL: "getIP.php",
            distance: 1
        }
    ]
});

/* ============================
   GAUGE + PROGRESS BAR
============================ */

function animateGauge(id, value, max = 1000) {
    const pct = Math.min(100, (value / max) * 100);
    const offset = 100 - pct;
    const el = document.getElementById(id);
    if (el) {
        el.style.transition = "stroke-dashoffset 0.25s ease-out";
        el.style.strokeDashoffset = offset;
    }
}

function setProgress(pct) {
    const bar = document.getElementById("speedtest-progress-bar");
    if (bar) {
        bar.style.transition = "width 0.2s linear";
        bar.style.width = pct + "%";
    }
}

/* ============================
   QUALITY SCORE (A/B/C/D)
============================ */

function getQualityScore(ping, jitter, download, upload) {
    if (ping < 20 && jitter < 5 && download > 100 && upload > 50) return "A";
    if (ping < 40 && jitter < 10 && download > 50 && upload > 20) return "B";
    if (ping < 80 && jitter < 20 && download > 20 && upload > 10) return "C";
    return "D";
}

function getQualityLabel(score) {
    switch(score) {
        case "A": return "Ottima";
        case "B": return "Buona";
        case "C": return "Sufficiente";
        case "D": return "Scarsa";
    }
}

/* ============================
   AVVIO SPEED TEST
============================ */

function startSpeedTest() {
    const status = document.getElementById("speedtest-status");
    const pingEl = document.getElementById("speedtest-ping");
    const jitterEl = document.getElementById("speedtest-jitter");
    const downEl = document.getElementById("speedtest-download");
    const upEl = document.getElementById("speedtest-upload");

    status.textContent = "Test in corso...";
    setProgress(5);

    st.onupdate = data => {
        if (data.ping) {
            pingEl.textContent = data.ping.latency.toFixed(1);
            jitterEl.textContent = data.ping.jitter.toFixed(1);
        }

        if (data.download) {
            const mbps = data.download.bandwidth;
            downEl.textContent = mbps.toFixed(2) + " Mbps";
            animateGauge("gauge-download", mbps);
        }

        if (data.upload) {
            const mbps = data.upload.bandwidth;
            upEl.textContent = mbps.toFixed(2) + " Mbps";
            animateGauge("gauge-upload", mbps);
        }

        if (data.progress) {
            setProgress(Math.round(data.progress * 100));
        }
    };

    st.onend = () => {
        status.textContent = "Test completato";
        setProgress(100);

        const ping = parseFloat(pingEl.textContent);
        const jitter = parseFloat(jitterEl.textContent);
        const download = parseFloat(downEl.textContent);
        const upload = parseFloat(upEl.textContent);

        const score = getQualityScore(ping, jitter, download, upload);
        const label = getQualityLabel(score);

        const qualityBox = document.getElementById("speedtest-quality");
        qualityBox.textContent = `Qualità connessione: ${score} (${label})`;
    };

    st.start();
}

/* ============================
   HEADER GLASS SCROLL EFFECT
============================ */

window.addEventListener("scroll", () => {
    const header = document.querySelector(".site-header");
    if (!header) return;

    if (window.scrollY > 20) {
        header.classList.add("scrolled-header");
    } else {
        header.classList.remove("scrolled-header");
    }
});
