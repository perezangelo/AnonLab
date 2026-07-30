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
   SYSTEM STATUS — Versione Definitiva (senza backend)
============================================================ */

function startSystemStatusUltimate() {
    const netSpeedEl = document.getElementById("net-speed");
    const netFill = document.getElementById("net-fill");
    const latEl = document.getElementById("latency");
    const fwEl = document.getElementById("fw-status");
    const badge = document.getElementById("sys-badge");

    /* === MINI GRAFICO LATENCY === */
    const latCanvas = document.getElementById("lat-chart");
    const latCtx = latCanvas.getContext("2d");
    let latencyData = [];

    function drawLatencyChart() {
        latCtx.clearRect(0, 0, latCanvas.width, latCanvas.height);
        latCtx.strokeStyle = "#00eaff";
        latCtx.lineWidth = 2;
        latCtx.beginPath();

        latencyData.forEach((v, i) => {
            const x = (i / latencyData.length) * latCanvas.width;
            const y = latCanvas.height - (v / 200) * latCanvas.height;
            if (i === 0) latCtx.moveTo(x, y);
            else latCtx.lineTo(x, y);
        });

        latCtx.stroke();
    }

    /* === NETWORK SPEED === */
    function updateNetwork() {
        if (navigator.connection && navigator.connection.downlink) {
            const speed = navigator.connection.downlink;
            netSpeedEl.textContent = speed + " Mb/s";

            const pct = Math.min(100, speed * 10);
            netFill.style.width = pct + "%";

            netFill.style.background =
                speed >= 20 ? "#00ff99" :
                speed >= 10 ? "#ffaa00" :
                              "#ff0044";
        } else {
            netSpeedEl.textContent = "N/D";
        }
    }

    /* === LATENCY === */
    async function updateLatency() {
        const start = performance.now();
        try {
            await fetch("https://angelonline.altervista.org/ping.txt", { cache: "no-store" });
            const ms = performance.now() - start;
            latEl.textContent = ms.toFixed(0) + " ms";

            latencyData.push(ms);
            if (latencyData.length > 50) latencyData.shift();
            drawLatencyChart();
        } catch {
            latEl.textContent = "N/D";
        }
    }

    /* === FIREWALL === */
    async function updateFirewall() {
        try {
            await fetch("https://angelonline.altervista.org/ping.txt", { cache: "no-store" });
            fwEl.textContent = "OK";
            fwEl.style.color = "#00ff99";
        } catch {
            fwEl.textContent = "BLOCKED";
            fwEl.style.color = "#ff0044";
        }
    }

    /* === BADGE === */
    function updateBadge() {
        const speed = navigator.connection?.downlink || 0;
        const latency = parseFloat(latEl.textContent) || 999;

        let status = "CRITICAL";
        let color = "#ff0044";

        if (speed >= 20 && latency <= 60) {
            status = "OK";
            color = "#00ff99";
        } else if (speed >= 10 && latency <= 120) {
            status = "WARNING";
            color = "#ffaa00";
        }

        badge.textContent = status;
        badge.style.background = color;
    }

    /* === LOOP === */
    updateNetwork();
    updateLatency();
    updateFirewall();
    updateBadge();

    setInterval(updateNetwork, 3000);
    setInterval(updateLatency, 3000);
    setInterval(updateFirewall, 5000);
    setInterval(updateBadge, 3000);
}

startSystemStatusUltimate();

/* ============================================================
   ATTIVITÀ SOSPETTE — Versione Reale Altervista
============================================================ */

async function loadSuspiciousList() {
    const box = document.getElementById("suspicious-list");
    if (!box) return;

    try {
        const res = await fetch("https://angelonline.altervista.org/soc/suspicious_list.php");
        const data = await res.json();

        box.innerHTML = "";

        data.forEach(ev => {
            box.innerHTML += `<div class="alert-item">⚠️ ${ev}</div>`;
        });

    } catch (error) {
        console.error("Errore Suspicious List:", error);
        box.innerHTML = "<div>Impossibile caricare le attività</div>";
    }
}

// Primo caricamento
loadSuspiciousList();

// Aggiornamento automatico ogni 10 secondi
setInterval(loadSuspiciousList, 10000);
