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

            const mapping = {
                global: "Global Threat Level",
                high: "High Severity CVE",
                critical: "Critical Severity CVE",
                avgScore: "Average CVSS Score",
                recent: "Recent CVE (7 days)",
                vendor: "Microsoft Exposure",
                topCwe: "Most Common CWE"
            };

            Object.keys(mapping).forEach(key => {
                const bar = document.getElementById("bar-" + key);
                const label = document.getElementById("label-" + key);
                const value = data[key];

                if (!bar || !label) return;

                if (key === "topCwe") {
                    bar.style.width = "100%";
                    bar.style.backgroundColor = "#00eaff";
                    bar.textContent = data[key];
                    label.textContent = mapping[key] + ": " + data[key];
                    return;
                }

                bar.style.width = value + "%";
                bar.style.backgroundColor = getThreatColor(value);
                bar.textContent = value + "%";

                label.textContent = mapping[key] + ": " + value + "%";
            });

        } catch (err) {
            console.error("Threat Monitor error:", err);
        }
    }

    loadThreat();
    setInterval(loadThreat, 60000);
}

