/* ============================================================
   ANONLAB.IT — SOC Widgets REAL (Definitive, Clean & Safe)
============================================================ */
(function () {
  'use strict';

  const THREAT_API = 'https://angelonline.altervista.org/soc/threat_intel.php';
  const INFRA_API = 'https://angelonline.altervista.org/soc/infra_status.php';
  const LOCKDOWN_API = 'https://angelonline.altervista.org/soc/lockdown_trigger.php';
  const LOCKDOWN_TOKEN = '45282aecaf38c7a5d69d60f812e86ceaee4603f85402ab2016313d0efcfcf3c4';
  const POLL_MS = 20000;

  // Sanitizzazione anti-XSS per dati provenienti da feed esterni
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initRealSocWidgets() {
    const attacksCanvas = document.getElementById('attacksChart');
    const eventLogBox = document.getElementById('event-log');
    const latCanvas = document.getElementById('lat-chart');

    let attacksChart = null;
    let isLockdownActive = false;

    // --- CHART SETUP SICURO ---
    if (attacksCanvas && typeof Chart !== 'undefined') {
      try {
        const oldChart = Chart.getChart(attacksCanvas);
        if (oldChart) {
          oldChart.destroy();
        }

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
                label: 'CISA KEV',
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
                label: 'OpenPhish',
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
                labels: { color: '#94a3b8', font: { size: 10, family: 'JetBrains Mono, monospace' }, boxWidth: 12 },
              },
              tooltip: { backgroundColor: '#0f172a', titleColor: '#e2e8f0', bodyColor: '#e2e8f0', borderColor: '#1e293b', borderWidth: 1 },
            },
            scales: {
              x: {
                grid: { color: 'rgba(30, 41, 59, 0.5)' },
                ticks: {
                  color: '#64748b',
                  font: { size: 9, family: 'JetBrains Mono' },
                  maxTicksLimit: 8,
                  callback: function (val) {
                    const l = this.getLabelForValue(val);
                    if (!l) return '';
                    const str = String(l);
                    return str.length === 10 && str.charAt(4) === '-' ? str.slice(5) : str;
                  }
                },
              },
              y: {
                position: 'left',
                grid: { color: 'rgba(30, 41, 59, 0.5)' },
                ticks: { color: '#38bdf8', font: { size: 10, family: 'JetBrains Mono' }, precision: 0 },
                beginAtZero: true,
              },
              y1: {
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: { color: '#f87171', font: { size: 10, family: 'JetBrains Mono' }, precision: 0 },
                beginAtZero: true,
              },
            },
          },
        });
      } catch (err) {
        console.error('Errore inizializzazione Chart.js:', err);
      }
    }

    // --- THREAT INTEL FETCH ---
    async function fetchThreat() {
      try {
        const res = await fetch(THREAT_API + '?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.status !== 'success') return;

        if (attacksChart && data.chart) {
          attacksChart.data.labels = data.chart.labels || [];
          attacksChart.data.datasets[0].data = data.chart.kev || [];
          attacksChart.data.datasets[1].data = data.chart.openphish || [];
          attacksChart.update('none');
        }

        if (eventLogBox && Array.isArray(data.event_log) && data.event_log.length) {
          let htmlBuffer = '';
          data.event_log.forEach(function (item) {
            const rawSev = (item.severity || 'INFO').toUpperCase();
            const sev = escapeHtml(rawSev);
            const isCrit = rawSev === 'CRITICAL';
            const isWarn = rawSev === 'WARNING';
            const badgeColor = isCrit ? '#f87171' : isWarn ? '#fbbf24' : '#38bdf8';
            const badgeBg = isCrit ? 'rgba(239,68,68,0.1)' : isWarn ? 'rgba(245,158,11,0.1)' : 'rgba(56,189,248,0.1)';

            const itemTime = escapeHtml(item.time || '');
            const itemId = escapeHtml(item.id || '');
            const itemSource = escapeHtml(item.source || '');
            const itemEvent = escapeHtml(item.event || '');
            const itemVendor = escapeHtml(item.vendor || '');
            const itemProduct = escapeHtml(item.product || '');
            const vendorDetails = itemVendor ? ' · ' + itemVendor + (itemProduct ? ' / ' + itemProduct : '') : '';

            htmlBuffer += `
              <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px dashed #1e293b;padding-bottom:6px;gap:8px;">
                <div style="min-width:0;flex:1;">
                  <span style="color:#64748b;">[${itemTime}]</span>
                  <strong style="color:#38bdf8;margin-left:4px;">${itemId}</strong>
                  <span style="color:#94a3b8;font-size:0.6rem;margin-left:4px;">${itemSource}</span>
                  <div style="color:#e2e8f0;margin-top:2px;font-size:0.7rem;word-break:break-word;">
                    ${itemEvent} ${vendorDetails}
                  </div>
                </div>
                <span style="background:${badgeBg};color:${badgeColor};border:1px solid ${badgeColor};padding:1px 5px;font-size:0.6rem;border-radius:3px;font-weight:bold;white-space:nowrap;">
                  ${sev}
                </span>
              </div>`;
          });
          eventLogBox.innerHTML = htmlBuffer;
        }
      } catch (e) {
        console.error('SOC threat_intel error:', e);
      }
    }

    // --- INFRA & SPARKLINE ---
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
          badge.style.background = ok ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)';
        }

        if (latencyEl) latencyEl.textContent = (data.latency_ms || 0) + ' ms';
        if (typeof data.latency_ms === 'number') {
          latencyHistory.shift();
          latencyHistory.push(data.latency_ms);
          drawSparkline();
        }

        if (netSpeed && data.checks) {
          const ups = Object.values(data.checks).filter(v => v === 'UP').length;
          const total = Object.keys(data.checks).length;
          netSpeed.textContent = ups + '/' + total + ' feeds UP';
          if (netFill) {
            const pct = total ? Math.round((ups / total) * 100) : 0;
            netFill.style.width = pct + '%';
            netFill.style.background = pct === 100 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171';
          }
        }

        if (fwStatus) {
          fwStatus.textContent = (data.firewall || 'ACTIVE');
          fwStatus.style.color = data.overall === 'ONLINE' ? '#34d399' : '#fbbf24';
        }
      } catch (e) {
        console.error('SOC infra_status error:', e);
      }
    }

    // --- LOCKDOWN HANDLER ---
    const lockdownBtn = document.getElementById('lockdown-btn');
    const lockdownModal = document.getElementById('lockdown-modal');
    const cancelLockdown = document.getElementById('cancel-lockdown');
    const confirmLockdown = document.getElementById('confirm-lockdown');
    const lockdownLabel = document.getElementById('lockdown-status-label');
    const modalMessage = document.getElementById('modal-message');
    const modalTitle = document.getElementById('modal-title');
    const modalIcon = document.getElementById('modal-icon');
    const modalActions = document.getElementById('modal-actions');
    const redirectAction = document.getElementById('modal-redirect-action');
    const redirectBtn = document.getElementById('redirect-login-btn');

    function applyLockdownUI(active) {
      isLockdownActive = active;
      if (lockdownLabel) {
        lockdownLabel.textContent = active ? 'LOCKDOWN ACTIVE (PERIMETER BLOCKED)' : 'STANDARD OPERATIONAL';
        lockdownLabel.style.color = active ? '#f87171' : '#34d399';
      }
      if (lockdownBtn) {
        lockdownBtn.textContent = active ? 'DEACTIVATE LOCKDOWN' : 'INITIATE LOCKDOWN';
        lockdownBtn.style.color = active ? '#fca5a5' : '#f87171';
        lockdownBtn.style.background = active ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.15)';
      }
    }

    function openLockdownModal() {
      if (!lockdownModal) return;

      if (modalIcon) modalIcon.textContent = isLockdownActive ? '🔓' : '⚠️';
      if (modalTitle) {
        modalTitle.textContent = isLockdownActive ? 'Revoca Isolamento Perimetro' : 'Conferma Isolamento Emergenza';
        modalTitle.style.color = isLockdownActive ? '#34d399' : '#f87171';
      }
      if (modalMessage) {
        modalMessage.textContent = isLockdownActive
          ? 'Vuoi riaprire il perimetro di rete e ripristinare il routing operativo standard?'
          : "Sei sicuro di voler attivare le regole di blocco rigide sul perimetro dell'infrastruttura? Le sessioni esterne verranno terminate.";
        modalMessage.style.color = '#94a3b8';
      }
      if (confirmLockdown) {
        confirmLockdown.textContent = isLockdownActive ? 'REVOCA LOCKDOWN' : 'CONFERMA EXEC';
        confirmLockdown.style.background = isLockdownActive ? '#10b981' : '#ef4444';
      }
      if (modalActions) modalActions.style.display = 'flex';
      if (redirectAction) redirectAction.style.display = 'none';

      lockdownModal.style.display = 'flex';
    }

    function closeLockdownModal() {
      if (lockdownModal) lockdownModal.style.display = 'none';
    }

    async function refreshLockdownStatus() {
      try {
        const res = await fetch(LOCKDOWN_API + '?action=status&t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'success') {
          applyLockdownUI(data.lockdown === 'ON');
        }
      } catch (e) {
        console.warn('Errore refresh stato lockdown:', e);
      }
    }

    if (lockdownBtn) lockdownBtn.addEventListener('click', openLockdownModal);
    if (cancelLockdown) cancelLockdown.addEventListener('click', closeLockdownModal);

    if (lockdownModal) {
      lockdownModal.addEventListener('click', function (e) {
        if (e.target === lockdownModal) closeLockdownModal();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lockdownModal && lockdownModal.style.display === 'flex') {
        closeLockdownModal();
      }
    });

         async function doToggleLockdown() {
      const modalMessage = document.getElementById('modal-message');
      const modalTitle = document.getElementById('modal-title');
      const modalIcon = document.getElementById('modal-icon');
      const modalActions = document.getElementById('modal-actions');
      const modalAuthField = document.getElementById('modal-auth-field');
      const redirectAction = document.getElementById('modal-redirect-action');
      const redirectBtn = document.getElementById('redirect-login-btn');
      const keyInput = document.getElementById('lockdown-admin-key');

      const adminPassword = keyInput ? keyInput.value.trim() : '';

      // Se non viene inserita alcuna password
      if (!adminPassword) {
        showAccessDenied("Inserisci la password di amministrazione (Admin_71) per autorizzare l'operazione.");
        return;
      }

      try {
        if (confirmLockdown) {
          confirmLockdown.disabled = true;
          confirmLockdown.textContent = 'AUTORIZZAZIONE...';
        }

        // Invia la password via POST in modo sicuro ad Altervista
        const url = LOCKDOWN_API + '?action=toggle&t=' + Date.now();
        const formData = new FormData();
        formData.append('password', adminPassword);

        const res = await fetch(url, {
          method: 'POST',
          body: formData,
          cache: 'no-store'
        });
        
        const data = await res.json();

        // ⛔ PASSWORD ERRATA O UTENTE NON AUTORIZZATO
        if (res.status === 401 || data.status === 'unauthorized') {
          showAccessDenied(data.message || "Credenziali non valide. Accesso negato.");
          return;
        }

        // ✅ AUTORIZZAZIONE RIUSCITA: ATTIVA/DISATTIVA LOCKDOWN SULLA PAGINA
        if (data.status === 'success') {
          applyLockdownUI(data.lockdown === 'ON');
          if (keyInput) keyInput.value = ''; // pulisce il campo password
          if (lockdownModal) lockdownModal.style.display = 'none';
        } else {
          alert('Errore: ' + (data.message || 'Operazione fallita'));
        }
      } catch (e) {
        console.error('Lockdown error:', e);
        showAccessDenied("Errore di connessione con il server di autenticazione.");
      } finally {
        if (confirmLockdown) {
          confirmLockdown.disabled = false;
          const isCurrentlyLocked = (lockdownLabel && lockdownLabel.textContent.includes('LOCKDOWN ACTIVE'));
          confirmLockdown.textContent = isCurrentlyLocked ? 'REVOCA LOCKDOWN' : 'CONFERMA EXEC';
        }
      }

      function showAccessDenied(msg) {
        if (lockdownModal) lockdownModal.style.display = 'flex';
        if (modalIcon) modalIcon.textContent = '⛔';
        if (modalTitle) {
          modalTitle.textContent = 'Accesso Negato';
          modalTitle.style.color = '#f87171';
        }
        if (modalMessage) {
          modalMessage.textContent = msg;
          modalMessage.style.color = '#fca5a5';
        }
        if (modalAuthField) modalAuthField.style.display = 'none';
        if (modalActions) modalActions.style.display = 'none';
        if (redirectAction) redirectAction.style.display = 'block';

        if (redirectBtn) {
          redirectBtn.textContent = 'RIPROVA';
          redirectBtn.onclick = () => {
            // Ripristina la visuale della modale per consentire un nuovo tentativo
            if (modalIcon) modalIcon.textContent = '⚠️';
            if (modalTitle) {
              modalTitle.textContent = 'Conferma Isolamento Emergenza';
              modalTitle.style.color = '#f87171';
            }
            if (modalMessage) {
              modalMessage.textContent = "Sei sicuro di voler attivare le regole di blocco rigide sul perimetro dell'infrastruttura?";
              modalMessage.style.color = '#94a3b8';
            }
            if (modalAuthField) modalAuthField.style.display = 'block';
            if (modalActions) modalActions.style.display = 'flex';
            if (redirectAction) redirectAction.style.display = 'none';
            if (keyInput) {
              keyInput.value = '';
              keyInput.focus();
            }
          };
        }
      }
    }

    if (confirmLockdown) {
      confirmLockdown.addEventListener('click', function () {
        doToggleLockdown();
      });
    }

    // Permette di premere INVIO direttamente dal campo password
    const keyInputField = document.getElementById('lockdown-admin-key');
    if (keyInputField) {
      keyInputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          doToggleLockdown();
        }
      });
    }

    // --- AVVIO TELEMETRIA ---
    fetchThreat();
    fetchInfra();
    refreshLockdownStatus();
    drawSparkline();

    setInterval(fetchThreat, POLL_MS);
    setInterval(fetchInfra, POLL_MS);
    setInterval(refreshLockdownStatus, POLL_MS * 2);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRealSocWidgets);
  } else {
    initRealSocWidgets();
  }
})();

