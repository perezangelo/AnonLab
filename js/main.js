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

function setupCalculatorSilent() {
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('#calc-buttons .calc-btn');

    // Se gli elementi non ci sono ancora, esce in silenzio (ritorna false)
    if (!calcDisplay || calcButtons.length === 0) {
        return false;
    }

    // Evita di registrare gli eventi più di una volta
    if (calcDisplay.dataset.ready === "true") return true;
    calcDisplay.dataset.ready = "true";

    calcButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.textContent.trim();

            if (value === 'C') {
                calcDisplay.textContent = '0';
                return;
            }

            if (value === '==') {
                try {
                    calcDisplay.textContent = String(
                        Function('"use strict"; return (' + calcDisplay.textContent + ')')()
                    );
                } catch {
                    calcDisplay.textContent = 'Errore';
                }
                return;
            }

            if (calcDisplay.textContent === '0' || calcDisplay.textContent === 'Errore') {
                calcDisplay.textContent = value;
            } else {
                calcDisplay.textContent += value;
            }
        });
    });

    return true; // Calcolatrice trovata e inizializzata con successo
}

document.addEventListener("DOMContentLoaded", () => {

    // 1. Primo tentativo immediato al DOM ready
    if (!setupCalculatorSilent()) {
        
        // 2. Se non c'è ancora, osserva le modifiche del DOM fino a quando non appare la sidebar
        const calcObserver = new MutationObserver((mutations, observer) => {
            if (setupCalculatorSilent()) {
                observer.disconnect(); // Si disattiva subito appena trova la calcolatrice
            }
        });

        calcObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

});

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
    const initCalculatorSafe = () => {
        const display = document.getElementById("calc-display");
        const buttons = document.querySelectorAll("#calc-buttons .calc-btn");

        if (!display || buttons.length === 0) return false;
        if (display.dataset.ready === "true") return true;
        display.dataset.ready = "true";

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.textContent.trim();

                if (value === 'C') {
                    display.textContent = '0';
                    return;
                }

                if (value === '==') {
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

        return true;
    };

    initCalculatorSafe();

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

