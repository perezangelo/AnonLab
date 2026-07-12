/* ============================================================
   Tech Radar – Inline Styled Edition (No external CSS)
   ============================================================ */

const CATEGORY_ICONS = {
    "Languages & Frameworks": "/img/icons/code.png",
    "Tools": "/img/icons/tools.png",
    "Platforms": "/img/icons/cloud.png",
    "Techniques": "/img/icons/shield.png"
};

const RING_COLORS = {
    "Adopt": "#00ff7f",
    "Trial": "#ffcc00",
    "Assess": "#00bfff",
    "Hold": "#ff4444"
};

function renderTechRadar(data) {
    const radarBox = document.getElementById("radar");
    if (!radarBox) return;

    radarBox.innerHTML = "";

    const categories = {};

    data.items.forEach(item => {
        const quadrantName = data.quadrants[item.quadrant];
        if (!categories[quadrantName]) categories[quadrantName] = [];
        categories[quadrantName].push(item);
    });

    // GRID container (inline style)
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
    grid.style.gap = "20px";
    grid.style.marginTop = "15px";

    Object.keys(categories).forEach(quadrant => {
        const card = document.createElement("div");

        // CARD style inline
        card.style.background = "#111";
        card.style.border = "1px solid #222";
        card.style.borderRadius = "10px";
        card.style.padding = "18px";
        card.style.boxShadow = "0 0 12px rgba(0,255,255,0.08)";
        card.style.transition = "transform .2s ease, boxShadow .2s ease";

        card.onmouseenter = () => {
            card.style.transform = "translateY(-4px)";
            card.style.boxShadow = "0 0 18px rgba(0,255,255,0.15)";
        };
        card.onmouseleave = () => {
            card.style.transform = "translateY(0)";
            card.style.boxShadow = "0 0 12px rgba(0,255,255,0.08)";
        };

        const icon = CATEGORY_ICONS[quadrant] || "/img/icons/default.png";

        // HEADER
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.gap = "12px";
        header.style.marginBottom = "14px";

        header.innerHTML = `
            <img src="${icon}" style="width:26px;height:26px;">
            <h3 style="margin:0;color:#00eaff;font-size:18px;">${quadrant}</h3>
        `;

        card.appendChild(header);

        // ITEMS
        categories[quadrant].forEach(item => {
            const ringName = data.rings[item.ring];
            const ringColor = RING_COLORS[ringName] || "#999";
            const authoritativeLink = generateAuthoritativeLink(item.name);

            const itemRow = document.createElement("div");
            itemRow.style.display = "flex";
            itemRow.style.justifyContent = "space-between";
            itemRow.style.alignItems = "center";
            itemRow.style.padding = "6px 0";
            itemRow.style.borderBottom = "1px solid #222";

            itemRow.innerHTML = `
                <a href="${authoritativeLink}" target="_blank" rel="noopener noreferrer"
                   style="color:#fff;text-decoration:none;font-size:15px;">
                    ${item.name}
                </a>

                <span style="
                    padding:4px 10px;
                    border-radius:6px;
                    font-size:12px;
                    color:#000;
                    font-weight:bold;
                    background:${ringColor};
                ">
                    ${ringName}
                </span>
            `;

            card.appendChild(itemRow);
        });

        grid.appendChild(card);
    });

    radarBox.appendChild(grid);
}

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
