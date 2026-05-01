// ===============================
// MAIN SCRIPT — ANONLAB
// ===============================

// Log di conferma caricamento
console.log("AnonLab UI loaded");

// ===============================
// CALCOLATRICE — INIZIALIZZAZIONE
// ===============================

function initCalculator() {
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('#calc-buttons .calc-btn');

    // Se la calcolatrice non è presente nella pagina, esci
    if (!calcDisplay || calcButtons.length === 0) {
        console.warn("Calcolatrice non trovata nella pagina.");
        return;
    }

    // Evita doppi event listener
    if (calcDisplay.dataset.ready === "true") {
        return;
    }
    calcDisplay.dataset.ready = "true";

    // Eventi pulsanti
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
