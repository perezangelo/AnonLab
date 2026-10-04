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
// CALCOLATRICE
// ===============================

function initCalculator() {
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('#calc-buttons .calc-btn');

    if (!calcDisplay || calcButtons.length === 0) {
        console.warn("Calcolatrice non trovata nella pagina.");
        return;
    }

    if (calcDisplay.dataset.ready === "true") return;
    calcDisplay.dataset.ready = "true";

    calcButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.textContent;

            if (value === 'C') {
                calcDisplay.textContent = '0';
                return;
            }

            if (value === '=') {
                try {
                    calcDisplay.textContent = eval(calcDisplay.textContent);
                } catch {
                    calcDisplay.textContent = 'Errore';
                }
                return;
            }

            if (calcDisplay.textContent === '0') {
                calcDisplay.textContent = value;
            } else {
                calcDisplay.textContent += value;
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

    // Inizializza navbar mobile
    setTimeout(() => {
        initMobileMenu();
    }, 300);

    // Inizializza calcolatrice
    initCalculator();

    // Inizializza radio
    initRadio();

    // Inizializza YouTube player
    initYouTubePlayer();

    // TIMER SESSIONE
    initSessionTimer();

    // ⭐ Il contatore visite è ora gestito dal nuovo script in index.html
});

