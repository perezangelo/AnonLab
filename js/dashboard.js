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


"use strict";

/*
 * AnonLab — OPSEC & OSINT Dashboard
 * Versione 1: interfaccia, controlli locali e validazione.
 * Nessuna richiesta di rete viene eseguita da questo file.
 */

(() => {
    const dashboard = document.getElementById("opsec-dashboard");

    if (!dashboard || dashboard.dataset.opsecInitialized === "true") {
        return;
    }

    dashboard.dataset.opsecInitialized = "true";

    const $ = (selector) => dashboard.querySelector(selector);

    // --------------------------------------------------
    // UTILITÀ
    // --------------------------------------------------

    function showResult(selector, message) {
        const element = $(selector);
        if (!element) return;

        // Usa textContent: evita di interpretare l'input come HTML.
        element.textContent = message;
        element.hidden = false;
    }

    function clearResult(selector) {
        const element = $(selector);
        if (element) {
            element.textContent = "";
            element.hidden = true;
        }
    }

    // --------------------------------------------------
    // SCHEDE
    // --------------------------------------------------

    const tabs = Array.from(
        dashboard.querySelectorAll("[data-opsec-tab]")
    );

    const panels = {
        ip: $("#panel-ip"),
        password: $("#panel-password"),
        hash: $("#panel-hash")
    };

    function activateTab(name) {
        if (!panels[name]) return;

        tabs.forEach((tab) => {
            const active = tab.dataset.opsecTab === name;

            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        Object.entries(panels).forEach(([key, panel]) => {
            if (panel) {
                panel.hidden = key !== name;
            }
        });
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            activateTab(tab.dataset.opsecTab);
        });

        tab.addEventListener("keydown", (event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                return;
            }

            event.preventDefault();

            const currentIndex = tabs.indexOf(tab);
            let nextIndex = currentIndex;

            if (event.key === "ArrowRight") {
                nextIndex = (currentIndex + 1) % tabs.length;
            } else if (event.key === "ArrowLeft") {
                nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (event.key === "Home") {
                nextIndex = 0;
            } else if (event.key === "End") {
                nextIndex = tabs.length - 1;
            }

            const nextTab = tabs[nextIndex];
            activateTab(nextTab.dataset.opsecTab);
            nextTab.focus();
        });
    });

    activateTab("ip");

    // --------------------------------------------------
    // PASSWORD: SOLO EL BROWSER, NESSUN INVIO
    // --------------------------------------------------

    const passwordInput = $("#opsec-password-input");
    const passwordVisible = $("#opsec-password-visible");
    const passwordForm = $("#opsec-password-form");

    if (passwordVisible && passwordInput) {
        passwordVisible.addEventListener("change", () => {
            passwordInput.type = passwordVisible.checked
                ? "text"
                : "password";
        });
    }

    function evaluatePassword(password) {
        let score = 0;
        const suggestions = [];

        const length = password.length;
        const classes = [
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /[0-9]/.test(password),
            /[^A-Za-z0-9]/.test(password)
        ].filter(Boolean).length;

        const uniqueCharacters = new Set(password).size;

        // Punteggio euristico, non una misurazione crittografica.
        if (length >= 8) score += 15;
        if (length >= 12) score += 15;
        if (length >= 16) score += 15;
        if (length >= 20) score += 10;

        score += classes * 10;

        if (uniqueCharacters >= 8) score += 5;
        if (uniqueCharacters >= 12) score += 5;

        if (/(.)\1{2,}/.test(password)) {
            score -= 15;
            suggestions.push("Evita caratteri ripetuti consecutivamente.");
        }

        if (/1234|2345|3456|4567|5678|6789|qwerty|asdf|password/i.test(password)) {
            score -= 20;
            suggestions.push("Evita sequenze comuni e parole prevedibili.");
        }

        if (length < 12) {
            suggestions.push("Preferisci almeno 12–16 caratteri.");
        }

        if (classes < 3) {
            suggestions.push(
                "Valuta una combinazione più varia di caratteri."
            );
        }

        score = Math.max(0, Math.min(100, score));

        let rating;

        if (length < 8 || score < 25) {
            rating = "Molto debole";
        } else if (score < 45) {
            rating = "Debole";
        } else if (score < 65) {
            rating = "Discreta";
        } else if (score < 85) {
            rating = "Buona";
        } else {
            rating = "Robusta secondo i criteri di questa stima";
        }

        if (suggestions.length === 0) {
            suggestions.push(
                "Usa una password unica e non riutilizzarla su altri siti."
            );
        }

        return { score, rating, suggestions };
    }

    if (passwordForm && passwordInput) {
        passwordForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const password = passwordInput.value;

            if (!password) {
                showResult(
                    "#opsec-password-result",
                    "Inserisci una password da valutare."
                );
                return;
            }

            const result = evaluatePassword(password);

            showResult(
                "#opsec-password-result",
                "Valutazione locale: " + result.rating +
                " (" + result.score + "/100).\n" +
                result.suggestions.map((item) => "• " + item).join("\n") +
                "\n\nLa valutazione è euristica e non garantisce la sicurezza. " +
                "La password non è stata inviata a un server."
            );

            // Riduce il tempo in cui la password resta nel campo.
            passwordInput.value = "";
            passwordInput.type = "password";

            if (passwordVisible) {
                passwordVisible.checked = false;
            }
        });
    }

    // --------------------------------------------------
    // IP / DOMINIO: VALIDAZIONE LOCALE
    // --------------------------------------------------

    function isIPv4(value) {
        const parts = value.split(".");

        return parts.length === 4 && parts.every((part) => {
            if (!/^\d{1,3}$/.test(part)) return false;
            if (part.length > 1 && part.startsWith("0")) return false;

            const number = Number(part);
            return number >= 0 && number <= 255;
        });
    }

    function isIPv6(value) {
        // Controllo sintattico conservativo, senza risoluzione DNS.
        return value.includes(":") &&
            /^[0-9a-f:]+$/i.test(value) &&
            value.length <= 45 &&
            value.split("::").length <= 2 &&
            value.split(":").length <= 9;
    }

    function isDomain(value) {
        if (!value || value.length > 253 || value.includes("://")) {
            return false;
        }

        const domain = value.endsWith(".")
            ? value.slice(0, -1)
            : value;

        if (!domain || !domain.includes(".")) return false;

        const labels = domain.split(".");

        return labels.every((label) =>
            label.length >= 1 &&
            label.length <= 63 &&
            /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
        );
    }

    const ipForm = $("#opsec-ip-form");
    const ipInput = $("#opsec-ip-input");

    if (ipForm && ipInput) {
        ipForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const value = ipInput.value.trim();
            const valid = isIPv4(value) || isIPv6(value) || isDomain(value);

            if (!valid) {
                showResult(
                    "#opsec-ip-result",
                    "Formato non valido. Inserisci un IPv4, un IPv6 o un dominio."
                );
                return;
            }

            showResult(
                "#opsec-ip-result",
                "Formato valido. L'analisi online non è ancora configurata: " +
                "nessuna richiesta esterna è stata eseguita."
            );
        });
    }

    // --------------------------------------------------
    // HASH: VALIDAZIONE LOCALE
    // --------------------------------------------------

    const hashForm = $("#opsec-hash-form");
    const hashInput = $("#opsec-hash-input");

    if (hashForm && hashInput) {
        hashForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const value = hashInput.value.trim();
            let algorithm = "";

            if (/^[a-f0-9]{32}$/i.test(value)) {
                algorithm = "MD5";
            } else if (/^[a-f0-9]{40}$/i.test(value)) {
                algorithm = "SHA-1";
            } else if (/^[a-f0-9]{64}$/i.test(value)) {
                algorithm = "SHA-256";
            }

            if (!algorithm) {
                showResult(
                    "#opsec-hash-result",
                    "Hash non valido. Inserisci un hash MD5 (32 caratteri), " +
                    "SHA-1 (40) o SHA-256 (64), in formato esadecimale."
                );
                return;
            }

            showResult(
                "#opsec-hash-result",
                "Formato valido: " + algorithm + ". " +
                "La ricerca nei database di reputazione non è ancora configurata; " +
                "l'hash non è stato trasmesso."
            );
        });
    }

    // --------------------------------------------------
    // EMAIL: NESSUN INVIO FINCHÉ NON ESISTE UN BACKEND
    // --------------------------------------------------

    const emailForm = $("#opsec-email-form");
    const emailInput = $("#opsec-email-input");
    const emailConsent = $("#opsec-email-consent");

    if (emailForm && emailInput && emailConsent) {
        emailForm.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!emailInput.value.trim()) {
                showResult(
                    "#opsec-email-result",
                    "Inserisci un indirizzo email."
                );
                return;
            }

            if (!emailConsent.checked) {
                showResult(
                    "#opsec-email-result",
                    "Per procedere con un eventuale servizio esterno è necessario " +
                    "il consenso esplicito. Nessun dato è stato inviato."
                );
                return;
            }

            showResult(
                "#opsec-email-result",
                "Il servizio di verifica email non è ancora configurato. " +
                "Nessuna email è stata trasmessa."
            );
        });
    }

    // Rimuove eventuali messaggi precedenti quando si modifica un campo.
    [
        ["#opsec-ip-input", "#opsec-ip-result"],
        ["#opsec-password-input", "#opsec-password-result"],
        ["#opsec-hash-input", "#opsec-hash-result"],
        ["#opsec-email-input", "#opsec-email-result"]
    ].forEach(([inputSelector, resultSelector]) => {
        const input = $(inputSelector);

        if (input) {
            input.addEventListener("input", () => {
                clearResult(resultSelector);
            });
        }
    });
})();
