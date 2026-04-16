/* ============================================================
   DASHBOARD SOC — ANONLAB
   Versione completa con:
   - Threat Level dinamico
   - Log eventi
   - System Status
   - Grafico attacchi
   - Animazione numeri (blink cyber)
   ============================================================ */


/* ================================
   THREAT LEVEL
   ================================ */
function updateThreatLevel() {
  const levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const el = document.getElementById("threat-level");

  el.textContent = level;

  el.style.color = {
    LOW: "#00ff9d",
    MEDIUM: "#ffe600",
    HIGH: "#ff6b00",
    CRITICAL: "#ff0033"
  }[level];

  el.classList.add("dash-number");
}

setInterval(updateThreatLevel, 5000);
updateThreatLevel();


/* ================================
   EVENT LOG
   ================================ */
const logContainer = document.getElementById("event-log");

function addLog() {
  const events = [
    "Firewall: Intrusion attempt blocked",
    "System scan completed",
    "Suspicious traffic detected",
    "New login from unknown device",
    "Malware signature updated",
    "Port scan detected",
    "Unauthorized access attempt",
    "Anomaly detected in network flow"
  ];

  const entry = document.createElement("div");
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${events[Math.floor(Math.random()*events.length)]}`;
  logContainer.prepend(entry);

  if (logContainer.children.length > 40) {
    logContainer.removeChild(logContainer.lastChild);
  }
}

setInterval(addLog, 3000);
addLog();


/* ================================
   SYSTEM STATUS
   ================================ */
function updateSystemStatus() {
  const cpu = document.getElementById("cpu-load");
  const net = document.getElementById("net-activity");
  const fw = document.getElementById("fw-status");

  cpu.textContent = (Math.random()*40+10).toFixed(1) + "%";
  net.textContent = (Math.random()*900+100).toFixed(0) + " kb/s";
  fw.textContent = Math.random() > 0.1 ? "OK" : "ALERT";

  cpu.classList.add("dash-number");
  net.classList.add("dash-number");
  fw.classList.add("dash-number");
}

setInterval(updateSystemStatus, 2000);
updateSystemStatus();


/* ================================
   GRAFICO ATTACCHI (Chart.js)
   ================================ */
const ctx = document.getElementById("attacksChart");

new Chart(ctx, {
  type: "line",
  data: {
    labels: ["00", "04", "08", "12", "16", "20"],
    datasets: [{
      label: "Attacchi",
      data: [5, 12, 7, 18, 9, 14],
      borderColor: "rgba(0,255,157,0.8)",
      backgroundColor: "rgba(0,255,157,0.2)",
      tension: 0.3
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: "#888" } },
      y: { ticks: { color: "#888" } }
    }
  }
});


/* ================================
   ANIMAZIONE NUMERI (BLINK CYBER)
   ================================ */
function animateNumbers() {
  const numbers = document.querySelectorAll(".dash-number");
  numbers.forEach(num => {
    num.style.transition = "opacity 0.2s ease";
    num.style.opacity = "0";
    setTimeout(() => {
      num.style.opacity = "1";
    }, 200);
  });
}

setInterval(animateNumbers, 5000);
animateNumbers();
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="/js/dashboard.js"></script>
<span id="cpu-load" class="dash-number">--%</span>
<span id="net-activity" class="dash-number">-- kb/s</span>
<span id="fw-status" class="dash-number">--</span>