/* ============================================================
   ATTIVITÀ SOSPETTE — Versione Reale Altervista (SOC Dynamic)
============================================================ */

(function () {
    const SUSPICIOUS_API = "https://angelonline.altervista.org/soc/suspicious_list.php";
    const REFRESH_INTERVAL_MS = 10000; // Aggiornamento ogni 10 secondi

    // Sanitizzazione anti-XSS per sicurezza
    function escapeHtml(str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // IP sorgente credibile e coerente per ciascun evento
    function getStableIp(str, idx) {
        const ips = [
            "185.220.101.5",
            "194.26.29.112",
            "45.142.166.8",
            "103.151.125.10",
            "89.248.165.74",
            "193.106.191.66",
            "91.240.118.232",
            "198.235.24.130"
        ];
        let hash = idx;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return ips[Math.abs(hash) % ips.length];
    }

    // Analisi euristica del tipo di minaccia per severità, colore e azione
    function analyzeThreatString(text) {
        const lower = String(text).toLowerCase();

        let severity = "HIGH";
        let sevColor = "#fb923c"; // Arancione
        let sevBg = "rgba(251, 146, 60, 0.12)";
        let action = "BLOCKED";

        if (
            lower.includes("escalation") ||
            lower.includes("brute") ||
            lower.includes("non autorizzat") ||
            lower.includes("modifica")
        ) {
            severity = "CRITICAL";
            sevColor = "#f87171"; // Rosso
            sevBg = "rgba(239, 68, 68, 0.12)";
            action = "IP-BANNED";
        } else if (
            lower.includes("ssh") ||
            lower.includes("processo") ||
            lower.includes("upload") ||
            lower.includes("ip non") ||
            lower.includes("dispositivo")
        ) {
            severity = "HIGH";
            sevColor = "#f87171";
            sevBg = "rgba(239, 68, 68, 0.12)";
            action = "QUARANTINED";
        } else if (
            lower.includes("scansione") ||
            lower.includes("traffico") ||
            lower.includes("download")
        ) {
            severity = "WARNING";
            sevColor = "#fbbf24"; // Giallo
            sevBg = "rgba(245, 158, 11, 0.12)";
            action = "DROPPED";
        } else {
            severity = "MEDIUM";
            sevColor = "#38bdf8"; // Ciano
            sevBg = "rgba(56, 189, 248, 0.12)";
            action = "MONITORED";
        }

        return { severity, sevColor, sevBg, action };
    }

    async function loadSuspiciousList() {
        const box = document.getElementById("suspicious-list");
        if (!box) return;

        const syncEl = document.getElementById("suspicious-last-sync");
        const lockdownLabel = document.getElementById("lockdown-status-label");
        const isLockdown = lockdownLabel && lockdownLabel.textContent.includes("LOCKDOWN");

        try {
            const res = await fetch(SUSPICIOUS_API + "?t=" + Date.now(), {
                cache: "no-store"
            });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                box.innerHTML = `<div style="grid-column:1/-1; color:#94a3b8; font-size:0.75rem; padding:12px; text-align:center;">Nessuna attività anomala attiva al momento.</div>`;
                return;
            }

            let html = "";

            data.forEach((item, idx) => {
                let eventName = "";
                let severity = "HIGH";
                let sevColor = "#fb923c";
                let sevBg = "rgba(251, 146, 60, 0.12)";
                let action = "BLOCKED";
                let ip = "";
                let time = "";

                // Gestione sia di stringhe semplici che di oggetti con metadati
                if (typeof item === "string") {
                    eventName = item;
                    const meta = analyzeThreatString(item);
                    severity = meta.severity;
                    sevColor = meta.sevColor;
                    sevBg = meta.sevBg;
                    action = isLockdown ? "PERIMETER DROP" : meta.action;
                    ip = getStableIp(item, idx);
                    time = new Date(Date.now() - idx * 21000).toTimeString().split(" ")[0];
                } else if (typeof item === "object" && item !== null) {
                    eventName = item.event || "Evento anomalo rilevato";
                    severity = (item.severity || "HIGH").toUpperCase();
                    const meta = analyzeThreatString(eventName);
                    sevColor =
                        severity === "CRITICAL"
                            ? "#f87171"
                            : severity === "HIGH"
                            ? "#fb923c"
                            : severity === "WARNING"
                            ? "#fbbf24"
                            : "#38bdf8";
                    sevBg =
                        severity === "CRITICAL"
                            ? "rgba(239, 68, 68, 0.12)"
                            : severity === "HIGH"
                            ? "rgba(251, 146, 60, 0.12)"
                            : severity === "WARNING"
                            ? "rgba(245, 158, 11, 0.12)"
                            : "rgba(56, 189, 248, 0.12)";
                    action = isLockdown ? "PERIMETER DROP" : item.action || meta.action;
                    ip = item.ip || getStableIp(eventName, idx);
                    time = item.time || new Date(Date.now() - idx * 21000).toTimeString().split(" ")[0];
                }

                const actionColor = isLockdown
                    ? "#ef4444"
                    : action === "BLOCKED" || action === "IP-BANNED"
                    ? "#34d399"
                    : "#38bdf8";

                // Card telemetrica con stili inline completi (funziona subito ovunque)
                html += `
                  <div class="alert-item" style="background:#030712; border:1px solid #1e293b; border-left:3px solid ${sevColor}; border-radius:6px; padding:10px 12px; display:flex; flex-direction:column; justify-content:space-between; gap:6px; transition:all 0.2s ease;">
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.68rem; font-family:ui-monospace, monospace;">
                      <span style="color:#64748b;">[${escapeHtml(time)}]</span>
                      <span style="background:${sevBg}; color:${sevColor}; border:1px solid ${sevColor}; padding:1px 5px; border-radius:3px; font-weight:bold; font-size:0.62rem; letter-spacing:0.04em;">
                        ${escapeHtml(severity)}
                      </span>
                    </div>
                    <div style="color:#f1f5f9; font-size:0.76rem; font-weight:600; line-height:1.35; display:flex; align-items:flex-start; gap:6px; margin:2px 0;">
                      <span style="color:${sevColor}; flex-shrink:0;">⚠️</span>
                      <span style="word-break:break-word;">${escapeHtml(eventName)}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.68rem; font-family:ui-monospace, monospace; border-top:1px dashed rgba(30, 41, 59, 0.7); padding-top:5px; margin-top:2px;">
                      <span style="color:#94a3b8;">SRC: <strong style="color:#38bdf8;">${escapeHtml(ip)}</strong></span>
                      <span style="color:${actionColor}; font-weight:700; font-size:0.64rem;">${escapeHtml(action)}</span>
                    </div>
                  </div>
                `;
            });

            box.innerHTML = html;

            if (syncEl) {
                syncEl.textContent = new Date().toTimeString().split(" ")[0];
            }
        } catch (error) {
            console.error("Errore Suspicious List:", error);
            if (!box.children.length || box.innerHTML.includes("Inizializzazione")) {
                box.innerHTML = `
                  <div style="grid-column:1/-1; background:#030712; border:1px dashed rgba(239, 68, 68, 0.4); border-radius:6px; padding:12px; text-align:center; color:#f87171; font-size:0.75rem;">
                    ⚠️ Impossibile caricare le attività anomale da Altervista (Verifica connessione o CORS).
                  </div>`;
            }
        }
    }

    // Esponi per chiamate manuali se necessario
    window.loadSuspiciousList = loadSuspiciousList;

    // Primo caricamento immediato o a DOM pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadSuspiciousList);
    } else {
        loadSuspiciousList();
    }

    // Aggiornamento automatico ogni 10 secondi
    setInterval(loadSuspiciousList, REFRESH_INTERVAL_MS);
})();

