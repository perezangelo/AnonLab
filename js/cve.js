async function loadCVEToday() {
    const container = document.getElementById("cve-today");
    if (!container) return;

    container.textContent = "Caricamento...";

    try {
        // Proxy per evitare CORS su GitHub Pages
        const url = "https://corsproxy.io/?https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=1";

        const res = await fetch(url);
        const data = await res.json();

        const cve = data.vulnerabilities[0].cve;
        const id = cve.id;
        const description = cve.descriptions[0].value;

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
