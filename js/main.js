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
// RADIO — APERTURA PAGINA ON AIR
// ===============================

function initRadio() {
    const selector = document.getElementById("radioSelector");

    if (!selector || selector.dataset.ready === "true") return;
    selector.dataset.ready = "true";

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

    if (!selector || !iframe || selector.dataset.ready === "true") return;
    selector.dataset.ready = "true";

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

    if (!toggle || !nav) return;

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

        if (timer.dataset.timerStarted === "true" && timerInterval !== null) {
            return true;
        }

        timer.dataset.timerStarted = "true";

        updateDisplay(timer);

        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            const currentTimer = document.getElementById("session-timer");
            if (currentTimer && currentTimer !== timer) {
                checkAndBindTimer();
            } else if (currentTimer) {
                updateDisplay(currentTimer);
            }
        }, 1000);

        console.log("✅ ONLINE SESSION TIMER AVVIATO");
        return true;
    }

    checkAndBindTimer();

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

    // RADIO
    if (typeof initRadio === "function") initRadio();

    // YOUTUBE PLAYER
    if (typeof initYouTubePlayer === "function") initYouTubePlayer();

    // TIMER SESSIONE (Avvio garantito)
    initSessionTimer();
}

// ⭐ RISOLUZIONE DEL PROBLEMA HOME
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startAnonLabApp);
} else {
    startAnonLabApp();
}

