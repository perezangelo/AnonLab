/* ============================================================
   Tech Radar – Dynamic Renderer (AnonLab PRO Edition)
   ============================================================ */

const CATEGORY_ICONS = {
    "Languages & Frameworks": "/img/icons/code.png",
    "Tools": "/img/icons/tools.png",
    "Platforms": "/img/icons/cloud.png",
    "Techniques": "/img/icons/shield.png"
};

const RING_COLORS = {
    "Adopt": "#4caf50",
    "Trial": "#ff9800",
    "Assess": "#03a9f4",
    "Hold": "#f44336"
};

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

    // Contenitore a colonne
    const grid = document.createElement("div");
    grid.className = "radar-grid";

    // Costruzione schede affiancate
    Object.keys(categories).forEach(quadrant => {
        const card = document.createElement("div");
        card.className = "radar-card";

        const icon = CATEGORY_ICONS[quadrant] || "/img/icons/default.png";

        // Titolo scheda
        card.innerHTML = `
            <div class="radar-card-header">
                <img src="${icon}" class="radar-icon" alt="${quadrant}">
                <h3>${quadrant}</h3>
            </div>
        `;

        // Lista elementi
        categories[quadrant].forEach(item => {
            const ringName = data.rings[item.ring];
            const ringColor = RING_COLORS[ringName] || "#999";

            const authoritativeLink = generateAuthoritativeLink(item.name);

            card.innerHTML += `
                <div class="radar-item">
                    <a href="${authoritativeLink}" target="_blank" rel="noopener noreferrer">
                        <strong>${item.name}</strong>
                    </a>

                    <span class="radar-badge" style="background:${ringColor};">
                        ${ringName}
                    </span>
                </div>
            `;
        });

        grid.appendChild(card);
    });

    radarBox.appendChild(grid);
}

/* ============================================================
   Generatore link autorevoli
   ============================================================ */

function generateAuthoritativeLink(name) {
    const lower = name.toLowerCase();

    if (lower === "javascript") return "https://developer.mozilla.org/en-US/docs/Web/JavaScript";
    if (lower === "python") return "https://www.python.org/";
    if (lower === "node.js") return "https://nodejs.org/en/docs/";
    if (lower === "docker") return "https://docs.docker.com/";
    if (lower === "kubernetes") return "https://kubernetes.io/docs/";
    if (lower === "ci/cd") return "https://about.gitlab.com/topics/ci-cd/";
    if (lower === "microservices") return "https://microservices.io/";

    return `https://www.google.com/search?q=${encodeURIComponent(name + " official documentation")}`;
}

/* ============================================================
   CSS consigliato (incollalo nel tuo file CSS)
   ============================================================ */

/*
.radar-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin-top: 15px;
}

.radar-card {
    background: #0d0d0d;
    border: 1px solid #222;
    border-radius: 8px;
    padding: 15px;
}

.radar-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
}

.radar-card-header h3 {
    margin: 0;
    color: #ff7b00;
}

.radar-icon {
    width: 24px;
    height: 24px;
}

.radar-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid #222;
}

.radar-item:last-child {
    border-bottom: none;
}

.radar-item a {
    color: #fff;
    text-decoration: none;
}

.radar-item a:hover {
    color: #ff7b00;
}

.radar-badge {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
}
*/
