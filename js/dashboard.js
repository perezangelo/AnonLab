/* ============================================================
   ANONLAB.IT — SOC Widgets REAL (CISA KEV + OpenPhish + Infra)
   Sostituisce la logica dei 3 widget in dashboard.js
   Oppure includi questo file DOPO dashboard.js e chiama initRealSocWidgets()
============================================================ */
(function () {
  'use strict';

  const THREAT_API = 'https://angelonline.altervista.org/soc/threat_intel.php';
  const INFRA_API  = 'https://angelonline.altervista.org/soc/infra_status.php';
  const POLL_MS    = 20000;

  function initRealSocWidgets() {
    const attacksCanvas = document.getElementById('attacksChart');
    const eventLogBox   = document.getElementById('event-log');
    const latCanvas     = document.getElementById('lat-chart');

    // Aggiorna titoli widget se presenti
    const titles = document.querySelectorAll('.soc-card h2');
    titles.forEach(function (h) {
      const t = (h.textContent || '').toLowerCase();
      if (t.indexOf('attacchi') !== -1 || t.indexOf('attacks') !== -1) {
        h.textContent = 'Threat Activity (KEV + Phishing)';
      } else if (t.indexOf('event log') !== -1) {
        h.textContent = 'Threat Event Log';
      } else if (t.indexOf('system status') !== -1) {
        h.textContent = 'Infrastructure Status';
      }
    });

    let attacksChart = null;

    // --- CHART ---
    if (attacksCanvas && typeof Chart !== 'undefined') {
      const ctx = attacksCanvas.getContext('2d');
      const gKev = ctx.createLinearGradient(0, 0, 0, 220);
      gKev.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      gKev.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      const gPhish = ctx.createLinearGradient(0, 0, 0, 220);
      gPhish.addColorStop(0, 'rgba(248, 113, 113, 0.30)');
      gPhish.addColorStop(1, 'rgba(248, 113, 113, 0.0)');

      attacksChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'CISA KEV (nuove/giorno)',
              data: [],
              borderColor: '#38bdf8',
              borderWidth: 2,
              backgroundColor: gKev,
              fill: true,
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: '#38bdf8',
              yAxisID: 'y',
            },
            {
              label: 'OpenPhish (URL attivi)',
              data: [],
              borderColor: '#f87171',
              borderWidth: 2,
              backgroundColor: gPhish,
              fill: true,
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: '#f87171',
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              display: true,
              labels: { color: '#94a3b8', font: { size: 10, family: 'JetBrains Mono' }, boxWidth: 12 },
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleColor: '#e2e8f0',
              bodyColor: '#e2e8f0',
              borderColor: '#1e293b',
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(30, 41, 59, 0.5)' },
              ticks: {
                color: '#64748b',
                font: { size: 9, family: 'JetBrains Mono' },
                maxTicksLimit: 8,
                callback: function (val, i) {
                  const l = this.getLabelForValue(val);
                  return l ? l.slice(5) : ''; // MM-DD
                },
              },
            },
            y: {
              position: 'left',
              grid: { color: 'rgba(30, 41, 59, 0.5)' },
              ticks: { color: '#38bdf8', font: { size: 10, family: 'JetBrains Mono' }, precision: 0 },
              beginAtZero: true,
              title: { display: true, text: 'KEV', color: '#38bdf8', font: { size: 9 } },
            },
            y1: {
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#f87171', font: { size: 10, family: 'JetBrains Mono' }, precision: 0 },
              beginAtZero: true,
              title: { display: true, text: 'Phish', color: '#f87171', font: { size: 9 } },
            },
          },
        },
      });
    }

    // --- FETCH THREAT INTEL ---
    async function fetchThreat() {
      try {
        const res = await fetch(THREAT_API + '?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data.status !== 'success') return;

        if (attacksChart && data.chart) {
          attacksChart.data.labels = data.chart.labels || [];
          attacksChart.data.datasets[0].data = data.chart.kev || [];
          attacksChart.data.datasets[1].data = data.chart.openphish || [];
          attacksChart.update('none');
        }

        if (eventLogBox && data.event_log && data.event_log.length) {
          eventLogBox.innerHTML = '';
          data.event_log.forEach(function (item) {
            const sev = (item.severity || 'INFO').toUpperCase();
            const isCrit = sev === 'CRITICAL';
            const isWarn = sev === 'WARNING';
            const badgeColor = isCrit ? '#f87171' : isWarn ? '#fbbf24' : '#38bdf8';
            const badgeBg = isCrit
              ? 'rgba(239,68,68,0.1)'
              : isWarn
              ? 'rgba(245,158,11,0.1)'
              : 'rgba(56,189,248,0.1)';
            const srcBadge =
              '<span style="color:#94a3b8;font-size:0.6rem;margin-left:4px;">' +
              (item.source || '') +
              '</span>';

            eventLogBox.innerHTML +=
              '<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px dashed #1e293b;padding-bottom:6px;gap:8px;">' +
              '<div style="min-width:0;flex:1;">' +
              '<span style="color:#64748b;">[' +
              (item.time || '') +
              ']</span>' +
              '<strong style="color:#38bdf8;margin-left:4px;">' +
              (item.id || '') +
              '</strong>' +
              srcBadge +
              '<div style="color:#e2e8f0;margin-top:2px;font-size:0.7rem;word-break:break-word;">' +
              (item.event || '') +
              (item.vendor ? ' · ' + item.vendor + (item.product ? ' / ' + item.product : '') : '') +
              '</div></div>' +
              '<span style="background:' +
              badgeBg +
              ';color:' +
              badgeColor +
              ';border:1px solid ' +
              badgeColor +
              ';padding:1px 5px;font-size:0.6rem;border-radius:3px;font-weight:bold;white-space:nowrap;">' +
              sev +
              '</span></div>';
          });
        }
      } catch (e) {
        console.error('SOC threat_intel error:', e);
      }
    }

    // --- INFRA STATUS ---
    let latencyHistory = [20, 22, 19, 25, 21, 24, 22, 20, 23, 22];

    function drawSparkline() {
      if (!latCanvas) return;
      const latCtx = latCanvas.getContext('2d');
      latCtx.clearRect(0, 0, latCanvas.width, latCanvas.height);
      latCtx.strokeStyle = '#fbbf24';
      latCtx.lineWidth = 1.5;
      latCtx.beginPath();
      const step = latCanvas.width / Math.max(latencyHistory.length - 1, 1);
      const min = Math.min.apply(null, latencyHistory.concat([10]));
      const max = Math.max.apply(null, latencyHistory.concat([50]));
      const range = Math.max(max - min, 1);
      latencyHistory.forEach(function (val, index) {
        const x = index * step;
        const y = latCanvas.height - ((val - min) / range) * (latCanvas.height - 4) - 2;
        if (index === 0) latCtx.moveTo(x, y);
        else latCtx.lineTo(x, y);
      });
      latCtx.stroke();
    }

    async function fetchInfra() {
      try {
        const res = await fetch(INFRA_API + '?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data.status !== 'success') return;

        const badge = document.getElementById('sys-badge');
        const netSpeed = document.getElementById('net-speed');
        const netFill = document.getElementById('net-fill');
        const latencyEl = document.getElementById('latency');
        const fwStatus = document.getElementById('fw-status');

        if (badge) {
          badge.textContent = data.overall || 'ONLINE';
          const ok = data.overall === 'ONLINE';
          badge.style.color = ok ? '#34d399' : data.overall === 'DEGRADED' ? '#fbbf24' : '#f87171';
          badge.style.background = ok
            ? 'rgba(52,211,153,0.1)'
            : 'rgba(248,113,113,0.1)';
          badge.style.borderColor = badge.style.color;
        }

        if (latencyEl) {
          latencyEl.textContent = (data.latency_ms || 0) + ' ms';
          latencyEl.style.color =
            data.latency_ms > 800 ? '#f87171' : data.latency_ms > 300 ? '#fbbf24' : '#fbbf24';
        }

        if (data.latency_ms) {
          latencyHistory.shift();
          latencyHistory.push(data.latency_ms);
          drawSparkline();
        }

        // Network speed → riusato come "checks UP"
        if (netSpeed && data.checks) {
          const ups = Object.values(data.checks).filter(function (v) {
            return v === 'UP';
          }).length;
          const total = Object.keys(data.checks).length;
          netSpeed.textContent = ups + '/' + total + ' feeds UP';
          if (netFill) {
            const pct = total ? Math.round((ups / total) * 100) : 0;
            netFill.style.width = pct + '%';
            netFill.style.background = pct === 100 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171';
          }
        }

        if (fwStatus) {
          const gh = data.github_status || 'unknown';
          fwStatus.textContent =
            (data.firewall || 'ACTIVE') +
            (gh && gh !== 'operational' ? ' · GH:' + gh : '');
          fwStatus.style.color = data.overall === 'ONLINE' ? '#34d399' : '#fbbf24';
        }
      } catch (e) {
        console.error('SOC infra_status error:', e);
      }
    }

    // Lockdown UI resta locale (opzionale)
    const lockdownBtn = document.getElementById('lockdown-btn');
    const lockdownModal = document.getElementById('lockdown-modal');
    const cancelLockdown = document.getElementById('cancel-lockdown');
    const confirmLockdown = document.getElementById('confirm-lockdown');
    const lockdownLabel = document.getElementById('lockdown-status-label');

    if (lockdownBtn && lockdownModal) {
      lockdownBtn.addEventListener('click', function () {
        lockdownModal.style.display = 'flex';
      });
      if (cancelLockdown) {
        cancelLockdown.addEventListener('click', function () {
          lockdownModal.style.display = 'none';
        });
      }
      if (confirmLockdown) {
        confirmLockdown.addEventListener('click', function () {
          lockdownModal.style.display = 'none';
          if (lockdownLabel) {
            const active = lockdownLabel.textContent.indexOf('LOCKDOWN ACTIVE') === -1;
            lockdownLabel.textContent = active
              ? 'LOCKDOWN ACTIVE (PERIMETER BLOCKED)'
              : 'STANDARD OPERATIONAL';
            lockdownLabel.style.color = active ? '#f87171' : '#34d399';
            lockdownBtn.textContent = active ? 'DEACTIVATE LOCKDOWN' : 'INITIATE LOCKDOWN';
          }
        });
      }
    }

    fetchThreat();
    fetchInfra();
    drawSparkline();
    setInterval(fetchThreat, POLL_MS);
    setInterval(fetchInfra, POLL_MS);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRealSocWidgets);
  } else {
    initRealSocWidgets();
  }

  // Espone per chiamata manuale
  window.initRealSocWidgets = initRealSocWidgets;
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
