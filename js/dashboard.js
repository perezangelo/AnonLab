/* ============================================================
   ANONLAB.IT — SOC Control Room Master Script (Definitive)
============================================================ */

(function() {
    'use strict';

    function initSOCDashboard() {
        const attacksCanvas = document.getElementById("attacksChart");
        const eventLogBox = document.getElementById("event-log");
        const latCanvas = document.getElementById("lat-chart");
        
        // Lockdown elements
        const lockdownBtn = document.getElementById("lockdown-btn");
        const lockdownLabel = document.getElementById("lockdown-status-label");
        const lockdownModal = document.getElementById("lockdown-modal");
        const cancelLockdown = document.getElementById("cancel-lockdown");
        const confirmLockdown = document.getElementById("confirm-lockdown");

        if (!attacksCanvas || !eventLogBox) return;

        // --- 1. SETUP CHART.JS (24H ATTACKS) ---
        const hoursLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
        const ctxAttacks = attacksCanvas.getContext("2d");
        
        const gradient = ctxAttacks.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");

        const attacksChart = new Chart(ctxAttacks, {
            type: 'line',
            data: {
                labels: hoursLabels,
                datasets: [{
                    label: 'Attacks Blocked',
                    data: Array(24).fill(0),
                    borderColor: '#38bdf8',
                    borderWidth: 2,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 2,
                    pointBackgroundColor: '#38bdf8'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        titleColor: '#38bdf8',
                        bodyColor: '#e2e8f0',
                        borderColor: '#1e293b',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(30, 41, 59, 0.5)' },
                        ticks: { color: '#64748b', font: { size: 10, family: 'JetBrains Mono' }, maxTicksLimit: 8 }
                    },
                    y: {
                        grid: { color: 'rgba(30, 41, 59, 0.5)' },
                        ticks: { color: '#64748b', font: { size: 10, family: 'JetBrains Mono' }, precision: 0 },
                        beginAtZero: true
                    }
                }
            }
        });

        // --- 2. FETCH TELEMETRY DATA FROM ALTERVISTA ---
        async function fetchTelemetry() {
            try {
                const res = await fetch("https://angelonline.altervista.org/soc/threat_stream.php", { cache: "no-store" });
                const data = await res.json();

                if (data.status === "success") {
                    // Aggiorna grafico 24h
                    if (data.attacks_24h) {
                        attacksChart.data.datasets[0].data = data.attacks_24h;
                        attacksChart.update();
                    }

                    // Aggiorna Event Log
                    if (data.suspicious_list && data.suspicious_list.length > 0) {
                        eventLogBox.innerHTML = "";
                        data.suspicious_list.forEach(item => {
                            const isCrit = item.severity === "CRITICAL";
                            const badgeColor = isCrit ? "#f87171" : "#fbbf24";
                            const badgeBg = isCrit ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)";

                            eventLogBox.innerHTML += `
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #1e293b; padding-bottom: 6px;">
                                    <div>
                                        <span style="color: #64748b;">[${item.time}]</span>
                                        <strong style="color: #38bdf8; margin-left: 4px;">${item.ip}</strong>
                                        <span style="color: #cbd5e1; font-size: 0.65rem; background: rgba(56,189,248,0.1); padding: 1px 4px; border-radius: 3px; margin-left: 6px;">${item.country} - ${item.city}</span>
                                        <span style="color: #e2e8f0; margin-left: 6px;">${item.event}</span>
                                    </div>
                                    <span style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; padding: 1px 5px; font-size: 0.6rem; border-radius: 3px; font-weight: bold;">
                                        ${item.severity}
                                    </span>
                                </div>
                            `;
                        });
                    }
                }
            } catch (e) {
                console.error("Errore di telemetria SOC:", e);
            }
        }

        // --- 3. LATENCY SPARKLINE ---
        if (latCanvas) {
            const latCtx = latCanvas.getContext("2d");
            let latencyHistory = [20, 22, 19, 25, 21, 24, 22, 20, 23, 22];

            function drawSparkline() {
                latCtx.clearRect(0, 0, latCanvas.width, latCanvas.height);
                latCtx.strokeStyle = "#fbbf24";
                latCtx.lineWidth = 1.5;
                latCtx.beginPath();
                const step = latCanvas.width / (latencyHistory.length - 1);
                latencyHistory.forEach((val, index) => {
                    const x = index * step;
                    const y = latCanvas.height - ((val - 10) / 25) * latCanvas.height;
                    if (index === 0) latCtx.moveTo(x, y);
                    else latCtx.lineTo(x, y);
                });
                latCtx.stroke();
            }
            setInterval(() => {
                latencyHistory.shift();
                latencyHistory.push(Math.floor(Math.random() * 8) + 18);
                drawSparkline();
            }, 3000);
            drawSparkline();
        }

        // --- 4. LOCKDOWN SYSTEM HANDLER ---
        if (lockdownBtn && lockdownModal) {
            lockdownBtn.addEventListener("click", () => { lockdownModal.style.display = "flex"; });
            cancelLockdown.addEventListener("click", () => { lockdownModal.style.display = "none"; });

            confirmLockdown.addEventListener("click", async () => {
                lockdownModal.style.display = "none";
                try {
                    const res = await fetch("https://angelonline.altervista.org/soc/lockdown_trigger.php?action=toggle", { cache: "no-store" });
                    const data = await res.json();
                    if (data.status === "success") {
                        const active = (data.lockdown === "ON");
                        lockdownLabel.textContent = active ? "LOCKDOWN ACTIVE (PERIMETER BLOCKED)" : "STANDARD OPERATIONAL";
                        lockdownLabel.style.color = active ? "#f87171" : "#34d399";
                        lockdownBtn.textContent = active ? "DEACTIVATE LOCKDOWN" : "INITIATE LOCKDOWN";
                    }
                } catch (e) {}
            });
        }

        fetchTelemetry();
        setInterval(fetchTelemetry, 15000);
    }

    document.addEventListener("DOMContentLoaded", initSOCDashboard);
})();

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
