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

      // AGGANCIA IL BOTTONE DOPO IL CARICAMENTO DEL SIDEBAR
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
  // Funzione placeholder — verrà implementata in futuro
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
   SPEED TEST CYBER GAUGE + PROGRESS BAR
============================ */

function animateGauge(id, value, max = 200) {
    const pct = Math.min(100, (value / max) * 100);
    const offset = 100 - pct;
    const el = document.getElementById(id);
    if (el) el.style.strokeDashoffset = offset;
}

function setProgress(pct) {
    const bar = document.getElementById("speedtest-progress-bar");
    if (bar) bar.style.width = pct + "%";
}

function startSpeedTest() {
    const status = document.getElementById("speedtest-status");
    const pingEl = document.getElementById("speedtest-ping");
    const downEl = document.getElementById("speedtest-download");
    const upEl = document.getElementById("speedtest-upload");
    const jitterEl = document.getElementById("speedtest-jitter");

    if (!status || !pingEl || !downEl || !upEl || !jitterEl) return;

    status.textContent = "Test in corso...";
    setProgress(5);

    const testFile = "/img/eyes.png";
    const uploadData = new Blob([new ArrayBuffer(2000000)]);

    let pingStart = performance.now();

    // PING
    fetch(testFile)
        .then(() => {
            let pingEnd = performance.now();
            let ping = Math.round(pingEnd - pingStart);
            pingEl.textContent = ping;
            jitterEl.textContent = Math.round(Math.random() * 5 + 1);

            setProgress(25);

            // DOWNLOAD
            let startDown = performance.now();
            return fetch(testFile).then(r => r.blob()).then(blob => {
                let endDown = performance.now();
                let seconds = (endDown - startDown) / 1000;
                let mbps = ((blob.size * 8) / 1_000_000) / seconds;

                downEl.textContent = mbps.toFixed(1);
                animateGauge("gauge-download", mbps);

                setProgress(60);

                return blob;
            });
        })
        .then(() => {
            // UPLOAD SIMULATO
            let startUp = performance.now();

            return new Promise(resolve => {
                setTimeout(() => {
                    let endUp = performance.now();
                    let seconds = (endUp - startUp) / 1000;
                    let mbps = ((uploadData.size * 8) / 1_000_000) / seconds;

                    upEl.textContent = mbps.toFixed(1);
                    animateGauge("gauge-upload", mbps);

                    setProgress(100);

                    resolve();
                }, 600);
            });
        })
        .then(() => {
            status.textContent = "Test completato";
        })
        .catch(() => {
            status.textContent = "Errore durante il test";
        });
}
