// ===============================
// MAIN SCRIPT — ANONLAB
// ===============================

console.log("AnonLab UI loaded");

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

    console.log("Calcolatrice inizializzata correttamente");
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
// CONTATORE + SALUTO + DATA/ORA
// ===============================

function initVisitCounter() {

    const counterEl = document.getElementById("visit-counter");
    const pageEl    = document.getElementById("page-counter");
    const dateEl    = document.getElementById("visit-date");
    const timeEl    = document.getElementById("visit-time");
    const greetEl   = document.getElementById("visit-greeting");
    const iconEl    = document.querySelector(".counter-icon");

    const currentPageEl = document.getElementById("current-page-count");
    const listContainerEl = document.getElementById("pages-list");

    if (!counterEl || !pageEl || !dateEl || !timeEl || !greetEl) {
        console.warn("Counter: elementi non trovati, sidebar non pronta");
        return;
    }

    // -----------------------------
    // ANIMAZIONE NUMERICA
    // -----------------------------
    function animateValue(el, start, end, duration = 600) {
        const range = end - start;
        let startTime = null;

        function step(ts) {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            el.textContent = Math.floor(start + range * progress);
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    // -----------------------------
    // VISITE TOTALI
    // -----------------------------
    let visits = parseInt(localStorage.getItem("anonlab_visits") || "0") + 1;
    localStorage.setItem("anonlab_visits", visits);
    animateValue(counterEl, visits - 1, visits);

    // -----------------------------
    // PAGINE TOTALI
    // -----------------------------
    let pagesTotal = parseInt(localStorage.getItem("anonlab_pages") || "0") + 1;
    localStorage.setItem("anonlab_pages", pagesTotal);
    animateValue(pageEl, pagesTotal - 1, pagesTotal);

    // -----------------------------
    // PAGINA CORRENTE + ELENCO COMPLETO
    // -----------------------------
    const pageName = window.location.pathname.replace("/", "") || "home";

    let pages = JSON.parse(localStorage.getItem("pagesViewed")) || {};

    if (!pages[pageName]) pages[pageName] = 0;
    pages[pageName]++;

    localStorage.setItem("pagesViewed", JSON.stringify(pages));

    if (currentPageEl) currentPageEl.textContent = pages[pageName];

    if (listContainerEl) {
        listContainerEl.innerHTML = "";
        Object.keys(pages).forEach(page => {
            const li = document.createElement("li");
            li.textContent = `${page}: ${pages[page]}`;
            listContainerEl.appendChild(li);
        });
    }

    // -----------------------------
    // SALUTO DINAMICO
    // -----------------------------
    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = "Ciao!";
        if (hour >= 5 && hour < 12) greeting = "Buongiorno!";
        else if (hour >= 12 && hour < 18) greeting = "Buon pomeriggio!";
        else if (hour >= 18 && hour < 23) greeting = "Buonasera!";
        else greeting = "Buonanotte!";
        greetEl.textContent = greeting;
    }

    // -----------------------------
    // DATA
    // -----------------------------
    function updateDate() {
        const now = new Date();
        dateEl.textContent =
            `${String(now.getDate()).padStart(2, "0")}/` +
            `${String(now.getMonth() + 1).padStart(2, "0")}/` +
            now.getFullYear();
    }

    // -----------------------------
    // ORA + EFFETTO PULSE
    // -----------------------------
    function updateTime() {
        const now = new Date();
        timeEl.textContent =
            `${String(now.getHours()).padStart(2, "0")}:` +
            `${String(now.getMinutes()).padStart(2, "0")}:` +
            `${String(now.getSeconds()).padStart(2, "0")}`;

        timeEl.classList.add("neon-pulse");
        setTimeout(() => timeEl.classList.remove("neon-pulse"), 300);

        if (iconEl) {
            iconEl.classList.add("spin-once");
            setTimeout(() => iconEl.classList.remove("spin-once"), 600);
        }
    }

    updateGreeting();
    updateDate();
    updateTime();
    setInterval(updateTime, 1000);

    console.log("Contatore visite — versione completa attiva");
}

// ===============================
// INIZIALIZZAZIONE SICURA
// ===============================
document.addEventListener("DOMContentLoaded", initVisitCounter);
// ===============================
// NAVBAR MOBILE — HAMBURGER MENU
// ===============================

function initMobileMenu() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");

    if (!toggle || !nav) {
        console.warn("Navbar mobile: elementi non trovati");
        return;
    }

    toggle.addEventListener("click", () => {
        nav.classList.toggle("open");
    });

    console.log("Navbar mobile inizializzata");
}

// Aspetta che i partial siano caricati
document.addEventListener("DOMContentLoaded", () => {
    // Ritardo minimo per permettere a loadPartial() di completare
    setTimeout(() => {
        initMobileMenu();
    }, 300);
});
