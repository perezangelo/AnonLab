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
   SECURITY SCORE CON MODALE DI BREAKDOWN
============================================================ */

function startSecurityScore() {
    const scoreBox = document.getElementById("security-score");
    const statusBox = document.getElementById("security-status");
    const circle = document.getElementById("security-circle");
    const modal = document.getElementById("security-modal");
    const closeModalBtn = document.getElementById("close-modal");
    const modalOkBtn = document.getElementById("modal-ok-btn");
    const breakdownList = document.getElementById("breakdown-list");

    if (!scoreBox || !statusBox || !circle || !modal) return;

    let cachedBreakdown = [];

    async function loadSecurityScore() {
        try {
            const res = await fetch("https://angelonline.altervista.org/soc/security_score.php", {
                cache: "no-store"
            });
            const data = await res.json();

            const score = data.score;
            const status = data.status;
            cachedBreakdown = data.breakdown || [];

            scoreBox.textContent = score;
            statusBox.textContent = "Stato: " + status;

            const color =
                status === "CRITICO" ? "#ff0044" :
                status === "BASSO"   ? "#ffaa00" :
                status === "MEDIO"   ? "#00eaff" :
                "#00ff99";

            circle.style.background = `conic-gradient(${color} 0% ${score}%, #111827 ${score}% 100%)`;
            circle.style.boxShadow = `0 0 25px ${color}44`;
            statusBox.style.color = color;

        } catch (error) {
            console.error("Errore Security Score:", error);
            statusBox.textContent = "Stato: SYNC ERROR";
            statusBox.style.color = "#ff4a4a";
        }
    }

    // Apertura modale al click sul cerchio
    circle.addEventListener("click", () => {
        modal.style.display = "flex";
        
        // Popola la lista dei dettagli nella modale
        if (breakdownList) {
            breakdownList.innerHTML = "";
            if (cachedBreakdown.length === 0) {
                breakdownList.innerHTML = `<div style="color: #94a3b8; text-align: center;">Nessun dettaglio disponibile.</div>`;
                return;
            }

            cachedBreakdown.forEach(item => {
                const isPassed = item.status === "PASSED" || item.status === "SECURE" || item.status === "VALID";
                const badgeColor = isPassed ? "#00ff99" : "#ff4a4a";
                const badgeBg = isPassed ? "rgba(0,255,153,0.1)" : "rgba(255,74,74,0.1)";

                breakdownList.innerHTML += `
                    <div style="background: #030712; border: 1px solid #1e293b; padding: 10px; border-radius: 4px; display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #e2e8f0;">${item.name}</strong>
                            <span style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; padding: 1px 6px; font-size: 0.65rem; border-radius: 3px; font-weight: bold;">
                                ${item.status} (${item.impact})
                            </span>
                        </div>
                        <span style="color: #94a3b8; font-size: 0.72rem;">${item.desc}</span>
                    </div>
                `;
            });
        }
    });

    // Chiusura modale
    function closeModal() {
        modal.style.display = "none";
    }

    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (modalOkBtn) modalOkBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    loadSecurityScore();
    setInterval(loadSecurityScore, 20000);
}

// Avvio protetto
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startSecurityScore);
} else {
    startSecurityScore();
}
