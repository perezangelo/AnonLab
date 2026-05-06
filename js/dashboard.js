/* ============================================================
   DASHBOARD — VERSIONE OTTIMIZZATA E STABILE
   ------------------------------------------------------------
   - Evita errori se non siamo in dashboard.html
   - Evita ricreazione continua del grafico
   - Aggiornamenti più leggeri
   - Controlli DOM sicuri
============================================================ */

/* ============================================================
   1) CONTROLLO PAGINA
   Evita che il JS giri su TUTTO il sito inutilmente
============================================================ */

if (!document.querySelector(".dashboard-container")) {
    // Non siamo nella pagina dashboard → interrompi tutto
    console.log("Dashboard.js: pagina non rilevata, script disattivato.");
    return;
}

/* ============================================================
   2) ELEMENTI DOM (con controlli)
============================================================ */

const threatNumber = document.getElementById("threat-number");
const eventLog = document.getElementById("event-log");
const systemStatus = document.getElementById("system-status");
const ctx = document.getElementById("trafficChart");

if (!threatNumber || !eventLog || !systemStatus || !ctx) {
    console.warn("Dashboard.js: elementi mancanti nel DOM.");
    return;
}

/* ============================================================
   3) GRAFICO — INIZIALIZZAZIONE UNA SOLA VOLTA
============================================================ */

let trafficChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: ["00:00", "01:00", "02:00", "03:00", "04:00"],
        datasets: [{
            label: "Traffico (Gbps)",
            data: [12, 19, 8, 15, 22],
            borderColor: "#00eaff",
            backgroundColor: "rgba(0, 234, 255, 0.15)",
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        animation: false,
        scales: {
            y: { beginAtZero: true }
        }
    }
});

/* ============================================================
   4) FUNZIONE: AGGIORNA NUMERO MINACCE
============================================================ */

function updateThreatNumber() {
    const newValue = Math.floor(Math.random() * 999);

    threatNumber.classList.add("blink");
    threatNumber.textContent = newValue;

    setTimeout(() => threatNumber.classList.remove("blink"), 300);
}

/* ============================================================
   5) FUNZIONE: AGGIORNA LOG EVENTI
============================================================ */

function updateEventLog() {
    const events = [
        "Nuovo tentativo di intrusione bloccato",
        "Connessione sospetta rilevata",
        "Traffico anomalo mitigato",
        "Richiesta API non autorizzata"
    ];

    const li = document.createElement("li");
    li.textContent = events[Math.floor(Math.random() * events.length)];

    eventLog.prepend(li);

    // Mantieni massimo 10 righe
    if (eventLog.children.length > 10) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

/* ============================================================
   6) FUNZIONE: AGGIORNA STATO SISTEMA
============================================================ */

function updateSystemStatus() {
    const states = ["OK", "ATTENZIONE", "CRITICO"];
    const state = states[Math.floor(Math.random() * states.length)];

    systemStatus.textContent = state;

    systemStatus.className = ""; // reset classi
    systemStatus.classList.add("status", state.toLowerCase());
}

/* ============================================================
   7) FUNZIONE: AGGIORNA GRAFICO (LEGGERO)
============================================================ */

function updateChart() {
    const dataset = trafficChart.data.datasets[0].data;

    dataset.shift();
    dataset.push(Math.floor(Math.random() * 25));

    trafficChart.update("none"); // nessuna animazione → più veloce
}

/* ============================================================
   8) LOOP DI AGGIORNAMENTO (OTTIMIZZATO)
============================================================ */

setInterval(() => {
    updateThreatNumber();
    updateEventLog();
    updateSystemStatus();
    updateChart();
}, 4000); // da 3000 → 4000ms per ridurre carico CPU
