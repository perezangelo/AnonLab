/* ============================================================
   Tech Radar – Dynamic Renderer (AnonLab Enhanced Edition)
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

    // Costruzione HTML per ogni categoria
    Object.keys(categories).forEach(quadrant => {
        const section = document.createElement("div");
        section.className = "radar-section";

        const icon = CATEGORY_ICONS[quadrant] || "/img/icons/default.png";

        // Titolo categoria con icona
        section.innerHTML = `
            <h3 class="radar-category">
                <img src="${icon}" class="radar-icon" alt="${quadrant}">
                ${quadrant}
            </h3>
        `;

        // Lista elementi della categoria
        categories[quadrant].forEach(item => {
            const ringName = data.rings[item.ring];
            const ringColor = RING_COLORS[ringName] || "#999";

            // Link autorevoli (default: ricerca MDN / Docs)
            const authoritativeLink = generateAuthoritativeLink(item.name);

            section.innerHTML += `
                <div class="radar-item">
                    <strong>
                        <a href="${authoritativeLink}" target="_blank" rel="noopener noreferrer">
                            ${item.name}
                        </a>
                    </strong>
                    <br>

                    <span class="radar-badge" style="background:${ringColor};">
                        ${ringName}
                    </span>
                </div>
            `;
        });

        radarBox.appendChild(section);
    });
}

/* ============================================================
   Generatore link autorevoli (MDN, Docs, Official)
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

    // fallback: ricerca Google Docs
    return `https://www.google.com/search?q=${encodeURIComponent(name + " official documentation")}`;
}

/* ============================================================
   CSS consigliato (incollalo nel tuo file CSS)
   ============================================================ */

/*
.radar-section {
    margin-bottom: 20px;
    padding: 15px;
    background: #0d0d0d;
    border: 1px solid #222;
    border-radius: 6px;
}

.radar-category {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #ff7b00;
    display: flex;
    align-items: center;
    gap: 10px;
}

.radar-icon {
    width: 22px;
    height: 22px;
}

.radar-item {
    margin-bottom: 12px;
    padding: 8px 0;
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
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    margin-top: 4px;
}
*/
