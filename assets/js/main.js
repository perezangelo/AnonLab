// Script base per AnonLab
// Qui in futuro potrai gestire:
// - caricamento dinamico delle news
// - meteo tramite API
// - oroscopo tramite API
// - aggiornamento automatico della data LIVE

console.log("AnonLab UI loaded");
// ===============================
// CALCOLATRICE SIDEBAR — ANONLAB
// ===============================

document.addEventListener("DOMContentLoaded", function () {
    const calcDisplay = document.getElementById('calc-display');
    const calcButtons = document.querySelectorAll('#calc-buttons .calc-btn');

    // Se la calcolatrice non è presente nella pagina, esci
    if (!calcDisplay || calcButtons.length === 0) {
        console.warn("Calcolatrice non trovata nella pagina.");
        return;
    }

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
});

