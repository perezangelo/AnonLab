/* ============================================================
   Threat Monitor – Versione compatibile con backend AlterVista
   ============================================================ */

const THREAT_API_URL = "https://angelonline.altervista.org/api/threat-nvd.php";

function initThreatMonitor() {
    fetch(THREAT_API_URL, {
        method: "GET",
        headers: { "Accept": "application/json" }
    })
    .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
    })
    .then(data => updateThreatWidget(data))
    .catch(err => console.error("Threat Monitor error:", err));
}

function updateThreatWidget(data) {

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
            label.textContent = base + ": " + v + "%";
        }
    }

    setBar("label-global",       "bar-global",       data.global);
    setBar("label-baseScoreAvg", "bar-baseScoreAvg", data.baseScoreAvg);
    setBar("label-highCount",    "bar-highCount",    data.highCount);
    setBar("label-networkCount", "bar-networkCount", data.networkCount);
    setBar("label-confImpact",   "bar-confImpact",   data.confImpact);
    setBar("label-availImpact",  "bar-availImpact",  data.availImpact);

    const ts = document.getElementById("threat-last-update");
    if (ts) {
        const now = new Date();
        ts.textContent = "Last Update: " + now.toLocaleString("it-IT");
    }
}

document.addEventListener("DOMContentLoaded", initThreatMonitor);
