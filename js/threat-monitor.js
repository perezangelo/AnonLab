/* ============================================================
   Threat Monitor – Versione compatibile con backend AlterVista
   ============================================================ */

async function initThreatMonitor() {

    const bars = {
        global: document.getElementById("bar-global"),
        exploit: document.getElementById("bar-exploit"),
        ransomware: document.getElementById("bar-ransomware"),
        ddos: document.getElementById("bar-ddos"),
        phishing: document.getElementById("bar-phishing"),
        botnet: document.getElementById("bar-botnet")
    };

    const labels = {
        global: document.getElementById("label-global"),
        exploit: document.getElementById("label-exploit"),
        ransomware: document.getElementById("label-ransomware"),
        ddos: document.getElementById("label-ddos"),
        phishing: document.getElementById("label-phishing"),
        botnet: document.getElementById("label-botnet")
    };

    function getThreatColor(value) {
        if (value <= 30) return "#4caf50";
        if (value <= 60) return "#ffeb3b";
        if (value <= 80) return "#ff9800";
        return "#f44336";
    }

    async function loadThreat() {
        try {
            const res = await fetch("https://angelonline.altervista.org/api/threat-nvd.php?ts=" + Date.now());
            const data = await res.json();

            const values = {
                global: data.global ?? 0,
                exploit: data.exploit ?? 0,
                ransomware: data.ransomware ?? 0,
                ddos: data.ddos ?? 0,
                phishing: data.phishing ?? 0,
                botnet: data.botnet ?? 0
            };

            Object.keys(values).forEach(key => {
                const bar = bars[key];
                const label = labels[key];
                const value = values[key];

                if (!bar || !label) return;

                bar.style.width = value + "%";
                bar.style.backgroundColor = getThreatColor(value);
                bar.textContent = value + "%";

                label.textContent = label.dataset.title + ": " + value + "%";
            });

        } catch (err) {
            console.error("Errore Threat Monitor:", err);
        }
    }

    loadThreat();
    setInterval(loadThreat, 60000);
}


