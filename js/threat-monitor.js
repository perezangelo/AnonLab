/* ============================================================
   Threat Monitor – Versione compatibile con backend AlterVista
   ============================================================ */

const THREAT_API_URL =
    "https://angelonline.altervista.org/api/threat-nvd.php";

/* --- Anti-cache per AlterVista CDN --- */
function fetchThreatData() {
    const url = THREAT_API_URL + "?ts=" + Date.now();

    return fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" }
    })
    .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
    });
}

function initThreatMonitor() {
    fetchThreatData()
        .then(data => updateThreatWidget(data))
        .catch(err => console.error("Threat Monitor error:", err));
}

function updateThreatWidget(data) {

    /* --- Gestione errori dal backend --- */
    if (data.error) {
        console.warn("Backend NVD error:", data.error);
    }

    /* --- Funzione per aggiornare le barre --- */
    function setBar(labelId, barId, value) {
        const label = document.getElementById(labelId);
        const bar = document.getElementById(barId);

        if (!bar) return;

        let v = Number(value);
        if (isNaN(v)) v = 0;
        if (v < 0) v = 0;
        if (v > 100) v = 100;

        bar.style.width = v + "%";

        const valSpan = bar.querySelector(".bar-value");
        if (valSpan) valSpan.textContent = v + "%";

        if (label) {
            const base = label.getAttribute("data-title") || label.textContent;
            label.textContent = base;
        }
    }

    /* --- Aggiornamento barre --- */
    setBar("label-global",       "bar-global",       data.global);
    setBar("label-baseScoreAvg", "bar-baseScoreAvg", data.baseScoreAvg);
    setBar("label-highCount",    "bar-highCount",    data.highCount);
    setBar("label-networkCount", "bar-networkCount", data.networkCount);
    setBar("label-confImpact",   "bar-confImpact",   data.confImpact);
    setBar("label-availImpact",  "bar-availImpact",  data.availImpact);

    /* --- Timestamp dal backend (non dal browser) --- */
    const ts = document.getElementById("threat-last-update");
    if (ts && data.updated) {
        ts.textContent = "Last Update: " + data.updated;
    }
}

/* --- Avvio widget --- */
document.addEventListener("DOMContentLoaded", initThreatMonitor);
