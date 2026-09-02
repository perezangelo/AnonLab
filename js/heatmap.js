/* ============================================================
        GLOBAL THREAT HEATMAP — Versione Dinamica Finale
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

    async function fetchMalwareIPs() {
        try {
            const res = await fetch("https://urlhaus.abuse.ch/downloads/json/");
            const data = await res.json();

            // Prendiamo i primi 50 URL malevoli
            const entries = data.urls.slice(0, 50);

            const points = [];

            for (const entry of entries) {
                if (!entry.url) continue;

                // Estrai IP dal dominio
                const domain = entry.url.split("/")[2];
                if (!domain) continue;

                try {
                    const geo = await fetch(`https://ipapi.co/${domain}/json/`);
                    const geoData = await geo.json();

                    if (!geoData.latitude || !geoData.longitude) continue;

                    points.push({
                        lat: geoData.latitude,
                        lon: geoData.longitude,
                        intensity: 0.6
                    });

                } catch (e) {
                    console.warn("GeoIP fallito:", domain);
                }
            }

            return points;

        } catch (e) {
            console.error("Errore URLHaus:", e);
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
        const points = await fetchMalwareIPs();
        drawPoints(points);
    }

    updateHeatmap();
    setInterval(updateHeatmap, 15000);
}

startHeatmap();
