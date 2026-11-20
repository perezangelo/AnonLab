(() => {
    if (window.__ransomTrackerLoaded) return;
    window.__ransomTrackerLoaded = true;

    function escRansomHtml(str) {
        return String(str ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function safeHttpUrl(url) {
        const val = String(url ?? "").trim();
        return /^https?:\/\//i.test(val) ? val : "";
    }

    function showRansomPopup(data) {
        document.querySelectorAll(".ransom-popup-overlay").forEach(el => el.remove());

        const overlay = document.createElement("div");
        overlay.className = "ransom-popup-overlay";
        overlay.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.65);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:9999;
            padding:16px;
        `;

        const popup = document.createElement("div");
        popup.style.cssText = `
            background:#000;
            border:1px solid #0ff;
            box-shadow:0 0 18px rgba(0,255,255,0.35);
            padding:20px;
            border-radius:10px;
            color:#0ff;
            width:100%;
            max-width:340px;
            font-family:monospace;
        `;

        const group  = String(data.group || "Unknown");
        const desc   = String(data.desc || "Nessuna descrizione disponibile nel feed.");
        const status = String(data.status || "Unknown");
        const date   = String(data.date || "N/D");
        const leak   = safeHttpUrl(data.leak);
        const icon   = safeHttpUrl(data.icon);

        const iconBlock = icon
            ? `<img src="${escRansomHtml(icon)}"
                    alt="${escRansomHtml(group || "Icona gruppo ransomware")}"
                    onerror="this.style.display='none'"
                    style="width:32px;height:32px;margin-bottom:10px;border-radius:4px;object-fit:contain;background:rgba(255,255,255,0.08);">`
            : "";

        popup.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:flex-start;">
                <div style="font-size:18px;margin-bottom:10px;font-weight:bold;">${escRansomHtml(group)}</div>

                ${iconBlock}

                <div style="font-size:12px;color:#ccc;margin-bottom:12px;line-height:1.5;max-height:180px;overflow-y:auto;">
                    ${escRansomHtml(desc)}
                </div>

                <div style="font-size:12px;margin-bottom:10px;">
                    Status: ${escRansomHtml(status)}<br>
                    Added: ${escRansomHtml(date)}
                </div>

                <div style="margin-bottom:12px;">
                    ${leak
                        ? `<a href="${escRansomHtml(leak)}" target="_blank" rel="noopener noreferrer" style="color:#0ff;">Leak Site</a>`
                        : `<span style="color:#666;">No Leak Site</span>`}
                </div>

                <button type="button" style="
                    background:#0ff;
                    color:#000;
                    border:none;
                    padding:6px 12px;
                    cursor:pointer;
                    border-radius:4px;
                    font-weight:bold;
                    align-self:flex-end;
                ">Close</button>
            </div>
        `;

        const onKeyDown = (e) => {
            if (e.key === "Escape") closePopup();
        };

        const closePopup = () => {
            document.removeEventListener("keydown", onKeyDown);
            overlay.remove();
        };

        popup.querySelector("button").addEventListener("click", closePopup);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closePopup();
        });
        document.addEventListener("keydown", onKeyDown);

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
    }

    function startRansomTracker() {
        const container = document.getElementById("ransom-tracker-container");
        const box = document.getElementById("ransom-tracker");

        if (!box || !container) {
            return setTimeout(startRansomTracker, 200);
        }

        container.style.maxHeight = "300px";
        container.style.overflowY = "auto";
        container.style.paddingRight = "6px";

        async function loadRansom() {
            try {
                const url = "https://angelonline.altervista.org/newsops/ransomindex.php?t=" + Date.now();
                const res = await fetch(url, { cache: "no-store" });

                if (!res.ok) {
                    throw new Error("HTTP " + res.status);
                }

                const data = await res.json();
                if (!Array.isArray(data)) {
                    throw new Error("Formato JSON non valido");
                }

                box.innerHTML = "";

                data.forEach(item => {
                    if (!Array.isArray(item)) return;
                    const [group, desc, status, date, leak, icon] = item;

                    const safeGroup  = String(group || "Unknown");
                    const safeDesc   = String(desc || "Nessuna descrizione disponibile nel feed.");
                    const safeStatus = String(status || "Unknown");
                    const safeDate   = String(date || "N/D");
                    const safeLeak   = safeHttpUrl(leak);
                    const safeIcon   = safeHttpUrl(icon);

                    const shortDesc = safeDesc.length > 90 ? safeDesc.substring(0, 90) + "..." : safeDesc;

                    const badgeColor =
                        safeStatus.toLowerCase() === "active"   ? "#ff0033" :
                        safeStatus.toLowerCase() === "inactive" ? "#555"    :
                        "#0066ff";

                    const iconHTML = safeIcon
                        ? `<img src="${escRansomHtml(safeIcon)}"
                                alt="${escRansomHtml(safeGroup || "Icona gruppo ransomware")}"
                                onerror="this.style.display='none'"
                                style="width:24px;height:24px;margin-right:6px;border-radius:4px;object-fit:contain;background:rgba(255,255,255,0.08);">`
                        : "";

                    const leakHTML = safeLeak
                        ? `<a href="${escRansomHtml(safeLeak)}" target="_blank" rel="noopener noreferrer" style="color:#0ff;font-size:12px;">Leak Site</a>`
                        : `<span style="color:#555;font-size:12px;">No Leak Site</span>`;

                    const itemDiv = document.createElement("div");
                    itemDiv.className = "ransom-item";
                    itemDiv.style.cssText = `
                        background:#111;
                        border:1px solid #333;
                        padding:10px;
                        margin-bottom:10px;
                        border-radius:6px;
                        font-size:14px;
                        cursor:pointer;
                    `;

                    itemDiv.dataset.group  = safeGroup;
                    itemDiv.dataset.desc   = safeDesc;
                    itemDiv.dataset.status = safeStatus;
                    itemDiv.dataset.date   = safeDate;
                    itemDiv.dataset.leak   = safeLeak;
                    itemDiv.dataset.icon   = safeIcon;

                    itemDiv.addEventListener("click", (e) => {
                        if (e.target.closest("a")) return;
                        showRansomPopup(itemDiv.dataset);
                    });

                    itemDiv.innerHTML = `
                        <div style="display:flex;align-items:center;margin-bottom:6px;">
                            ${iconHTML}
                            <div style="
                                background:${badgeColor};
                                color:#fff;
                                padding:2px 6px;
                                border-radius:4px;
                                font-size:12px;
                                width:max-content;
                            ">
                                ${escRansomHtml(safeGroup)}
                            </div>
                        </div>

                        <div style="color:#e0e0e0;">${escRansomHtml(shortDesc)}</div>

                        <div style="margin-top:6px;font-size:11px;color:#888;">
                            Status: ${escRansomHtml(safeStatus)} — Added: ${escRansomHtml(safeDate)}
                        </div>

                        <div style="margin-top:4px;">
                            ${leakHTML}
                        </div>
                    `;

                    box.appendChild(itemDiv);
                });

                if (!box.children.length) {
                    box.innerHTML = "<div style='color:#888;'>Nessun gruppo ransomware disponibile</div>";
                }
            } catch (e) {
                console.error("Errore Ransomware Tracker:", e);
                box.innerHTML = "<div style='color:#888;'>Impossibile caricare i gruppi ransomware</div>";
            }
        }

        loadRansom();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startRansomTracker);
    } else {
        startRansomTracker();
    }
})();
