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

// -----------------------------
// FETCH REAL-TIME DA ALTERVISTA (SOLO LETTURA)
// -----------------------------
function loadRealCounter() {
    const pageName = window.location.pathname.replace("/", "") || "home";

    // 1) Registrazione visita DISATTIVATA su GitHub (evita CORS)
    console.log("Visita NON registrata da GitHub (CORS).");

    // 2) Legge i dati reali (JSON)
    fetch("https://angelonline.altervista.org/counter/visits.php?cache=" + Date.now())
        .then(r => r.json())
        .then(data => {

            // Totale visite oggi
            animateValue(counterEl, parseInt(counterEl.textContent), data.today.visits);

            // Pagine totali
            const totalPages = Object.values(data.pages).reduce((a, b) => a + b.total, 0);
            animateValue(pageEl, parseInt(pageEl.textContent), totalPages);

            // Questa pagina
            if (currentPageEl) {
                currentPageEl.textContent = data.pages[pageName]?.total ?? 0;
            }

            // Lista pagine viste
            if (listContainerEl) {
                listContainerEl.innerHTML = "";
                for (const p in data.pages) {
                    const li = document.createElement("li");
                    li.textContent = `${p}: ${data.pages[p].total}`;
                    listContainerEl.appendChild(li);
                }
            }

            // Utenti online
            if (onlineEl) onlineEl.textContent = Object.keys(data.online).length;

            // Dispositivi
            if (devMobileEl)  devMobileEl.textContent  = data.today.mobile;
            if (devDesktopEl) devDesktopEl.textContent = data.today.desktop;
            if (devTabletEl)  devTabletEl.textContent  = data.today.tablet;
        })
        .catch(err => console.error("Errore counter:", err));
}

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
    setTimeout(() => {
        initMobileMenu();
    }, 300);
});
