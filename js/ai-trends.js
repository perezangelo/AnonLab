/* ============================================================
   AI Trends – Inline SVG Cyber Cards (AnonLab Edition)
   ============================================================ */

async function initAITrends() {
    const box = document.getElementById("ai-trends");
    if (!box) return;

    try {
        const res = await fetch("/data/ai-trends.json?cache=" + Date.now());
        const items = await res.json();

        // GRID container
        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(260px, 1fr))";
        grid.style.gap = "20px";
        grid.style.marginTop = "15px";

        items.forEach(text => {
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

            // SVG ICON (inline, moderno, Google-friendly)
            const icon = `
                <svg width="22" height="22" fill="#00eaff">
                    <circle cx="11" cy="11" r="9"/>
                </svg>
            `;

            // CARD CONTENT
            card.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                    ${icon}
                    <h3 style="margin:0;color:#00eaff;font-size:18px;">
                        AI Trend
                    </h3>
                </div>

                <div style="color:#fff;font-size:0.95rem;margin-bottom:10px;">
                    ${text}
                </div>

                <span style="
                    display:inline-block;
                    padding:4px 10px;
                    border-radius:6px;
                    font-size:12px;
                    color:#000;
                    font-weight:bold;
                    background:#00eaff;
                ">
                    Trend 2026
                </span>
            `;

            grid.appendChild(card);
        });

        box.innerHTML = "";
        box.appendChild(grid);

    } catch (err) {
        box.innerHTML = "<p style='color:#ff7b00;'>Errore caricamento AI Trends</p>";
        console.error(err);
    }
}
