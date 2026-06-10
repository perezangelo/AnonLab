/* ============================================================
   THREAT LEVEL — Versione Reale con API Altervista
============================================================ */

async function loadThreatLevel() {
    const el = document.getElementById("threat-level");
    if (!el) return;

    try {
        const res = await fetch("https://angelonline.altervista.org/soc/threat_level.php");
        const data = await res.json();

        el.textContent = data.level;
        el.style.color = data.color;
        el.style.textShadow = `0 0 12px ${data.color}`;

    } catch (error) {
        console.error("Errore Threat Level:", error);
        el.textContent = "N/A";
        el.style.color = "#888";
        el.style.textShadow = "none";
    }
}

loadThreatLevel();
setInterval(loadThreatLevel, 15000);

/* ============================================================
   ATTACCHI RILEVATI (ultime 24h) — Versione Reale Altervista
============================================================ */

let attacksChartInstance = null;

async function loadAttacksChart() {
    const ctx = document.getElementById("attacksChart");
    if (!ctx) return;

    try {
        const res = await fetch("https://angelonline.altervista.org/soc/attacks_chart.php");
        const data = await res.json();

        // Evita sovrapposizioni distruggendo il grafico precedente
        if (attacksChartInstance) {
            attacksChartInstance.destroy();
        }

        attacksChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: data.labels,
                datasets: [{
                    label: "Attacchi",
                    data: data.values,
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

    } catch (error) {
        console.error("Errore Attacchi 24h:", error);
    }
}

// Primo caricamento
loadAttacksChart();

// Aggiornamento automatico ogni 30 secondi
setInterval(loadAttacksChart, 30000);


/* ============================================================
   EVENT LOG — Versione Reale Altervista
============================================================ */

async function loadEventLog() {
    const box = document.getElementById("event-log");
    if (!box) return;

    try {
        const res = await fetch("https://angelonline.altervista.org/soc/event_log.php");
        const data = await res.json();

        box.innerHTML = "";

        data.forEach(ev => {
            box.innerHTML += `
                <div>[${ev.time}] — ${ev.event}</div>
            `;
        });

    } catch (error) {
        console.error("Errore Event Log:", error);
        box.innerHTML = "<div>Impossibile caricare i log</div>";
    }
}

// Primo caricamento
loadEventLog();

// Aggiornamento automatico ogni 10 secondi
setInterval(loadEventLog, 10000);

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
