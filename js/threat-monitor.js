async function initThreatMonitor() {
    const bars = {
        global: document.getElementById("bar-global"),
        ransomware: document.getElementById("bar-ransomware"),
        exploit: document.getElementById("bar-exploit")
    };

    if (!bars.global) return;

    async function loadThreat() {
        try {
            const res = await fetch("https://angelonline.altervista.org/backend/system-status.php?ts=" + Date.now());
            const data = await res.json();

            const values = {
                global: data.global.score,
                ransomware: data.categories.ransomware.score,
                exploit: data.categories.exploit.score
            };

            setTimeout(() => {
                Object.keys(values).forEach(key => {
                    if (bars[key]) {
                        bars[key].style.width = values[key] + "%";
                    }
                });
            }, 120);

        } catch (err) {
            console.error("Errore Threat Monitor:", err);
        }
    }

    loadThreat();
    setInterval(loadThreat, 10000);
}


