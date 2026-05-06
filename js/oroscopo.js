async function loadOroscopo(sign = "ariete") {
    try {
        const res = await fetch("/data/oroscopo.json");
        const data = await res.json();

        const textBox = document.getElementById("oroscopo-text");
        const imgBox = document.getElementById("oroscopo-img");
        const linkBox = document.getElementById("oroscopo-link");

        if (!textBox || !imgBox || !linkBox) return;

        textBox.innerHTML = data[sign] || "Oroscopo non disponibile.";

        imgBox.src = `/img/oroscopo/${sign}.svg`;
        imgBox.alt = sign;

        linkBox.href = `/oroscopo/${sign}.html`;

    } catch (err) {
        console.error("Errore oroscopo:", err);
        document.getElementById("oroscopo-text").innerHTML =
            "Impossibile caricare l’oroscopo.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("oroscopo-select");
    if (!select) return;

    loadOroscopo(select.value);

    select.addEventListener("change", () => {
        loadOroscopo(select.value);
    });
});
