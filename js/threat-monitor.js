async function initThreatMonitor() {

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

            const keys = ["global", "ransomware", "exploit", "ddos", "phishing", "botnet"];

            keys.forEach(key => {
                const bar = document.getElementById("bar-" + key);
                const label = document.getElementById("label-" + key);
                const value = data[key] ?? 0;

                if (!bar || !label) return;

                bar.style.width = value + "%";
                bar.style.backgroundColor = getThreatColor(value);
                bar.textContent = value + "%";

                label.textContent = label.dataset.title + ": " + value + "%";
            });

        } catch (err) {
            console.error("Threat Monitor error:", err);
        }
    }

    loadThreat();
    setInterval(loadThreat, 60000);
}
