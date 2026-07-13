async function initThreatMonitor() {
    const bars = {
        global: document.getElementById("bar-global"),
        ransomware: document.getElementById("bar-ransomware"),
        ddos: document.getElementById("bar-ddos"),
        phishing: document.getElementById("bar-phishing"),
        botnet: document.getElementById("bar-botnet"),
        exploit: document.getElementById("bar-exploit")
    };

    // se mancano elementi HTML → esci
    if (!bars.global) return;

    async function loadThreat() {
        try {
            const res = await fetch("https://angelonline.altervista.org/data/threat-monitor.json?ts=" + Date.now());
            const data = await res.json();

            const values = {
                global: data.global.score,
                ransomware: data.categories.ransomware.score,
                ddos: data.categories.ddos.score,
                phishing: data.categories.phishing.score,
                botnet: data.categories.botnet.score,
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

}

