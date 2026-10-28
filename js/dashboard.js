/* ============================================================
   ANONLAB.IT — SOC Control Room Master Script (Base44 Edition)
============================================================ */

(function() {
    'use strict';

    window.SOCConsole = {
        log: function(message, type = "INFO") {
            const logBox = document.getElementById("soc-console-log");
            if (!logBox) return;

            const time = new Date().toLocaleTimeString();
            let color = "#38bdf8";
            if (type === "WARN") color = "#fbbf24";
            else if (type === "ERROR") color = "#f87171";
            else if (type === "SUCCESS") color = "#34d399";
            else if (type === "ACTION") color = "#c084fc";

            const line = document.createElement("div");
            line.style.color = color;
            line.innerHTML = `<span style="color: #64748b;">[${time}]</span> <strong style="color: #e2e8f0;">[${type}]</strong> ${message}`;
            logBox.appendChild(line);
            logBox.scrollTop = logBox.scrollHeight;
        }
    };

    function initThreatAndSuspiciousModule() {
        const canvas = document.getElementById("realThreatCanvas");
        const suspiciousBox = document.getElementById("suspicious-list");
        const filterSelect = document.getElementById("severity-filter");
        const exportBtn = document.getElementById("export-csv-btn");
        if (!canvas || !suspiciousBox) return;

        const ctx = canvas.getContext("2d");
        let radarAngle = 0;
        let cachedEvents = [];
        let mappedNodes = [];

        function ipToRadarCoords(ip, width, height) {
            const parts = ip.split('.').map(num => parseInt(num, 10) || 0);
            const sum = parts.reduce((a, b) => a + b, 0);
            const angle = (sum * 13) % 360 * (Math.PI / 180);
            const radius = 30 + (parts[0] % 55);

            return {
                x: (width / 2) + radius * Math.cos(angle),
                y: (height / 2) + radius * Math.sin(angle)
            };
        }

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
                const badgeColor = isCrit ? "#f87171" : "#fbbf24";
                const badgeBg = isCrit ? "rgba(239, 68, 68, 0.1)" : "rgba(245, 158, 11, 0.1)";

                suspiciousBox.innerHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #1e293b; padding-bottom: 6px;">
                        <div>
                            <span style="color: #64748b;">[${item.time}]</span>
                            <strong style="color: #38bdf8; margin-left: 4px;">${item.ip || 'INTERNAL'}</strong>
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
                    mappedNodes = cachedEvents.map(event => {
                        const coords = ipToRadarCoords(event.ip || "127.0.0.1", canvas.width, canvas.height);
                        return { ...coords, severity: event.severity };
                    });
                    renderList();
                }
            } catch (e) {
                window.SOCConsole.log("Errore di sincronizzazione con threat_stream.php", "ERROR");
            }
        }

        if (filterSelect) filterSelect.addEventListener("change", renderList);

        if (exportBtn) {
            exportBtn.addEventListener("click", () => {
                const filtered = getFilteredEvents();
                if (filtered.length === 0) return;

                let csvContent = "data:text/csv;charset=utf-8,Time,IP,Event,Severity\n";
                filtered.forEach(row => {
                    csvContent += `"${row.time}","${row.ip || 'N/A'}","${row.event}","${row.severity}"\n`;
                });

                const link = document.createElement("a");
                link.setAttribute("href", encodeURI(csvContent));
                link.setAttribute("download", `anonlab_soc_logs_${new Date().toISOString().slice(0,10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.SOCConsole.log("Esportazione log CSV completata.", "ACTION");
            });
        }

        function drawRadarCanvas() {
            if (!canvas.isConnected) return;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;

            ctx.fillStyle = "#030712";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
            ctx.lineWidth = 1;
            for (let r = 25; r <= 85; r += 25) {
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.moveTo(0, cy); ctx.lineTo(canvas.width, cy);
            ctx.moveTo(cx, 0); ctx.lineTo(cx, canvas.height);
            ctx.stroke();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(radarAngle);
            const grad = ctx.createLinearGradient(0, 0, 80, 80);
            grad.addColorStop(0, "rgba(248, 113, 113, 0.4)");
            grad.addColorStop(1, "transparent");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 95, 0, Math.PI / 4);
            ctx.lineTo(0, 0);
            ctx.fill();
            ctx.restore();

            mappedNodes.forEach(node => {
                const isCrit = node.severity === "CRITICAL";
                const color = isCrit ? "#f87171" : "#fbbf24";

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, isCrit ? 4 : 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = isCrit ? "rgba(248, 113, 113, 0.2)" : "rgba(251, 191, 36, 0.1)";
                ctx.setLineDash([2, 4]);
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(node.x, node.y);
                ctx.stroke();
                ctx.setLineDash([]);
            });

            ctx.fillStyle = "#34d399";
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, Math.PI * 2);
            ctx.fill();

            radarAngle += 0.025;
            requestAnimationFrame(drawRadarCanvas);
        }

        drawRadarCanvas();
        fetchData();
        setInterval(fetchData, 15000);
    }

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
                label.style.color = "#f87171";
                btn.textContent = "DEACTIVATE LOCKDOWN";
                btn.style.background = "rgba(52, 211, 153, 0.15)";
                btn.style.color = "#34d399";
                btn.style.borderColor = "rgba(52, 211, 153, 0.4)";
            } else {
                label.textContent = "STANDARD OPERATIONAL";
                label.style.color = "#34d399";
                btn.textContent = "INITIATE LOCKDOWN";
                btn.style.background = "rgba(239, 68, 68, 0.15)";
                btn.style.color = "#f87171";
                btn.style.borderColor = "rgba(239, 68, 68, 0.4)";
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

    document.addEventListener("DOMContentLoaded", function() {
        initThreatAndSuspiciousModule();
        initLockdownSystem();
        window.SOCConsole.log("SOC Control Room inizializzata correttamente su anonlab.it", "SUCCESS");
    });
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
