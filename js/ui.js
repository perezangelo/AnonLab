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


