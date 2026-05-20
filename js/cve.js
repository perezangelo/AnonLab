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

function getSeverityClass(sev) {
    if (!sev) return "cve-badge-unknown";
    const s = sev.toUpperCase();
    if (s === "LOW") return "cve-badge-low";
    if (s === "MEDIUM") return "cve-badge-medium";
    if (s === "HIGH") return "cve-badge-high";
    if (s === "CRITICAL") return "cve-badge-critical";
    return "cve-badge-unknown";
}

async function loadCVEToday() {
    const container = document.getElementById("cve-today");
    if (!container) return;

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

        const sevClass = getSeverityClass(severity);
        const sevLabel = severity || "N/A";
        const scoreLabel = score ? `CVSS ${score}` : "";
        const dateLabel = formatCveDate(published);

        container.innerHTML = `
            <div class="cve-header">
                <span class="cve-id">${id}</span>
                <span class="cve-badge ${sevClass}">${sevLabel}</span>
                ${scoreLabel ? `<span class="cve-score">${scoreLabel}</span>` : ""}
            </div>
            <p class="cve-desc">${description}</p>
            <div class="cve-meta">
                ${dateLabel ? `<span class="cve-date">Pubblicata: ${dateLabel}</span>` : ""}
                <a href="${url}" class="cve-link" target="_blank" rel="noopener">Scheda NVD →</a>
            </div>
        `;
    } catch (e) {
        console.error(e);
        container.textContent = "Errore nel caricamento della vulnerabilità.";
    }
}

loadCVEToday();
