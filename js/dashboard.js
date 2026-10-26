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
   ANONLAB.IT — SOC Control Room Master Script (Definitive)
   Percorso: /js/dashboard.js
============================================================ */

(function() {
    'use strict';

    // --------------------------------------------------------
    // 1. CONSOLE LOGGER GLOBALE
    // --------------------------------------------------------
    window.SOCConsole = {
        log: function(message, type = "INFO") {
            const logBox = document.getElementById("soc-console-log");
            if (!logBox) return;

            const time = new Date().toLocaleTimeString();
            let color = "#00eaff";

            if (type === "WARN") color = "#f59e0b";
            else if (type === "ERROR") color = "#ff4a4a";
            else if (type === "SUCCESS") color = "#00ff99";
            else if (type === "ACTION") color = "#c084fc";

            const line = document.createElement("div");
            line.style.color = color;
            line.innerHTML = `<span style="color: #64748b;">[${time}]</span> <strong style="color: #e2e8f0;">[${type}]</strong> ${message}`;

            logBox.appendChild(line);
            logBox.scrollTop = logBox.scrollHeight;
        }
    };

    // --------------------------------------------------------
    // 2. THREAT MAP & ATTIVITÀ SOSPETTE (Filtro & Export CSV)
    // --------------------------------------------------------
    function initThreatAndSuspiciousModule() {
        const canvas = document.getElementById("realThreatCanvas");
        const suspiciousBox = document.getElementById("suspicious-list");
        const filterSelect = document.getElementById("severity-filter");
        const exportBtn = document.getElementById("export-csv-btn");
        if (!canvas || !suspiciousBox) return;

        const ctx = canvas.getContext("2d");
        let radarAngle = 0;
        let cachedEvents = [];

        function getFilteredEvents() {
            const selectedFilter = filterSelect ? filterSelect.value : "ALL";
            return cachedEvents.filter(item => {
                if (selectedFilter === "ALL") return true;
                return item.severity === selectedFilter;
            });
        }

        function renderList() {
            const filtered = getFilteredEvents();
            suspiciousBox.innerHTML = "";

            if (filtered.length === 0) {
                suspiciousBox.innerHTML = `<div style="color: #64748b; text-align: center; padding: 20px;">Nessun evento trovato per il filtro selezionato.</div>`;
                return;
            }

            filtered.forEach(item => {
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

        async function fetchData() {
            try {
                const res = await fetch("https://angelonline.altervista.org/soc/threat_stream.php", { cache: "no-store" });
                const data = await res.json();

                if (data.status === "success" && data.suspicious_list) {
                    cachedEvents = data.suspicious_list;
                    renderList();
                }
            } catch (e) {
                window.SOCConsole.log("Errore di sincronizzazione con threat_stream.php", "ERROR");
            }
        }

        // Eventi UI
        if (filterSelect) {
            filterSelect.addEventListener("change", renderList);
        }

        if (exportBtn) {
            exportBtn.addEventListener("click", () => {
                const filtered = getFilteredEvents();
                if (filtered.length === 0) {
                    alert("Nessun log da esportare.");
                    return;
                }

                let csvContent = "data:text/csv;charset=utf-8,Time,IP Address,Event,Severity\n";
                filtered.forEach(row => {
                    csvContent += `"${row.time}","${row.ip || 'N/A'}","${row.event}","${row.severity}"\n`;
                });

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `anonlab_soc_logs_${new Date().toISOString().slice(0,10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.SOCConsole.log("Esportazione log in formato CSV completata.", "ACTION");
            });
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

    // --------------------------------------------------------
    // 3. EMERGENCY LOCKDOWN & MODALE
    // --------------------------------------------------------
    function initLockdownSystem() {
        const btn = document.getElementById("lockdown-btn");
        const label = document.getElementById("lockdown-status-label");
        const modal = document.getElementById("lockdown-modal");
        const cancelBtn = document.getElementById("cancel-lockdown");
        const confirmBtn = document.getElementById("confirm-lockdown");

        if (!btn || !modal) return;

        let isLockdownActive = false;

        async function checkStatus() {
            try {
                const res = await fetch("https://angelonline.altervista.org/soc/lockdown_trigger.php?action=status", { cache: "no-store" });
                const data = await res.json();
                isLockdownActive = (data.lockdown === "ON");
                updateUI(isLockdownActive);
            } catch (e) {}
        }

        function updateUI(active) {
            if (active) {
                label.textContent = "LOCKDOWN ACTIVE (PERIMETER BLOCKED)";
                label.style.color = "#ff0044";
                btn.textContent = "DEACTIVATE LOCKDOWN";
                btn.style.background = "rgba(0, 255, 153, 0.15)";
                btn.style.color = "#00ff99";
                btn.style.borderColor = "#00ff99";
            } else {
                label.textContent = "STANDARD OPERATIONAL";
                label.style.color = "#00ff99";
                btn.textContent = "INITIATE LOCKDOWN";
                btn.style.background = "rgba(255, 0, 68, 0.15)";
                btn.style.color = "#ff0044";
                btn.style.borderColor = "#ff0044";
            }
        }

        btn.addEventListener("click", () => { modal.style.display = "flex"; });
        cancelBtn.addEventListener("click", () => { modal.style.display = "none"; });

        confirmBtn.addEventListener("click", async () => {
            modal.style.display = "none";
            try {
                const res = await fetch("https://angelonline.altervista.org/soc/lockdown_trigger.php?action=toggle", { cache: "no-store" });
                const data = await res.json();
                
                if (data.status === "success") {
                    isLockdownActive = (data.lockdown === "ON");
                    updateUI(isLockdownActive);

                    if (isLockdownActive) {
                        window.SOCConsole.log("ATTENZIONE: Protocollo di emergenza Lockdown ATTIVATO!", "ERROR");
                    } else {
                        window.SOCConsole.log("Perimetro ripristinato: Lockdown disattivato.", "SUCCESS");
                    }
                }
            } catch (e) {
                window.SOCConsole.log("Errore esecuzione comando Lockdown.", "ERROR");
            }
        });

        checkStatus();
    }

    // --------------------------------------------------------
    // 4. BANNER DI ALLERTA RAPIDA
    // --------------------------------------------------------
    function initSocAlertBanner() {
        const banner = document.getElementById("soc-alert-banner");
        const closeBtn = document.getElementById("close-banner-btn");
        if (!banner) return;

        let dismissed = false;

        async function checkBanner() {
            if (dismissed) return;
            try {
                const res = await fetch("https://angelonline.altervista.org/soc/security_score.php", { cache: "no-store" });
                const data = await res.json();

                if (data.status === "CRITICO" || data.score < 60) {
                    document.getElementById("banner-threat-title").textContent = `DEFCON WARNING (Score: ${data.score}%)`;
                    document.getElementById("banner-timestamp").textContent = new Date().toLocaleTimeString();
                    banner.style.display = "flex";
                } else {
                    banner.style.display = "none";
                }
            } catch (e) {}
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                banner.style.display = "none";
                dismissed = true;
                window.SOCConsole.log("Banner di allerta chiuso temporaneamente dall'operatore.", "WARN");
            });
        }

        checkBanner();
        setInterval(checkBanner, 20000);
    }

    // Avvio globale al caricamento della pagina
    document.addEventListener("DOMContentLoaded", function() {
        initThreatAndSuspiciousModule();
        initLockdownSystem();
        initSocAlertBanner();
        window.SOCConsole.log("Tutti i moduli SOC sono operativi e sincronizzati su anonlab.it.", "SUCCESS");
    });
})();
