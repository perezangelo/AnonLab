/* ============================================================
   OROSCOPO — VERSIONE OTTIMIZZATA E STABILE
   ------------------------------------------------------------
   - Attende che la sidebar sia caricata
   - Attende che gli elementi esistano nel DOM
   - Aggiorna immagine, testo e link
   - Apre automaticamente la pagina del segno
   - Gestisce errori e fallback
============================================================ */

/* Carica il testo dell’oroscopo + immagine + link */
async function loadOroscopo(sign = "ariete") {
    try {
        const res = await fetch("/data/oroscopo.json");

        // Controllo risposta
        if (!res.ok) {
            throw new Error("Errore nel caricamento del JSON");
        }

        const data = await res.json();

        // Selezione elementi DOM
        const textBox = document.getElementById("oroscopo-text");
        const imgBox = document.getElementById("oroscopo-img");
        const linkBox = document.getElementById("oroscopo-link");

        // Se mancano elementi → interrompi
        if (!textBox || !imgBox || !linkBox) return;

        // Aggiorna testo
        textBox.innerHTML = data[sign] || "Oroscopo non disponibile.";

        // Aggiorna immagine
        imgBox.src = `/img/oroscopo/${sign}.svg`;
        imgBox.alt = `Segno zodiacale ${sign}`;

        // Aggiorna link
        linkBox.href = `/oroscopo/${sign}.html`;

    } catch (err) {
        console.error("Errore oroscopo:", err);

        const textBox = document.getElementById("oroscopo-text");
        if (textBox) {
            textBox.innerHTML = "Impossibile caricare l’oroscopo.";
        }
    }
}

/* ============================================================
   INIZIALIZZAZIONE — VERSIONE SICURA
   ------------------------------------------------------------
   Problema originale:
   - Il JS partiva PRIMA che la sidebar fosse caricata
   - Gli elementi non esistevano ancora
   - L’immagine non compariva
   - Il testo non si aggiornava
   - Il link non veniva impostato

   Soluzione:
   - Aspettiamo che la sidebar sia caricata
   - Aspettiamo che gli elementi esistano
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    // Funzione che attende la presenza degli elementi
    function waitForOroscopoElements() {
        const select = document.getElementById("oroscopo-select");
        const linkBox = document.getElementById("oroscopo-link");
        const imgBox = document.getElementById("oroscopo-img");
        const textBox = document.getElementById("oroscopo-text");

        // Se gli elementi NON esistono → riprova
        if (!select || !linkBox || !imgBox || !textBox) {
            return setTimeout(waitForOroscopoElements, 80);
        }

        // Se esistono → inizializza
        initOroscopo(select, linkBox);
    }

    waitForOroscopoElements();
});

/* ============================================================
   INIZIALIZZAZIONE DEL WIDGET
============================================================ */

function initOroscopo() {
    const select = document.getElementById("oroscopo-select");
    const textBox = document.getElementById("oroscopo-text");
    const imgBox = document.getElementById("oroscopo-img");
    const linkBox = document.getElementById("oroscopo-link");

    if (!select || !textBox || !imgBox || !linkBox) {
        console.warn("Oroscopo: widget non trovato nella pagina.");
        return;
    }

    fetch("/data/oroscopo.json")
        .then(res => res.json())
        .then(data => {
            const sign = select.value;
            const text = data[sign] || "Oroscopo non disponibile.";

            textBox.innerHTML = text;
            imgBox.src = `/img/oroscopo/${sign}.svg`;
            imgBox.alt = sign;
            linkBox.href = `/oroscopo/${sign}.html`;
        })
        .catch(err => {
            console.error("Errore oroscopo:", err);
            textBox.innerHTML = "Impossibile caricare l’oroscopo.";
        });

    select.addEventListener("change", () => {
        const sign = select.value;

        imgBox.src = `/img/oroscopo/${sign}.svg`;
        imgBox.alt = sign;
        linkBox.href = `/oroscopo/${sign}.html`;

        fetch("/data/oroscopo.json")
            .then(res => res.json())
            .then(data => {
                textBox.innerHTML = data[sign] || "Oroscopo non disponibile.";
                linkBox.click();
            });
    });
}
