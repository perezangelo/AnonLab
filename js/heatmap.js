/* ============================================================
        GLOBAL THREAT HEATMAP — Versione Dinamica Finale
        Dataset: FeodoTracker (Botnet reali)
   ============================================================ */

async function startHeatmap() {
    const canvas = document.getElementById("heatmap-canvas");
    if (!canvas) return setTimeout(startHeatmap, 200);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    async function fetchBotnetIPs() {
        try {
            const res = await fetch("https://feodotracker.abuse.ch/downloads/ipblocklist.json");
            const data = await res.json();

            // Prendiamo i primi 40 IP malevoli
            const entries = data.data.slice(0, 40);

            const points = [];

            for (const entry of entries) {
                const ip = entry.ip_address;
                if (!ip) continue;

                try {
                    const geo = await fetch(`https://ipapi.co/${ip}/json/`);
                    const geoData = await geo.json();

                    if (!geoData.latitude || !geoData.longitude) continue;

                    points.push({
                        lat: geoData.latitude,
                        lon: geoData.longitude,
                        intensity: 0.7
                    });

                } catch (e) {
                    console.warn("GeoIP fallito:", ip);
                }
            }

            return points;

        } catch (e) {
            console.error("Errore FeodoTracker:", e);
            return [];
        }
    }

    function drawPoints(points) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        points.forEach(p => {
            const x = (p.lon + 180) * (canvas.width / 360);
            const y = (90 - p.lat) * (canvas.height / 180);

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
            gradient.addColorStop(0, `rgba(255,0,0,${p.intensity})`);
            gradient.addColorStop(1, "rgba(255,0,0,0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 50, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    async function updateHeatmap() {
        const points = await fetchBotnetIPs();
        drawPoints(points);
    }

    updateHeatmap();
    setInterval(updateHeatmap, 15000);
}

startHeatmap();
