async function loadTechRadar() {
    try {
        const res = await fetch("https://angelonline.altervista.org/api/tech-radar.php");
        const data = await res.json();

        const box = document.getElementById("tech-radar");
        if (!box) return;

        box.innerHTML = "";

        data.slice(0, 20).forEach(item => {
            const div = document.createElement("div");
            div.className = "radar-item";
            div.innerHTML = `
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            `;
            box.appendChild(div);
        });

    } catch (err) {
        console.error("Errore Tech Radar:", err);
    }
}

loadTechRadar();
setInterval(loadTechRadar, 15000);
