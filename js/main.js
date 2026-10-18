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
// ONLINE SESSION TIMER
// ===============================

function initSessionTimer() {

    function startTimer() {

        const timer = document.getElementById("session-timer");

        // La navbar potrebbe essere caricata dopo main.js
        if (!timer) {
            return false;
        }

        // Evita doppie inizializzazioni
        if (timer.dataset.timerStarted === "true") {
            return true;
        }

        timer.dataset.timerStarted = "true";

        const startTime = parseInt(
            sessionStorage.getItem("anonlabStartTime"),
            10
        );

        function updateTimer() {

            const elapsed = Math.max(
                0,
                Math.floor((Date.now() - startTime) / 1000)
            );

            const hours = String(
                Math.floor(elapsed / 3600)
            ).padStart(2, "0");

            const minutes = String(
                Math.floor((elapsed % 3600) / 60)
            ).padStart(2, "0");

            const seconds = String(
                elapsed % 60
            ).padStart(2, "0");

            timer.textContent =
                `● ONLINE SESSION: ${hours}:${minutes}:${seconds}`;
        }

        updateTimer();

        setInterval(updateTimer, 1000);

        console.log("✅ ONLINE SESSION TIMER AVVIATO");

        return true;
    }

    // Prova subito
    if (startTimer()) {
        return;
    }

    // La navbar potrebbe arrivare tramite fetch()
    const observer = new MutationObserver(() => {

        if (startTimer()) {
            observer.disconnect();
        }

    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// ===============================
// DOM READY — INIZIALIZZAZIONI
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // NAVBAR MOBILE
    setTimeout(() => {
        initMobileMenu();
    }, 300);

    // CALCOLATRICE (Verifica silenziosa della presenza nella pagina/sidebar)
    const initCalculatorSafe = () => {
        const display = document.getElementById("calc-display");
        const buttons = document.querySelectorAll("#calc-buttons .calc-btn");

        // Se non ci sono gli elementi, esce in silenzio senza errori
        if (!display || buttons.length === 0) {
            return false;
        }

        // Evita doppie inizializzazioni
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

    // Tenta di inizializzarla subito; se la sidebar arriva dopo (es. include dinamici), 
    // usa un controllo leggero o lasciala pronta.
    if (!initCalculatorSafe()) {
        // Se la sidebar viene iniettata dinamicamente in un secondo momento, 
        // puoi lasciare un observer mirato o semplicemente fare in modo che 
        // non emetta alcun log di errore se la pagina è sprovvista di calcolatrice.
    }

    // RADIO
    initRadio();

    // YOUTUBE PLAYER
    initYouTubePlayer();

    // TIMER SESSIONE
    initSessionTimer();
});