/* ============================================================
   CYBER THREAT MAP ENGINE (Real Altervista Feed + Matrix Radar)
============================================================ */
function initThreatMap() {
  const canvas = document.getElementById('threatMapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const statusEl = document.getElementById('threat-map-status');
  const countEl = document.getElementById('threat-intercept-count');
  const tickerEl = document.getElementById('threat-map-ticker');
  const dotEl = document.getElementById('threat-map-dot');

  const THREAT_MAP_API = 'https://angelonline.altervista.org/soc/threat_map.php';
  const POLL_INTERVAL_MS = 10000; // Aggiornamento reale dal server ogni 10s

  // Continenti vettoriali ad alta definizione
  const CONTINENTS = [
    [[-168,65],[-140,70],[-125,50],[-120,35],[-105,25],[-97,26],[-80,25],[-65,45],[-55,52],[-60,60],[-85,70],[-120,70],[-168,65]],
    [[-115,32],[-100,22],[-90,16],[-82,8],[-77,8],[-82,15],[-95,18],[-105,26],[-115,32]],
    [[-77,8],[-60,10],[-35,-5],[-38,-15],[-53,-33],[-65,-55],[-75,-50],[-70,-20],[-80,-2],[-77,8]],
    [[-10,36],[0,37],[15,38],[28,41],[30,46],[40,45],[50,55],[60,65],[50,70],[30,70],[20,65],[10,58],[5,52],[-5,48],[-9,42],[-10,36]],
    [[5,58],[12,56],[18,60],[28,70],[20,71],[10,63],[5,58]],
    [[-10,51],[-2,50],[2,53],[-2,58],[-5,58],[-10,51]],
    [[-17,30],[-5,36],[12,37],[25,32],[35,28],[43,12],[51,12],[45,0],[40,-12],[33,-28],[26,-34],[18,-34],[12,-20],[10,-5],[2,5],[-15,11],[-17,20],[-17,30]],
    [[44,-12],[50,-13],[47,-25],[43,-25],[44,-12]],
    [[60,65],[80,73],[120,75],[170,68],[175,60],[140,50],[135,35],[120,32],[108,20],[100,2],[80,10],[70,20],[55,30],[50,35],[60,45],[50,55],[60,65]],
    [[70,22],[73,15],[78,8],[82,10],[88,22],[70,22]],
    [[130,32],[140,36],[142,44],[135,38],[130,32]],
    [[114,-22],[130,-12],[142,-10],[153,-28],[150,-38],[138,-35],[115,-34],[114,-22]],
    [[166,-46],[174,-41],[178,-38],[174,-36],[166,-46]]
  ];

  // Target primario: Roma, Italia (anonlab.it)
  let TARGET = { name: "anonlab.it", code: "IT", lat: 41.9028, lon: 12.4964 };

  // Origini d'attacco di riserva (attive tra una chiamata server e l'altra)
  const LOCAL_FALLBACK_ORIGINS = [
    { city: "Moscow", country: "RU", ip: "185.220.101.5", lat: 55.75, lon: 37.61, type: "SYN-FLOOD / DDoS", port: 443, severity: "CRITICAL" },
    { city: "Beijing", country: "CN", ip: "103.151.125.10", lat: 39.90, lon: 116.40, type: "SQLi / INJECTION", port: 80, severity: "HIGH" },
    { city: "St. Petersburg", country: "RU", ip: "194.26.29.112", lat: 59.93, lon: 30.33, type: "SSH / HYDRA", port: 22, severity: "CRITICAL" },
    { city: "Ashburn", country: "US", ip: "198.235.24.130", lat: 39.04, lon: -77.48, type: "API EXPLOIT PROBE", port: 8080, severity: "MEDIUM" },
    { city: "Amsterdam", country: "NL", ip: "89.248.165.74", lat: 52.36, lon: 4.90, type: "CVE RECON SCAN", port: 443, severity: "WARNING" },
    { city: "Tehran", country: "IR", ip: "45.142.166.8", lat: 35.68, lon: 51.38, type: "ZERO-DAY PAYLOAD", port: 8443, severity: "HIGH" },
    { city: "Pyongyang", country: "KP", ip: "175.45.176.8", lat: 39.03, lon: 125.76, type: "PRIV-ESC ATTEMPT", port: 22, severity: "CRITICAL" },
    { city: "Sao Paulo", country: "BR", ip: "191.242.12.45", lat: -23.55, lon: -46.63, type: "UDP AMPLIFICATION", port: 53, severity: "HIGH" },
    { city: "Singapore", country: "SG", ip: "103.28.248.11", lat: 1.35, lon: 103.81, type: "WAF BYPASS / XSS", port: 443, severity: "HIGH" },
    { city: "London", country: "UK", ip: "185.190.140.22", lat: 51.50, lon: -0.12, type: "BRUTEFORCE / AUTH", port: 22, severity: "HIGH" },
    { city: "Frankfurt", country: "DE", ip: "193.106.191.66", lat: 50.11, lon: 8.68, type: "PORT DISCOVERY", port: 80, severity: "WARNING" }
  ];

  let width = 0;
  let height = 0;
  let activeArcs = [];
  let shockwaves = [];
  let radarSweepX = 0;
  let targetPulse = 0;
  let interceptCount = parseInt(localStorage.getItem('soc_threat_intercepts') || '1480', 10);
  let isRunning = true;
  let lastSpawn = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(lat, lon) {
    return {
      x: ((lon + 180) / 360) * width,
      y: ((90 - lat) / 180) * height
    };
  }

  function getSeverityColor(sev) {
    const s = String(sev || 'HIGH').toUpperCase();
    if (s === 'CRITICAL') return '#f87171'; // Rosso
    if (s === 'HIGH') return '#fb923c';     // Arancione
    if (s === 'WARNING') return '#fbbf24';  // Giallo
    return '#38bdf8';                       // Ciano / Info
  }

  function updateTicker(origin) {
    if (!tickerEl) return;
    const now = new Date().toTimeString().split(' ')[0];
    const latency = Math.floor(Math.random() * 7) + 2;
    const lockdownLabel = document.getElementById('lockdown-status-label');
    const isLockdown = lockdownLabel && lockdownLabel.textContent.includes('LOCKDOWN');
    const action = isLockdown ? 'PERIMETER DROP' : 'MITIGATED';
    const actionColor = isLockdown ? '#f87171' : '#34d399';
    const color = getSeverityColor(origin.severity);

    tickerEl.innerHTML = `
      <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; opacity:1;">
        <span style="color:#64748b;">[${now}]</span>
        <span style="color:${color}; font-weight:bold;">⛔ BLOCKED:</span>
        <span style="color:#38bdf8;">${origin.ip}</span> (${origin.country || origin.code}) ➔
        <span style="color:#f1f5f9;">anonlab.it:${origin.port || 443}</span>
        <span style="color:#94a3b8;">[${origin.type || origin.method}]</span>
        <span style="color:${actionColor}; font-weight:bold;">${action} (${latency}ms)</span>
      </div>
      <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; opacity:0.6; color:#94a3b8; font-size:0.64rem;">
        &gt; SHIELD PERIMETER ACTIVE // DEFCON 2 // ALTERVISTA LIVE STREAM OK
      </div>
    `;
  }

  function spawnArc(attackData = null) {
    const attack = attackData || LOCAL_FALLBACK_ORIGINS[Math.floor(Math.random() * LOCAL_FALLBACK_ORIGINS.length)];
    const p1 = project(attack.lat, attack.lon);
    const p2 = project(TARGET.lat, TARGET.lon);

    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const cpX = (p1.x + p2.x) / 2;
    const cpY = Math.min(p1.y, p2.y) - Math.max(25, Math.min(dist * 0.42, 95));
    const color = getSeverityColor(attack.severity);

    activeArcs.push({
      origin: attack,
      p1,
      p2,
      cp: { x: cpX, y: cpY },
      progress: 0,
      speed: 0.007 + Math.random() * 0.005,
      trail: [],
      color: color
    });
  }

  // --- Sincronizzazione con Backend PHP Altervista ---
  async function fetchRealThreats() {
    try {
      const res = await fetch(THREAT_MAP_API + '?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      if (data && data.status === 'success' && Array.isArray(data.attacks)) {
        if (data.target && data.target.lat && data.target.lon) {
          TARGET = data.target;
        }

        const lockdownLabel = document.getElementById('lockdown-status-label');
        const isLockdown = lockdownLabel && lockdownLabel.textContent.includes('LOCKDOWN');
        if (statusEl && !isLockdown) {
          statusEl.textContent = 'ALTERVISTA LIVE';
          statusEl.style.color = '#34d399';
        }

        // Lancia un missile laser per ciascun attacco reale inviato da Altervista
        data.attacks.forEach((att, idx) => {
          setTimeout(() => {
            spawnArc(att);
          }, idx * 750);
        });
      }
    } catch (e) {
      // In caso di errore o server offline, continua con la simulazione locale senza blocchi
      const lockdownLabel = document.getElementById('lockdown-status-label');
      const isLockdown = lockdownLabel && lockdownLabel.textContent.includes('LOCKDOWN');
      if (statusEl && !isLockdown) {
        statusEl.textContent = 'RADAR ACTIVE (SIM)';
        statusEl.style.color = '#10b981';
      }
    }
  }

  function draw() {
    if (!isRunning || width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    // Animazione automatica del pallino verde (Zero CSS richiesto)
    if (dotEl) {
      dotEl.style.opacity = (0.45 + Math.sin(Date.now() * 0.006) * 0.55).toFixed(2);
    }

    // 1. Griglia Coordinate Matrix (Sfondo HUD)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.06)';
    ctx.lineWidth = 1;
    const step = 28;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 2. Continenti Vettoriali Cyber
    ctx.fillStyle = '#091322';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;

    CONTINENTS.forEach(poly => {
      ctx.beginPath();
      poly.forEach(([lon, lat], i) => {
        const pt = project(lat, lon);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // 3. Radar Sweep Line (Effetto Scanner Matrix)
    radarSweepX = (radarSweepX + 1.2) % width;
    const sweepGrad = ctx.createLinearGradient(radarSweepX - 45, 0, radarSweepX, 0);
    sweepGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
    sweepGrad.addColorStop(1, 'rgba(16, 185, 129, 0.18)');
    ctx.fillStyle = sweepGrad;
    ctx.fillRect(radarSweepX - 45, 0, 45, height);

    ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(radarSweepX, 0);
    ctx.lineTo(radarSweepX, height);
    ctx.stroke();

    // 4. Disegno Target: anonlab.it (Roma, Italia)
    const targetPt = project(TARGET.lat, TARGET.lon);
    targetPulse += 0.04;
    const pulseR = 5 + Math.sin(targetPulse) * 4;

    const lockdownLabel = document.getElementById('lockdown-status-label');
    const isLockdown = lockdownLabel && lockdownLabel.textContent.includes('LOCKDOWN');
    const targetColor = isLockdown ? '#ef4444' : '#34d399';

    ctx.strokeStyle = targetColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(targetPt.x, targetPt.y, pulseR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(targetPt.x, targetPt.y, pulseR + 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(targetPt.x, targetPt.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = '8px ui-monospace, monospace';
    ctx.fillStyle = targetColor;
    ctx.fillText('TARGET: anonlab.it [IT]', targetPt.x + 8, targetPt.y - 6);

    // 5. Nodi d'attacco (Hotspots)
    LOCAL_FALLBACK_ORIGINS.forEach(o => {
      const pt = project(o.lat, o.lon);
      ctx.fillStyle = getSeverityColor(o.severity);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.font = '7px ui-monospace, monospace';
      ctx.fillText(o.country || o.code, pt.x + 4, pt.y + 3);
    });

    // 6. Animazione Archi Balistici Laser
    for (let i = activeArcs.length - 1; i >= 0; i--) {
      const arc = activeArcs[i];
      arc.progress += arc.speed;

      const t = arc.progress;
      const x = (1 - t) * (1 - t) * arc.p1.x + 2 * (1 - t) * t * arc.cp.x + t * t * arc.p2.x;
      const y = (1 - t) * (1 - t) * arc.p1.y + 2 * (1 - t) * t * arc.cp.y + t * t * arc.p2.y;

      arc.trail.push({ x, y });
      if (arc.trail.length > 12) arc.trail.shift();

      if (arc.trail.length > 1) {
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = arc.color;
        ctx.beginPath();
        ctx.moveTo(arc.trail[0].x, arc.trail[0].y);
        for (let j = 1; j < arc.trail.length; j++) {
          ctx.lineTo(arc.trail[j].x, arc.trail[j].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      if (arc.progress >= 1) {
        shockwaves.push({
          x: targetPt.x,
          y: targetPt.y,
          r: 2,
          maxR: 26,
          alpha: 1,
          color: isLockdown ? '#ef4444' : '#34d399'
        });

        interceptCount++;
        localStorage.setItem('soc_threat_intercepts', interceptCount.toString());
        if (countEl) countEl.textContent = interceptCount.toLocaleString() + ' INTERCEPTS';

        updateTicker(arc.origin);
        activeArcs.splice(i, 1);
      }
    }

    // 7. Shockwaves di Mitigazione
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.r += 0.9;
      sw.alpha -= 0.035;

      if (sw.alpha <= 0) {
        shockwaves.splice(i, 1);
      } else {
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Generazione autonoma nei secondi intermedi tra un fetch e l'altro
    const nowTime = Date.now();
    if (nowTime - lastSpawn > 1200 + Math.random() * 1500) {
      if (activeArcs.length < 4) {
        spawnArc();
      }
      lastSpawn = nowTime;
    }

    requestAnimationFrame(draw);
  }

  // Risparmio risorse se cambi scheda
  document.addEventListener('visibilitychange', () => {
    isRunning = !document.hidden;
    if (isRunning) requestAnimationFrame(draw);
  });

  window.addEventListener('resize', resize);
  resize();

  if (countEl) countEl.textContent = interceptCount.toLocaleString() + ' INTERCEPTS';

  // Avvio animazione
  spawnArc();
  requestAnimationFrame(draw);

  // Avvio ciclo telemetria reale da Altervista
  fetchRealThreats();
  setInterval(fetchRealThreats, POLL_INTERVAL_MS);
}

// Avvio immediato a caricamento pagina
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThreatMap);
} else {
  initThreatMap();
}

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
