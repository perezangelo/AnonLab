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

    async function loadHeatmap() {
        try {
            const res = await fetch("/data/heatmap.json");
            const points = await res.json();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            points.forEach(p => {
                const x = (p.lon + 180) * (canvas.width / 360);
                const y = (90 - p.lat) * (canvas.height / 180);

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 60);
                gradient.addColorStop(0, `rgba(255,0,0,${p.intensity})`);
                gradient.addColorStop(1, "rgba(255,0,0,0)");

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, 60, 0, Math.PI * 2);
                ctx.fill();
            });

        } catch (e) {
            console.error("Errore Heatmap:", e);
        }
    }

    loadHeatmap();
    setInterval(loadHeatmap, 15000);
}

startHeatmap();
