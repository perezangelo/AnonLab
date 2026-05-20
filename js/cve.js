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

    container.textContent = "Caricamento...";

    try {
        const res = await fetch("/data/cve-today.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Impossibile leggere cve-today.json");

        const data = await res.json();

        // Fallback se il file è vuoto o non valido
        if (!data || !data.id) {
            container.innerHTML = `
                <strong>Nessuna CVE disponibile</strong>
                <p>Il servizio NVD non ha restituito dati aggiornati.</p>
            `;
            return;
        }

        const id = data.id;
        const description = data.description || "Descrizione non disponibile.";
        const score = data.score;
        const severity = data.severity;
        const published = data.published;
        const url = data.url || `https://nvd.nist.gov/vuln/detail/${id}`;

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
                    <a href="${url}" 
                       target="_blank" 
                       rel="noopener"
                       style="
                         color:#ff7b00;
                         text-shadow:0 0 6px #ff7b00;
                         font-weight:bold;
                       ">
                       Scheda NVD →
                    </a>
                </small>
            </div>
        `;
    } catch (e) {
        console.error(e);

        // Fallback elegante in caso di errore
        container.innerHTML = `
            <strong>Servizio temporaneamente non disponibile</strong>
            <p>Impossibile recuperare la vulnerabilità del giorno.</p>
            <small style="opacity:0.7;">Riprova più tardi.</small>
        `;
    }
}

loadCVEToday();
