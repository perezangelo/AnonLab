/* ============================================================
   ATTACCHI RILEVATI (ultime 24h) — Versione Stabilizzata
============================================================ */

let attacksChartInstance = null;

async function loadAttacksChart() {
    const ctx = document.getElementById("attacksChart");
    if (!ctx) return;

    try {
        const res = await fetch("https://angelonline.altervista.org/soc/attacks_chart.php");
        const data = await res.json();

        // Se il grafico esiste già → aggiorna solo i dati
        if (attacksChartInstance) {
            attacksChartInstance.data.labels = data.labels;
            attacksChartInstance.data.datasets[0].data = data.values;
            attacksChartInstance.update();
            return;
        }

        // Creazione iniziale del grafico
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
                maintainAspectRatio: false,   // 🔥 evita espansione infinita
                plugins: { legend: { display: false } },
                scales: {
                    x: { ticks: { color: "#ccc" } },
                    y: { ticks: { color: "#ccc" } }
                }
            }
        });

        // 🔥 Fix AlterVista: forza il resize quando la card è renderizzata
        setTimeout(() => attacksChartInstance.resize(), 150);

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
   SOC SYSTEM INTEGRITY MATRIX — Versione Tecnica
============================================================ */

function startSystemIntegrityMatrix() {
    const matrixBox = document.getElementById("telemetry-matrix");
    const globalStatusEl = document.getElementById("soc-global-status");

    if (!matrixBox || !globalStatusEl) return;

    async function loadTelemetry() {
        try {
            // Sfruttiamo lo stesso endpoint PHP che restituisce il breakdown dei controlli
            const res = await fetch("https://angelonline.altervista.org/soc/security_score.php", {
                cache: "no-store"
            });
            const data = await res.json();

            const status = data.status; // Es. OTTIMO, MEDIO, CRITICO
            const breakdown = data.breakdown || [];

            // Aggiornamento Badge Globale
            let globalColor = "#00ff99";
            let globalBg = "rgba(0,255,153,0.1)";
            if (status === "CRITICO") { globalColor = "#ff4a4a"; globalBg = "rgba(255,74,74,0.1)"; }
            else if (status === "BASSO" || status === "MEDIO") { globalColor = "#f59e0b"; globalBg = "rgba(245,158,11,0.1)"; }

            globalStatusEl.textContent = `STATUS: ${status}`;
            globalStatusEl.style.color = globalColor;
            globalStatusEl.style.background = globalBg;
            globalStatusEl.style.borderColor = globalColor;

            // Popolamento Matrice Tecnica
            matrixBox.innerHTML = "";
            breakdown.forEach(item => {
                const isPassed = item.status === "PASSED" || item.status === "SECURE" || item.status === "VALID";
                const badgeColor = isPassed ? "#00ff99" : "#ff4a4a";
                const badgeBg = isPassed ? "rgba(0,255,153,0.1)" : "rgba(255,74,74,0.1)";

                matrixBox.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #1e293b; padding-bottom: 8px;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <span style="color: #e2e8f0; font-weight: bold;">${item.name}</span>
                            <span style="color: #64748b; font-size: 0.68rem;">${item.desc}</span>
                        </div>
                        <span style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; padding: 2px 6px; font-size: 0.65rem; border-radius: 3px; font-weight: bold; white-space: nowrap;">
                            [${item.status}]
                        </span>
                    </div>
                `;
            });

        } catch (error) {
            console.error("Errore System Integrity Matrix:", error);
            globalStatusEl.textContent = "OFFLINE";
            globalStatusEl.style.color = "#ff4a4a";
        }
    }

    loadTelemetry();
    setInterval(loadTelemetry, 15000); // Polling automatico ogni 15 secondi
}

// Avvio protetto
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSystemIntegrityMatrix);
} else {
    startSystemIntegrityMatrix();
}

//* ============================================================
   ANONLAB.IT — SOC Control Room Master Script
   Percorso: /js/dashboard.js
============================================================ */

(function() {
    // 1. THREAT MAP & ATTIVITÀ SOSPETTE
    function initThreatAndSuspiciousModule() {
        const canvas = document.getElementById("realThreatCanvas");
        const suspiciousBox = document.getElementById("suspicious-list");
        if (!canvas || !suspiciousBox) return;

        const ctx = canvas.getContext("2d");
        let radarAngle = 0;

        async function fetchData() {
            try {
                const res = await fetch("https://angelonline.altervista.org/soc/threat_stream.php", { cache: "no-store" });
                const data = await res.json();

                if (data.status === "success" && data.suspicious_list) {
                    suspiciousBox.innerHTML = "";
                    data.suspicious_list.forEach(item => {
                        const isCrit = item.severity === "CRITICAL";
                        const badgeColor = isCrit ? "#ff4a4a" : "#f59e0b";
                        const badgeBg = isCrit ? "rgba(255,74,74,0.1)" : "rgba(245,158,11,0.1)";

                        suspiciousBox.innerHTML += `
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #1e293b; padding-bottom: 6px;">
                                <div>
                                    <span style="color: #64748b;">[${item.time}]</span>
                                    <span style="color: #e2e8f0; margin-left: 4px;">${item.event}</span>
                                </div>
                                <span style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; padding: 1px 5px; font-size: 0.6rem; border-radius: 3px; font-weight: bold;">
                                    ${item.severity}
                                </span>
                            </div>
                        `;
                    });
                }
            } catch (e) {
                console.error("Errore fetch Threat Stream:", e);
            }
        }

        function drawRadarCanvas() {
            if (!canvas.isConnected) return;
            ctx.fillStyle = "#030712";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "rgba(0, 234, 255, 0.12)";
            ctx.lineWidth = 1;
            for (let r = 30; r < 120; r += 30) {
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, r, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(radarAngle);
            const grad = ctx.createLinearGradient(0, 0, 90, 90);
            grad.addColorStop(0, "rgba(255, 74, 74, 0.35)");
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 110, 0, Math.PI / 4);
            ctx.lineTo(0, 0);
            ctx.fill();
            ctx.restore();

            ctx.fillStyle = "#00ff99";
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 4, 0, Math.PI * 2);
            ctx.fill();

            radarAngle += 0.025;
            requestAnimationFrame(drawRadarCanvas);
        }

        drawRadarCanvas();
        fetchData();
        setInterval(fetchData, 15000);
    }

    // Avvio automatico al caricamento della pagina
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initThreatAndSuspiciousModule);
    } else {
        initThreatAndSuspiciousModule();
    }
})();
