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
   SYSTEM STATUS — Versione completa, robusta e con badge elegante (inline)
   Requisiti: assicurati che ping.txt e speedtest.bin siano serviti da
   https://anonlab.it e che speedtest.bin sia almeno 0.5–1 MB.
============================================================ */

const CONFIG = {
  speedUrl: "https://anonlab.it/speedtest.bin",
  pingUrl:  "https://anonlab.it/ping.txt",
  minSpeedFileMB: 0.5,        // ignora file troppo piccoli
  speedOkThreshold: 500,      // Mb/s per OK
  speedWarnThreshold: 100,    // Mb/s per WARNING
  latencyOkMs: 60,
  latencyWarnMs: 120,
  latencyHistoryMax: 50
};

/* === SPEEDTEST REALE === */
async function measureRealSpeed() {
  const start = performance.now();
  try {
    const response = await fetch(CONFIG.speedUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const blob = await response.blob();
    const sizeMB = blob.size / (1024 * 1024);

    const ms = performance.now() - start;
    const seconds = Math.max(0.001, ms / 1000);

    if (sizeMB < CONFIG.minSpeedFileMB) {
      console.warn("Speedtest: file troppo piccolo", sizeMB.toFixed(3), "MB");
      return null;
    }

    const mbps = (sizeMB / seconds) * 8;
    console.info("Speed measured:", mbps.toFixed(1), "Mb/s", "sizeMB=", sizeMB.toFixed(3), "timeMs=", ms.toFixed(1));
    return Number(mbps.toFixed(1));
  } catch (err) {
    console.error("measureRealSpeed error:", err);
    return null;
  }
}

/* === UTILITIES === */
function safeParseNumber(text) {
  if (!text) return null;
  const n = parseFloat(text);
  return Number.isFinite(n) ? n : null;
}

/* Inline badge styling (nessun CSS esterno) */
function styleBadgeInline(badgeEl) {
  if (!badgeEl) return;
  // base inline style (minimal pill)
  Object.assign(badgeEl.style, {
    display: "inline-block",
    minWidth: "56px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: "600",
    textAlign: "center",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    color: "#e6f7ef",
    border: "1px solid rgba(255,255,255,0.04)",
    transition: "background .25s ease, transform .12s ease, box-shadow .18s ease",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    verticalAlign: "middle",
    letterSpacing: ".4px",
    cursor: "default",
    boxShadow: "none"
  });
}

/* Apply state styles inline */
function applyBadgeState(badgeEl, state, speed, latency) {
  if (!badgeEl) return;
  // reset then base
  badgeEl.style.cssText = "";
  styleBadgeInline(badgeEl);

  const title = `Velocità ${speed ?? "N/D"} Mb/s • Latency ${latency ?? "N/D"} ms`;
  badgeEl.setAttribute("title", title);
  badgeEl.setAttribute("role", "status");
  badgeEl.setAttribute("aria-live", "polite");

  if (state === "OK") {
    badgeEl.textContent = "OK";
    Object.assign(badgeEl.style, {
      background: "linear-gradient(180deg, rgba(0,255,153,0.12), rgba(0,255,153,0.06))",
      color: "#002b12",
      borderColor: "rgba(0,255,153,0.18)",
      boxShadow: "0 6px 18px rgba(0,255,153,0.04)"
    });
  } else if (state === "WARN") {
    badgeEl.textContent = "WARN";
    Object.assign(badgeEl.style, {
      background: "linear-gradient(180deg, rgba(255,170,0,0.10), rgba(255,170,0,0.04))",
      color: "#2b1a00",
      borderColor: "rgba(255,170,0,0.14)",
      boxShadow: "0 6px 18px rgba(255,170,0,0.03)"
    });
  } else if (state === "CRIT") {
    badgeEl.textContent = "CRIT";
    Object.assign(badgeEl.style, {
      background: "linear-gradient(180deg, rgba(255,0,68,0.10), rgba(255,0,68,0.04))",
      color: "#2b0006",
      borderColor: "rgba(255,0,68,0.14)",
      boxShadow: "0 8px 24px rgba(255,0,68,0.05)"
    });
  } else {
    badgeEl.textContent = "—";
    Object.assign(badgeEl.style, {
      background: "rgba(255,255,255,0.04)",
      color: "#cfd8dc",
      borderColor: "rgba(255,255,255,0.03)",
      boxShadow: "none"
    });
  }

  // micro-interaction: subtle lift on hover
  badgeEl.onmouseenter = () => {
    badgeEl.style.transform = "translateY(-2px)";
    badgeEl.style.boxShadow = badgeEl.style.boxShadow || "0 10px 30px rgba(0,0,0,0.12)";
  };
  badgeEl.onmouseleave = () => {
    badgeEl.style.transform = "";
    // reapply state to restore boxShadow
    applyBadgeState(badgeEl, state, speed, latency);
  };
}

/* === MAIN === */
function startSystemStatusUltimate() {
  const netSpeedEl = document.getElementById("net-speed");
  const netFill = document.getElementById("net-fill");
  const latEl = document.getElementById("latency");
  const fwEl = document.getElementById("fw-status");
  const badge = document.getElementById("sys-badge");

  const latCanvas = document.getElementById("lat-chart");
  const latCtx = latCanvas ? latCanvas.getContext("2d") : null;
  let latencyData = [];

  function drawLatencyChart() {
    if (!latCtx || !latencyData.length) return;
    latCtx.clearRect(0, 0, latCanvas.width, latCanvas.height);
    latCtx.strokeStyle = "#00eaff";
    latCtx.lineWidth = 2;
    latCtx.beginPath();
    latencyData.forEach((v, i) => {
      const denom = Math.max(1, latencyData.length - 1);
      const x = (i / denom) * latCanvas.width;
      const y = latCanvas.height - Math.min(1, v / 200) * latCanvas.height;
      if (i === 0) latCtx.moveTo(x, y);
      else latCtx.lineTo(x, y);
    });
    latCtx.stroke();
  }

  /* === NETWORK SPEED === */
  async function updateNetwork() {
    const speed = await measureRealSpeed();
    if (speed === null) {
      netSpeedEl.textContent = "N/D";
      netFill.style.width = "0%";
      netFill.style.background = "#444";
    } else {
      netSpeedEl.textContent = speed + " Mb/s";
      const pct = Math.min(100, (speed / CONFIG.speedOkThreshold) * 100);
      netFill.style.width = pct + "%";
      netFill.style.background = speed >= CONFIG.speedOkThreshold ? "#00ff99" :
                                 speed >= CONFIG.speedWarnThreshold ? "#ffaa00" : "#ff0044";
    }
  }

  /* === LATENCY === */
  async function updateLatency() {
    const start = performance.now();
    try {
      const r = await fetch(CONFIG.pingUrl, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const ms = performance.now() - start;
      latEl.textContent = Math.round(ms) + " ms";
      latencyData.push(ms);
      if (latencyData.length > CONFIG.latencyHistoryMax) latencyData.shift();
      drawLatencyChart();
    } catch (err) {
      console.error("updateLatency error:", err);
      latEl.textContent = "N/D";
    }
  }

  /* === FIREWALL === */
  async function updateFirewall() {
    try {
      const r = await fetch(CONFIG.pingUrl, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      fwEl.textContent = "OK";
      fwEl.style.color = "#00ff99";
    } catch (err) {
      console.warn("Firewall check failed:", err);
      fwEl.textContent = "BLOCKED";
      fwEl.style.color = "#ff0044";
    }
  }

  /* === BADGE === */
  function updateBadge() {
    const speedText = (netSpeedEl.textContent || "").replace(" Mb/s", "").trim();
    const latencyText = (latEl.textContent || "").replace(" ms", "").trim();

    const speed = safeParseNumber(speedText);
    const latency = safeParseNumber(latencyText);

    // If measurements not yet available, show WARNING (not immediate CRITICAL)
    if (speed === null || latency === null) {
      applyBadgeState(badge, "WARN", speed, latency);
      return;
    }

    if (speed >= CONFIG.speedOkThreshold && latency <= CONFIG.latencyOkMs) {
      applyBadgeState(badge, "OK", speed, latency);
    } else if (speed >= CONFIG.speedWarnThreshold && latency <= CONFIG.latencyWarnMs) {
      applyBadgeState(badge, "WARN", speed, latency);
    } else {
      applyBadgeState(badge, "CRIT", speed, latency);
    }
  }

  /* === INITIAL RUN & INTERVALS === */
  // initial visual setup
  if (badge) styleBadgeInline(badge);
  if (netSpeedEl) netSpeedEl.textContent = "-- Mb/s";
  if (latEl) latEl.textContent = "-- ms";
  if (fwEl) fwEl.textContent = "--";

  // run once immediately
  updateNetwork();
  updateLatency();
  updateFirewall();
  updateBadge();

  // intervals
  setInterval(updateNetwork, 15000); // speedtest heavier
  setInterval(updateLatency, 3000);
  setInterval(updateFirewall, 5000);
  setInterval(updateBadge, 3000);
}

/* Start */
startSystemStatusUltimate();

/* Debug helper (esegui in console per test rapido):
   measureRealSpeed().then(console.log).catch(console.error)
*/

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
