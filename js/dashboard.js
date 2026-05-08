/* ============================================================
   THREAT LEVEL — Simulazione dinamica
============================================================ */
function updateThreatLevel() {
    const el = document.getElementById("threat-level");
    if (!el) return;

    const levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const level = levels[Math.floor(Math.random() * levels.length)];

    el.textContent = level;

    el.style.color =
        level === "LOW" ? "#00ff99" :
        level === "MEDIUM" ? "#ffee55" :
        level === "HIGH" ? "#ff9933" :
        "#ff3355";
}
setInterval(updateThreatLevel, 5000);
updateThreatLevel();

/* ============================================================
   GRAFICO ATTACCHI — Chart.js
============================================================ */
function initAttacksChart() {
    const ctx = document.getElementById("attacksChart");
    if (!ctx) return;

    new Chart(ctx, {
        type: "line",
        data: {
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            datasets: [{
                label: "Attacchi",
                data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 50)),
                borderColor: "#00eaff",
                backgroundColor: "rgba(0, 234, 255, 0.15)",
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: "#ccc" } },
                y: { ticks: { color: "#ccc" } }
            }
        }
    });
}
initAttacksChart();

/* ============================================================
   EVENT LOG — Generazione dinamica
============================================================ */
function addEventLog() {
    const log = document.getElementById("event-log");
    if (!log) return;

    const events = [
        "Tentativo di accesso non autorizzato",
        "Connessione sospetta rilevata",
        "Traffico anomalo su porta 443",
        "Richiesta API non valida",
        "Login fallito da IP esterno"
    ];

    const item = document.createElement("div");
    item.className = "log-item";
    item.textContent = events[Math.floor(Math.random() * events.length)];

    log.prepend(item);

    if (log.children.length > 20) log.removeChild(log.lastChild);
}
setInterval(addEventLog, 4000);

/* ============================================================
   SYSTEM STATUS — Simulazione dinamica
============================================================ */
function updateSystemStatus() {
    const cpu = document.getElementById("cpu-load");
    const net = document.getElementById("net-activity");
    const fw = document.getElementById("fw-status");

    if (!cpu) return;

    cpu.textContent = Math.floor(Math.random() * 80 + 10) + "%";
    net.textContent = Math.floor(Math.random() * 900 + 100) + " kb/s";

    const fwStatus = ["OK", "WARN", "BLOCK"];
    fw.textContent = fwStatus[Math.floor(Math.random() * fwStatus.length)];
}
setInterval(updateSystemStatus, 3000);
updateSystemStatus();

/* ============================================================
   ATTIVITÀ SOSPETTE — Lista dinamica
============================================================ */
function updateSuspicious() {
    const list = document.getElementById("suspicious-list");
    if (!list) return;

    const items = [
        "Accesso da IP non riconosciuto",
        "Download anomalo rilevato",
        "Processo sconosciuto in esecuzione",
        "Connessione esterna persistente",
        "Tentativo di escalation privilegi"
    ];

    const li = document.createElement("li");
    li.textContent = items[Math.floor(Math.random() * items.length)];

    list.prepend(li);

    if (list.children.length > 10) list.removeChild(list.lastChild);
}
setInterval(updateSuspicious, 6000);
