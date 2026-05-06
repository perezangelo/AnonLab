async function loadOroscopo(sign = "ariete") {
    try {
        const res = await fetch("/data/oroscopo.json");
        const data = await res.json();

        const textBox = document.getElementById("oroscopo-text");
        const imgBox = document.getElementById("oroscopo-img");
        const linkBox = document.getElementById("oroscopo-link");

        if (!textBox || !imgBox || !linkBox) return;

        // Testo
        textBox.innerHTML = data[sign] || "Oroscopo non disponibile.";

        // Immagine
        imgBox.src = `/img/oroscopo/${sign}.svg`;
        imgBox.alt = sign;

        // Link alla pagina del segno
        linkBox.href = `/oroscopo/${sign}.html`;

    } catch (err) {
        console.error("Errore oroscopo:", err);
        document.getElementById("oroscopo-text").innerHTML =
            "Impossibile caricare l’oroscopo.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("oroscopo-select");
    const linkBox = document.getElementById("oroscopo-link");

    if (!select || !linkBox) return;

    // Carica il primo segno
    loadOroscopo(select.value);

    // Cambia segno
    select.addEventListener("change", () => {
        const sign = select.value;
        loadOroscopo(sign);

        // 🔥 APERTURA AUTOMATICA SENZA USARE window.location.href
        linkBox.click();
    });
});
