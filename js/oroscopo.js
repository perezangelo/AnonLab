/* ============================================================
   OROSCOPO — VERSIONE OTTIMIZZATA E STABILE
============================================================ */

/* Carica il testo dell’oroscopo + immagine + link */
async function loadOroscopo(sign = "ariete") {
    try {
        const res = await fetch("/data/oroscopo.json");

        if (!res.ok) {
            throw new Error("Errore nel caricamento del JSON");
        }

        const data = await res.json();

        const textBox = document.getElementById("oroscopo-text");
        const imgBox = document.getElementById("oroscopo-img");
        const linkBox = document.getElementById("oroscopo-link");

        if (!textBox || !imgBox || !linkBox) return;

        textBox.innerHTML = data[sign] || "Oroscopo non disponibile.";
        imgBox.src = `/img/oroscopo/${sign}.svg`;
        imgBox.alt = `Segno zodiacale ${sign}`;
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
   INIZIALIZZAZIONE SICURA
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    function waitForOroscopoElements() {
        const select = document.getElementById("oroscopo-select");
        const linkBox = document.getElementById("oroscopo-link");
        const imgBox = document.getElementById("oroscopo-img");
        const textBox = document.getElementById("oroscopo-text");

        if (!select || !linkBox || !imgBox || !textBox) {
            return setTimeout(waitForOroscopoElements, 80);
        }

        initOrosc
