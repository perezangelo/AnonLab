async function initThreatMonitor() {
    const barGlobal = document.getElementById("bar-global");
    const barRansom = document.getElementById("bar-ransomware");
    const barDdos = document.getElementById("bar-ddos");

    if (!barGlobal || !barRansom || !barDdos) return;

    try {
        const res = await fetch("https://anonlab.it/data/threat-monitor.json?ts=" + Date.now());
        const data = await res.json();

        // animazione inline
        setTimeout(() => {
            barGlobal.style.width = data.global + "%";
            barRansom.style.width = data.ransomware + "%";
            barDdos.style.width = data.ddos + "%";
        }, 100);

    } catch (err) {
        barGlobal.style.width = "0%";
        barRansom.style.width = "0%";
        barDdos.style.width = "0%";
        console.error(err);
    }
}
