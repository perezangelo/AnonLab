/* ============================================================
   ANONLAB.IT — Real Data Integration for Attacks Chart
============================================================ */

(function() {
    'use strict';

    function initRealAttacksChart() {
        const attacksCanvas = document.getElementById("attacksChart");
        if (!attacksCanvas) return;

        const hoursLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
        const ctxAttacks = attacksCanvas.getContext("2d");

        const gradient = ctxAttacks.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0.0)");

        // Inizializza il grafico con dati vuoti
        const attacksChart = new Chart(ctxAttacks, {
            type: 'line',
            data: {
                labels: hoursLabels,
                datasets: [{
                    label: 'Attacks Blocked (Live DB)',
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

        // Funzione di aggiornamento dati da Altervista
        async function fetchChartData() {
            try {
                const res = await fetch("https://angelonline.altervista.org/soc/threat_stream.php", { cache: "no-store" });
                const data = await res.json();

                if (data.status === "success" && data.attacks_24h) {
                    attacksChart.data.datasets[0].data = data.attacks_24h;
                    attacksChart.update();
                }
            } catch (e) {
                if (window.SOCConsole) {
                    window.SOCConsole.log("Impossibile sincronizzare i dati del grafico 24h", "ERROR");
                }
            }
        }

        fetchChartData();
        setInterval(fetchChartData, 30000); // Aggiorna ogni 30 secondi
    }

    document.addEventListener("DOMContentLoaded", initRealAttacksChart);
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
