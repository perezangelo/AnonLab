async function loadTechRadar() {
    try {
        const res = await fetch("https://angelonline.altervista.org/api/tech-radar.php");
        const data = await res.json();

        const box = document.getElementById("tech-radar");
        if (!box) return;

        box.innerHTML = ""; // pulizia

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "radar-item";

            div.innerHTML = `
                <h3>${item.title}</h3>
                <p><strong>Categoria:</strong> ${item.category}</p>
                <p><strong>Fonte:</strong> ${item.source}</p>
                <a href="${item.url}" target="_blank">Documentazione</a>
            `;

            box.appendChild(div);
        });

    } catch (err) {
        console.error("Errore Tech Radar:", err);
    }
}

// avvio immediato
loadTechRadar();

// aggiornamento ogni 15 secondi
setInterval(loadTechRadar, 15000);
