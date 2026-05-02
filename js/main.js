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
}

// ===============================
// CONTATORE + SALUTO + DATA/ORA
// ===============================

function initVisitCounter() {
    const counterEl = document.getElementById("visitCounter");
    const pageEl = document.getElementById("pageCounter");
    const dateEl = document.getElementById("visitDate");
    const timeEl = document.getElementById("visitTime");
    const greetEl = document.getElementById("visitGreeting");

    if (!counterEl || !pageEl || !dateEl || !timeEl || !greetEl) return;

    let visits = localStorage.getItem("anonlab_visits");
    visits = visits ? parseInt(visits) + 1 : 1;
    localStorage.setItem("anonlab_visits", visits);
    counterEl.textContent = visits;

    let pages = localStorage.getItem("anonlab_pages");
    pages = pages ? parseInt(pages) + 1 : 1;
    localStorage.setItem("anonlab_pages", pages);
    pageEl.textContent = pages;

    function updateGreeting() {
        const hour = new Date().getHours();
        let greeting = "Ciao!";
        if (hour >= 5 && hour < 12) greeting = "Buongiorno!";
        else if (hour >= 12 && hour < 18) greeting = "Buon pomeriggio!";
        else if (hour >= 18 && hour < 23) greeting = "Buonasera!";
        else greeting = "Buonanotte!";
        greetEl.textContent = greeting;
    }

    function updateDate() {
        const now = new Date();
        const d = now.getDate().toString().padStart(2, "0");
        const m = (now.getMonth() + 1).toString().padStart(2, "0");
        const y = now.getFullYear();
        dateEl.textContent = `${d}/${m}/${y}`;
    }

    function updateTime() {
        const now = new Date();
        const h = now.getHours().toString().padStart(2, "0");
        const m = now.getMinutes().toString().padStart(2, "0");
        const s = now.getSeconds().toString().padStart(2, "0");
        timeEl.textContent = `${h}:${m}:${s}`;
    }

    updateGreeting();
    updateDate();
    updateTime();
    setInterval(updateTime, 1000);
}

// ===============================
// INIZIALIZZAZIONE
// ===============================

initVisitCounter();
initRadio();
initYouTubePlayer();
