// ===============================
// MAIN SCRIPT — ANONLAB
// ===============================

console.log("AnonLab UI loaded");

// ===============================
// SESSION START
// ===============================

if (!sessionStorage.getItem("anonlabStartTime")) {
    sessionStorage.setItem(
        "anonlabStartTime",
        Date.now().toString()
    );
}

// ===============================
// INIZIALIZZAZIONE CALCOLATRICE ASINCRONA
// ===============================

function initCalculator() {
    const display = document.getElementById("calc-display");
    const buttons = document.querySelectorAll("#calc-buttons .calc-btn");

    if (!display || buttons.length === 0) return;

    if (display.dataset.ready === "true") return;
    display.dataset.ready = "true";

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.textContent.trim();

            if (value === 'C') {
                display.textContent = '0';
                return;
            }

            // CORRETTO: gestisce il singolo '=' presente nell'HTML
            if (value === '=' || value === '==') {
                try {
                    display.textContent = String(
                        Function('"use strict"; return (' + display.textContent + ')')()
                    );
                } catch {
                    display.textContent = 'Errore';
                }
                return;
            }

            if (display.textContent === '0' || display.textContent === 'Errore') {
                display.textContent = value;
            } else {
                display.textContent += value;
            }
        });
    });
}

// ===============================
// RADIO — APERTURA PAGINA ON AIR
// ===============================

function initRadio() {
    const selector = document.getElementById("radioSelector");

    if (!selector) return;

    selector.addEventListener("change", () => {
        const url = selector.value;
        if (url) {
            window.open(url, "_blank");
        }
    });

    console.log("Radio inizializzata");
}

// ===============================
// PLAYER YOUTUBE
// ===============================

function initYouTubePlayer() {
    const selector = document.getElementById("ytSelector");
    const iframe = document.getElementById("ytPlayer");

    if (!selector || !iframe) return;

    selector.addEventListener("change", () => {
        const id = selector.value;
        if (id) {
            iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
    });

    console.log("YouTube Player inizializzato");
}

// ===============================
// NAVBAR MOBILE — HAMBURGER MENU
// ===============================

function initMobileMenu() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");

    if (!toggle || !nav) return;  // niente warning

    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });
}

// ===============================
// ONLINE SESSION TIMER (CORRETTO & RESILIENTE)
// ===============================

function initSessionTimer() {
    let timerInterval = null;

    function getStartTime() {
        let start = parseInt(sessionStorage.getItem("anonlabStartTime"), 10);
        if (isNaN(start) || !start) {
            start = Date.now();
            sessionStorage.setItem("anonlabStartTime", start.toString());
        }
        return start;
    }

    function updateDisplay(timerEl) {
        const startTime = getStartTime();
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));

        const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
        const seconds = String(elapsed % 60).padStart(2, "0");

        timerEl.textContent = `● ONLINE SESSION: ${hours}:${minutes}:${seconds}`;
    }

    function checkAndBindTimer() {
        const timer = document.getElementById("session-timer");

        if (!timer) return false;

        // Se l'elemento è già controllato dall'intervallo attivo, non duplicare
        if (timer.dataset.timerStarted === "true" && timerInterval !== null) {
            return true;
        }

        timer.dataset.timerStarted = "true";

        // Aggiorna subito il display visivo
        updateDisplay(timer);

        // Se c'era un vecchio intervallo attivo, ripuliscilo
        if (timerInterval) clearInterval(timerInterval);

        // Avvia il battito al secondo
        timerInterval = setInterval(() => {
            const currentTimer = document.getElementById("session-timer");
            // Se l'elemento è stato sostituito dal fetch del ticker, riaggancialo
            if (currentTimer && currentTimer !== timer) {
                checkAndBindTimer();
            } else if (currentTimer) {
                updateDisplay(currentTimer);
            }
        }, 1000);

        console.log("✅ ONLINE SESSION TIMER AVVIATO");
        return true;
    }

    // 1. Prova subito
    checkAndBindTimer();

    // 2. Observer: rimane in ascolto se il ticker arriva via fetch() dopo il caricamento
    const observer = new MutationObserver(() => {
        const timer = document.getElementById("session-timer");
        if (timer && timer.dataset.timerStarted !== "true") {
            checkAndBindTimer();
        }
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// ===============================
// INIZIALIZZAZIONE SICURA (NO BLOCCHI SULLA HOME)
// ===============================

function startAnonLabApp() {

    // NAVBAR MOBILE
    setTimeout(() => {
        if (typeof initMobileMenu === "function") initMobileMenu();
    }, 300);

    // CALCOLATRICE
document.addEventListener("DOMContentLoaded", () => {
    loadPartial("header", "partials/header.html");
    loadPartial("ticker", "partials/ticker.html").then(() => {
        if (typeof loadTickerNews === "function") loadTickerNews();
    });

    loadPartial("sidebar", "partials/sidebar.html");
    loadPartial("footer", "partials/footer.html");

    // Attende che la sidebar sia caricata nel DOM prima di inizializzare i widget interni
    waitForSidebar().then(() => {
        loadMeteo();
        initCalculator(); // ⭐ Ora parte nel momento esatto in cui la calcolatrice esiste davvero

        if (typeof initVisitCounter === "function") {
            initVisitCounter();
        }
    });
});
    
    // RADIO
    if (typeof initRadio === "function") initRadio();

    // YOUTUBE PLAYER
    if (typeof initYouTubePlayer === "function") initYouTubePlayer();

    // TIMER SESSIONE (Avvio garantito)
    initSessionTimer();
}

// ⭐ RISOLUZIONE DEL PROBLEMA HOME:
// Se il DOM è già pronto si avvia subito, altrimenti attende DOMContentLoaded!
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAnonLabApp);
} else {
    startAnonLabApp();
}
