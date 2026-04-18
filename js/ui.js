/* ============================
   CARICAMENTO PARTIALS
============================ */

function loadPartial(id, file) {
  const el = document.getElementById(id);
  if (!el) return;

  fetch(file)
    .then(res => res.text())
    .then(html => {
      el.innerHTML = html;

      if (id === "sidebar") {
        const btn = document.getElementById("speedtest-start");
        if (btn) btn.addEventListener("click", startSpeedTest);
      }
    });
}

/* ============================
   FUNZIONE METEO (placeholder)
============================ */

function loadMeteo() {}

/* ============================
   DOM READY
============================ */

document.addEventListener("DOMContentLoaded", () => {
    loadPartial("header", "/partials/header.html");
    loadPartial("sidebar", "/partials/sidebar.html");
    loadPartial("footer", "/partials/footer.html");

    loadMeteo();
    loadWorldFeed();
    loadCVEToday();
    loadCyberAlerts();
});

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
        img: "/img/hero3.jpg"
    };

    box.innerHTML = `
        <div class="box-img-row">
            <img src="${cve.img}" class="box-thumb">
            <div>
                <strong>${cve.id}</strong> — <span style="color:#d32f2f">${cve.severity}</span><br>
                ${cve.desc}<br>
                <a href="${cve.link}" target="_blank">Dettagli</a>
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
        { text: "Attacco DDoS in corso su infrastrutture EU", img: "/img/hero1.jpg" },
        { text: "Nuova campagna phishing su larga scala", img: "/img/hero2.jpg" },
        { text: "Exploit attivo su Apache ActiveMQ", img: "/img/hero3.jpg" },
        { text: "Malware bancario in rapida diffusione", img: "/img/hero1.jpg" }
    ];

    list.innerHTML = alerts
        .map(a => `
            <li class="alert-item">
                <img src="${a.img}" class="alert-thumb">
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
        { text: "Aumentano gli attacchi supply-chain", img: "/img/hero1.jpg" },
        { text: "Cresce l’adozione Zero Trust", img: "/img/hero2.jpg" },
        { text: "Nuove normative EU sulla cybersicurezza", img: "/img/hero3.jpg" },
        { text: "AI nei SOC di nuova generazione", img: "/img/hero1.jpg" }
    ];

    feed.innerHTML = items
        .map(i => `
            <div class="feed-item">
                <img src="${i.img}" class="feed-thumb">
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
    if (el) el.style.strokeDashoffset = offset;
}

function setProgress(pct) {
    const bar = document.getElementById("speedtest-progress-bar");
    if (bar) bar.style.width = pct + "%";
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
