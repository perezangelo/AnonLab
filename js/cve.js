function formatCveDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
}

async function loadCVEToday() {
    const container = document.getElementById("cve-today");
    if (!container) return;

    // Applico la classe che già colora i link in arancione laser
    container.classList.add("cyber-section");

    container.textContent = "Caricamento...";

    try {
        const res = await fetch("/data/cve-today.json");
        if (!res.ok) throw new Error("Impossibile leggere cve-today.json");

        const data = await res.json();

        const id = data.id || "CVE non disponibile";
        const description = data.description || "Descrizione non disponibile.";
        const score = data.score;
        const severity = data.severity;
        const published = data.published;
        const url = data.url || (id.startsWith("CVE-") ? `https://nvd.nist.gov/vuln/detail/${id}` : "#");

        let header = id;
        if (severity) header += ` — ${severity}`;
        if (score) header += ` (CVSS ${score})`;

        const dateLabel = formatCveDate(published);

        container.innerHTML = `
            <div><strong>${header}</strong></div>
            <p>${description}</p>
            <div>
                <small>
                    ${dateLabel ? `Pubblicata: ${dateLabel} — ` : ""}
                    <a href="${url}" target="_blank" rel="noopener">Scheda NVD →</a>
                </small>
            </div>
        `;
    } catch (e) {
        console.error(e);
        container.textContent = "Errore nel caricamento della vulnerabilità.";
    }
}

loadCVEToday();
