/* ============================================================
   SVG inline moderni
   ============================================================ */

function serverSVG() {
    return `
        <svg width="22" height="22" fill="#00eaff">
            <rect x="3" y="4" width="16" height="6" rx="2"/>
            <rect x="3" y="12" width="16" height="6" rx="2"/>
        </svg>
    `;
}

function apiSVG() {
    return `
        <svg width="22" height="22" fill="#00eaff">
            <circle cx="11" cy="11" r="9"/>
            <rect x="10" y="4" width="2" height="14"/>
            <rect x="4" y="10" width="14" height="2"/>
        </svg>
    `;
}

function newsSVG() {
    return `
        <svg width="22" height="22" fill="#00eaff">
            <rect x="3" y="4" width="16" height="14" rx="2"/>
            <rect x="6" y="7" width="10" height="2"/>
            <rect x="6" y="11" width="10" height="2"/>
        </svg>
    `;
}

/* ============================================================
   Colori dinamici real-time
   ============================================================ */

function getStatusColor(status) {
    status = status.toLowerCase();
    if (status === "online" || status === "operative" || status === "active") return "#00ff7f";
    if (status === "warning") return "#ffcc00";
    return "#ff4444"; // offline / error
}

/* ============================================================
   System Status – Real-Time Cyber Cards (AnonLab Edition)
   ============================================================ */

async function initSystemStatus() {
    const box = document.getElementById("system-status-grid");
    if (!box) return;

    async function loadStatus() {
        try {
            const res = await fetch("https://angelonline.altervista.org/data/system-status.json?ts=" + Date.now());
            const status = await res.json();

            const grid = document.createElement("div");
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
            grid.style.gap = "20px";
            grid.style.marginTop = "15px";

            const items = [
                { name: "Server", data: status.server, icon: serverSVG() },
                { name: "API", data: status.api, icon: apiSVG() },
                { name: "News Feed", data: status.newsFeed || { status: "offline" }, icon: newsSVG() }
            ];

            items.forEach(item => {
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

                const statusText = item.data.status || item.data;
                const color = getStatusColor(statusText);

                card.innerHTML = `
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        ${item.icon}
                        <h3 style="margin:0;color:#00eaff;font-size:18px;">${item.name}</h3>
                    </div>

                    <div style="color:#fff;font-size:0.95rem;margin-bottom:10px;">
                        Stato: ${statusText}
                    </div>

                    ${item.data.latency ? `
                        <div style="color:#ccc;font-size:0.85rem;margin-bottom:10px;">
                            Latency: ${item.data.latency}
                        </div>
                    ` : ""}

                    ${item.data.items ? `
                        <div style="color:#ccc;font-size:0.85rem;margin-bottom:10px;">
                            Items: ${item.data.items}
                        </div>
                    ` : ""}

                    <span style="
                        display:inline-block;
                        padding:4px 10px;
                        border-radius:6px;
                        font-size:12px;
                        color:#000;
                        font-weight:bold;
                        background:${color};
                    ">
                        ${statusText.toUpperCase()}
                    </span>
                `;

                grid.appendChild(card);
            });

            box.innerHTML = "";
            box.appendChild(grid);

        } catch (err) {
            box.innerHTML = "<p style='color:#ff7b00;'>Errore caricamento System Status</p>";
            console.error(err);
        }
    }

    loadStatus();
    setInterval(loadStatus, 10000); // aggiornamento ogni 10 secondi
}
