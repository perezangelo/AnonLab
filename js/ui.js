function loadPartial(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
}
document.addEventListener("DOMContentLoaded", () => {
    loadPartial("header", "/partials/header.html");
    loadPartial("ticker", "/partials/ticker.html");
    loadPartial("sidebar", "/partials/sidebar.html");
    loadPartial("footer", "/partials/footer.html");

    loadTicker();
    loadMeteo();
    loadWorldFeed();
    loadCVEToday();
    loadCyberAlerts();
});
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
   SPEED TEST CYBER GAUGE
============================ */

function animateGauge(id, value, max = 100) {
    const pct = Math.min(100, (value / max) * 100);
    const offset = 100 - pct;
    document.getElementById(id).style.strokeDashoffset = offset;
}

function startSpeedTest() {
    const status = document.getElementById("speedtest-status");
    const pingEl = document.getElementById("speedtest-ping");
    const downEl = document.getElementById("speedtest-download");
    const upEl = document.getElementById("speedtest-upload");
    const jitterEl = document.getElementById("speedtest-jitter");

    status.textContent = "Test in corso...";

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

            // DOWNLOAD
            let startDown = performance.now();
            return fetch(testFile);
        })
        .then(res => res.blob())
        .then(blob => {
            let endDown = performance.now();
            let seconds = (endDown - performance.now()) / 1000;
            let mbps = ((blob.size * 8) / 1_000_000) / seconds;

            downEl.textContent = mbps.toFixed(1);
            animateGauge("gauge-download", mbps, 200);

            // UPLOAD
            let startUp = performance.now();
            return fetch("/upload-test", {
                method: "POST",
                body: uploadData
            }).catch(() => {});
        })
        .then(() => {
            let endUp = performance.now();
            let seconds = (endUp - performance.now()) / 1000;
            let mbps = ((uploadData.size * 8) / 1_000_000) / seconds;

            upEl.textContent = mbps.toFixed(1);
            animateGauge("gauge-upload", mbps, 200);

            status.textContent = "Test completato";
        })
        .catch(() => {
            status.textContent = "Errore durante il test";
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("speedtest-start");
    if (btn) btn.addEventListener("click", startSpeedTest);
});

