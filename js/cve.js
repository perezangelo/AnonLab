async function loadCVEToday() {
    const box = document.getElementById("cve-today");
    if (!box) return;

    box.textContent = "Caricamento...";

    try {
        const res = await fetch("https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=1");
        const data = await res.json();

        const v = data.vulnerabilities?.[0];
        const cve = v?.cve;

        if (!cve) {
            box.innerHTML = `
                <strong>Nessuna CVE disponibile</strong>
                <p>Il servizio NVD non ha restituito dati.</p>
            `;
            return;
        }

        const id = cve.id;
        const desc = cve.descriptions?.[0]?.value || "Descrizione non disponibile";
        const url = `https://nvd.nist.gov/vuln/detail/${id}`;

        box.innerHTML = `
            <strong>${id}</strong>
            <p>${desc}</p>
            <a href="${url}" target="_blank" rel="noopener"
               style="color:#ff7b00;">
               Scheda NVD →
            </a>
        `;
    } catch (err) {
        box.innerHTML = `
            <strong>Servizio non disponibile</strong>
            <p>Impossibile recuperare la vulnerabilità del giorno.</p>
        `;
    }
}

loadCVEToday();
