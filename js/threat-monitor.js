/* ============================================================
   Threat Monitor – Cyber Risk Bars (AnonLab Edition)
   ============================================================ */

async function initThreatMonitor() {
    const barGlobal = document.getElementById("bar-global");
    const barRansom = document.getElementById("bar-ransomware");
    const barDdos = document.getElementById("bar-ddos");

    if (!barGlobal || !barRansom || !barDdos) return;

    async function loadThreat() {
        try {
            const res = await fetch("/data/threat-monitor.json?ts=" + Date.now());
            const data = await res.json();

            // estrazione valori dal JSON completo
            const globalScore = data.global.score;
            const ransomScore = data.categories.ransomware.score;
            const ddosScore = data.categories.ddos.score;

            // animazione fluida
            setTimeout(() => {
                barGlobal.style.width = globalScore + "%";
                barRansom.style.width = ransomScore + "%";
                barDdos.style.width = ddosScore + "%";
            }, 120);

        } catch (err) {
            console.error("Errore Threat Monitor:", err);

            barGlobal.style.width = "0%";
            barRansom.style.width = "0%";
            barDdos.style.width = "0%";
        }
    }

    loadThreat();
    setInterval(loadThreat, 10000); // aggiornamento ogni 10 secondi
}
