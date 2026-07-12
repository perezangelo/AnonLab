/* ============================================================
   Tech Radar – Dynamic Renderer
   Versione ottimizzata per anonlab.it
   ============================================================ */

function renderTechRadar(data) {
    const radarBox = document.getElementById("radar");
    if (!radarBox) return;

    radarBox.innerHTML = ""; // pulizia contenuto precedente

    // Raggruppa gli items per quadrante
    const categories = {};

    data.items.forEach(item => {
        const quadrantName = data.quadrants[item.quadrant];
        if (!categories[quadrantName]) categories[quadrantName] = [];
        categories[quadrantName].push(item);
    });

    // Costruzione HTML per ogni categoria
    Object.keys(categories).forEach(quadrant => {
        const section = document.createElement("div");
        section.className = "radar-section";

        // Titolo categoria
        section.innerHTML = `
            <h3 class="radar-category">${quadrant}</h3>
        `;

        // Lista elementi della categoria
        categories[quadrant].forEach(item => {
            const ringName = data.rings[item.ring];

            section.innerHTML += `
                <div class="radar-item">
                    <strong>${item.name}</strong><br>
                    <span class="radar-meta">
                        Ring: ${ringName}
                    </span>
                </div>
            `;
        });

        radarBox.appendChild(section);
    });
}

/* ============================================================
   Stili minimi (opzionali, puoi metterli nel tuo CSS)
   ============================================================ */

/*
.radar-section {
    margin-bottom: 20px;
    padding: 10px 15px;
    background: #0d0d0d;
    border: 1px solid #222;
    border-radius: 6px;
}

.radar-category {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #ff7b00;
}

.radar-item {
    margin-bottom: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #222;
}

.radar-item:last-child {
    border-bottom: none;
}

.radar-meta {
    font-size: 13px;
    color: #999;
}
*/
