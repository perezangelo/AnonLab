/* ============================================================
   Tech Radar – Inline SVG Edition (Best for Google & Consoles)
   ============================================================ */

const CATEGORY_SVG = {
    "Languages & Frameworks": `
        <svg width="22" height="22" fill="#00eaff"><path d="M4 4h14v2H4zm0 6h14v2H4zm0 6h14v2H4z"/></svg>
    `,
    "Tools": `
        <svg width="22" height="22" fill="#00eaff"><path d="M10 2l2 2-6 6 2 2 6-6 2 2-8 8H2v-6z"/></svg>
    `,
    "Platforms": `
        <svg width="22" height="22" fill="#00eaff"><path d="M4 10a6 6 0 0112 0h2a8 8 0 10-16 0h2zm-2 2h16v2H2zm2 4h12v2H4z"/></svg>
    `,
    "Techniques": `
        <svg width="22" height="22" fill="#00eaff"><path d="M11 2l9 4v6c0 5-4 8-9 8S2 17 2 12V6l9-4z"/></svg>
    `
};

const ITEM_SVG = {
    "JavaScript": `<svg width="20" height="20" fill="#f7df1e"><rect width="20" height="20" rx="3"/></svg>`,
    "Python": `<svg width="20" height="20" fill="#3776ab"><circle cx="10" cy="10" r="9"/></svg>`,
    "Node.js": `<svg width="20" height="20" fill="#68a063"><polygon points="10,2 18,6 18,14 10,18 2,14 2,6"/></svg>`,
    "Docker": `<svg width="20" height="20" fill="#0db7ed"><rect width="20" height="12" y="4" rx="3"/></svg>`,
    "GitHub Actions": `<svg width="20" height="20" fill="#ffffff"><path d="M10 2a8 8 0 100 16 8 8 0 000-16z"/></svg>`,
    "Kubernetes": `<svg width="20" height="20" fill="#326ce5"><polygon points="10,2 17,7 14,18 6,18 3,7"/></svg>`,
    "CI/CD": `<svg width="20" height="20" fill="#00eaff"><path d="M4 10h12M10 4v12"/></svg>`,
    "Microservices": `<svg width="20" height="20" fill="#ff7b00"><circle cx="10" cy="10" r="3"/><circle cx="4" cy="4" r="3"/><circle cx="16" cy="4" r="3"/><circle cx="4" cy="16" r="3"/><circle cx="16" cy="16" r="3"/></svg>`
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

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
    grid.style.gap = "20px";
    grid.style.marginTop = "15px";

    Object.keys(categories).forEach(quadrant => {
        const card = document.createElement("div");

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

        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.gap = "12px";
        header.style.marginBottom = "14px";

        header.innerHTML = `
            ${CATEGORY_SVG[quadrant]}
            <h3 style="margin:0;color:#00eaff;font-size:18px;">${quadrant}</h3>
        `;

        card.appendChild(header);

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
                <div style="display:flex;align-items:center;gap:10px;">
                    ${ITEM_SVG[item.name] || ""}
                    <a href="${authoritativeLink}" target="_blank" rel="noopener noreferrer"
                       style="color:#fff;text-decoration:none;font-size:15px;">
                        ${item.name}
                    </a>
                </div>

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
