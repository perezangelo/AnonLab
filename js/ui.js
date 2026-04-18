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

      // Aggancia il nuovo Speed Test dopo il caricamento del sidebar
      if (id === "sidebar") {
        const btn = document.getElementById("speedtest-start");
        if (btn) btn.addEventListener("click", startSpeedTest);
      }
    });
}

/* ============================
   FUNZIONE METEO (placeholder)
============================ */

function loadMeteo() {
  // In attesa di implementazione
}

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
        link: "https://nvd.nist.gov/vuln/detail/CVE-2026-12345"
    };

    box.innerHTML = `
        <strong>${cve.id}</strong> — <span style="color:#d32f2f">${cve.severity}</span><br>
        ${cve.desc}<br>
        <a href="${cve.link}" target="_blank">Dettagli</a>
    `;
}

/* ============================
   WIDGET CYBER ALERT LIVE
============================ */

async function loadCyberAlerts() {
    const list = document.getElementById("alert-live");
    if (!list) return;

    const alerts = [
        "⚠ Attacco DDoS in corso su infrastrutture EU",
        "⚠ Nuova campagna phishing su larga scala",
        "⚠ Exploit attivo su Apache ActiveMQ",
        "⚠ Malware bancario in rapida diffusione"
    ];
    list.innerHTML = alerts.map(a => `<li>${a}</li>`).join("");
}

/* ============================
   WIDGET FEED DAL MONDO
============================ */

async function loadWorldFeed() {
    const feed = document.getElementById("world-feed");
    if (!feed) return;

    const items = [
        "🌍 Aumentano gli attacchi supply-chain",
        "🌍 Cresce l’adozione Zero Trust",
        "🌍 Nuove normative EU sulla cybersicurezza",
        "🌍 AI nei SOC di nuova generazione"
    ];

    feed.innerHTML = items.map(i => `<div>${i}</div>`).join("");
}

/* ============================
   LIBRESPEED – SPEED TEST REALE
============================ */

let st = new Speedtest({
    telemetry_level: "basic",
    test_order: "P_D_U",
    servers: [
        {
            name: "LibreSpeed EU",
            server: "https://speedtest.wifx.net/",
            dlURL: "garbage.php",
            ulURL: "empty.php",
            pingURL: "empty.php",
            getIpURL: "getIP.php"
        }
    ]
});

// Gauge animation
function animateGauge(id, value, max = 1000) {
    const pct = Math.min(100, (value / max) * 100);
    const offset = 100 - pct;
    const el = document.getElementById(id);
    if (el) el.style.strokeDashoffset = offset;
}

// Progress bar
function setProgress(pct) {
    const bar = document.getElementById("speedtest-progress-bar");
    if (bar) bar.style.width = pct + "%";
}

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
    };

    st.start();
}
