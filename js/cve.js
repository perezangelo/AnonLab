async function loadCVEToday() {
    const container = document.getElementById("cve-today");
    if (!container) return;

    container.textContent = "Caricamento...";

    try {
        // Legge il file statico generato dalla GitHub Action
        const res = await fetch("/data/cve-today.json");
        if (!res.ok) throw new Error("Impossibile leggere cve-today.json");

        const data = await res.json();

        const id = data.id || "CVE non disponibile";
        const description = data.description || "Descrizione non disponibile.";

        container.innerHTML = `
            <strong>${id}</strong><br>
            ${description}
        `;
    } catch (e) {
        console.error(e);
        container.textContent = "Errore nel caricamento della vulnerabilità.";
    }
}

loadCVEToday();
