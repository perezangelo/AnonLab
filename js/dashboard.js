/* ============================================================
   ATTIVITÀ DI SICUREZZA — ultime 24h
   Endpoint AlterVista; valori attualmente simulati
============================================================ */

let attacksChartInstance = null;

async function loadAttacksChart() {
    const canvas = document.getElementById("attacksChart");
    const status = document.getElementById("attacksChartStatus");

    if (!canvas) return;

    try {
        const res = await fetch(
            "https://angelonline.altervista.org/soc/attacks_chart.php",
            { cache: "no-store" }
        );

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // Convalida la struttura della risposta
        if (
            !data ||
            !Array.isArray(data.labels) ||
            !Array.isArray(data.values) ||
            data.labels.length !== 24 ||
            data.values.length !== 24 ||
            !data.labels.every(label => typeof label === "string") ||
            !data.values.every(
                value => typeof value === "number" &&
                         Number.isFinite(value) &&
                         value >= 0
            )
        ) {
            throw new Error("Formato dati non valido: attese 24 ore");
        }

        // Crea il grafico una sola volta
        if (!attacksChartInstance) {
            attacksChartInstance = new Chart(canvas, {
                type: "line",
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: "Attività di sicurezza (simulata)",
                        data: data.values,
                        borderColor: "#00eaff",
                        backgroundColor: "rgba(0, 234, 255, 0.15)",
                        fill: true,
                        tension: 0.3,
                        pointRadius: 2,
                        pointHoverRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: { color: "#ccc" }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: "#ccc" }
                        }
                    }
                }
            });
        } else {
            // Aggiorna i dati senza creare un secondo grafico
            attacksChartInstance.data.labels = data.labels;
            attacksChartInstance.data.datasets[0].data = data.values;
            attacksChartInstance.update("none");
        }

        if (status) {
            status.textContent =
                "Dati simulati · aggiornamento ogni 30 secondi";
            status.style.color = "#ffaa00";
        }

    } catch (error) {
        console.error("Errore grafico attività SOC:", error);

        if (status) {
            status.textContent =
                "Dati temporaneamente non disponibili";
            status.style.color = "#ff6b6b";
        }
    }
}

// Primo caricamento e aggiornamento periodico
loadAttacksChart();
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
   SYSTEM STATUS ULTIMATE — Versione Definitiva
   (Speedtest reale, Latenza, Firewall, Mini-grafico, Badge)
============================================================ */

let sysStartTime = performance.now();

/* === SPEEDTEST REALE (versione affidabile) === */
async function measureRealSpeed() {
    const start = performance.now();

    try {
        const response = await fetch(
            "https://anonlab.it/ping.txt?cache=" + Math.random(),
            { cache: "no-store" }
        );

        const text = await response.text();
        const sizeKB = text.length; // dimensione reale del file

        const ms = performance.now() - start;
        const seconds = ms / 1000;

        const kbps = sizeKB / seconds;
        const mbps = kbps / 1024;

        return mbps.toFixed(1);
    } catch {
        return "N/D";
    }
}

/* === AVVIO PRINCIPALE === */
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

        const maxLat = Math.max(...latencyData, 200); // minimo 200 ms

        latencyData.forEach((v, i) => {
            const x = (i / latencyData.length) * latCanvas.width;
            const y = latCanvas.height - (v / maxLat) * latCanvas.height;
            if (i === 0) latCtx.moveTo(x, y);
            else latCtx.lineTo(x, y);
        });

        latCtx.stroke();
    }

    /* === NETWORK SPEED REALE === */
    async function updateNetwork() {
        try {
            const speed = await measureRealSpeed();
            netSpeedEl.textContent = speed + " Mb/s";

            const pct = Math.min(100, speed * 10); // scala realistica
            netFill.style.width = pct + "%";

            netFill.style.background =
                speed >= 5 ? "#00ff99" :      // ottimo
                speed >= 2 ? "#ffaa00" :      // accettabile
                             "#ff0044";       // lento
        } catch {
            netSpeedEl.textContent = "N/D";
        }
    }

    /* === LATENCY === */
    async function updateLatency() {
        const start = performance.now();
        try {
            await fetch("https://anonlab.it/ping.txt", { cache: "no-store" });
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
            await fetch("https://anonlab.it/ping.txt", { cache: "no-store" });
            fwEl.textContent = "OK";
            fwEl.style.color = "#00ff99";
        } catch {
            fwEl.textContent = "BLOCKED";
            fwEl.style.color = "#ff0044";
        }
    }

    /* === BADGE === */
    function updateBadge() {
        const speed = parseFloat(netSpeedEl.textContent) || 0;
        const latency = parseFloat(latEl.textContent) || 999;

        let status = "CRITICAL";
        let color = "#ff0044";

        if (latency <= 80 && speed >= 5) {
            status = "OK";
            color = "#00ff99";
        } else if (latency <= 150 && speed >= 2) {
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

    setInterval(updateNetwork, 8000);
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
        const res = await fetch("https://angelonline.altervista.org/soc/suspicious_list.php", {
            cache: "no-store"
        });
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

/* ============================================================
   SOC METRICS OVERVIEW — Dinamico e Autonomo
============================================================ */

function startSocMetrics() {
    const incBox = document.getElementById("soc-incidents");
    const critBox = document.getElementById("soc-critical");
    const alertBox = document.getElementById("soc-alerts");
    const zeroBox = document.getElementById("soc-zeroday");

    async function loadSocMetrics() {
        try {
            const res = await fetch("https://angelonline.altervista.org/soc/soc_metrics.php");
            const data = await res.json();

            incBox.textContent = data.incidenti;
            critBox.textContent = data.critiche;
            alertBox.textContent = data.allarmi;
            zeroBox.textContent = data.zeroday;

        } catch (error) {
            console.error("Errore SOC Metrics:", error);
        }
    }

    loadSocMetrics();
    setInterval(loadSocMetrics, 15000);
}

startSocMetrics();

/* ============================================================
   SECURITY SCORE — Dinamico
============================================================ */

function startSecurityScore() {
    const scoreBox = document.getElementById("security-score");
    const statusBox = document.getElementById("security-status");
    const circle = document.getElementById("security-circle");

    async function loadSecurityScore() {
        try {
            const res = await fetch("https://angelonline.altervista.org/soc/security_score.php");
            const data = await res.json();

            const score = data.score;
            const status = data.status;

            scoreBox.textContent = score;
            statusBox.textContent = "Stato: " + status;

            const color =
                status === "CRITICO" ? "#ff0044" :
                status === "BASSO"   ? "#ffaa00" :
                status === "MEDIO"   ? "#00eaff" :
                "#00ff99";

            const percent = score;

            circle.style.background = `conic-gradient(${color} 0% ${percent}%, #222 ${percent}% 100%)`;
            circle.style.boxShadow = `0 0 20px ${color}`;
            statusBox.style.color = color;

        } catch (error) {
            console.error("Errore Security Score:", error);
        }
    }

    loadSecurityScore();
    setInterval(loadSecurityScore, 15000);
}

startSecurityScore();
