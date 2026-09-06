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
            console.log("RansomTracker: fetch", url);

            const res = await fetch(url);

            if (!res.ok) {
                throw new Error("HTTP " + res.status);
            }

            const data = await res.json();
            console.log("RansomTracker: data", data);

            if (!Array.isArray(data)) {
                throw new Error("Formato JSON non valido");
            }

            box.innerHTML = "";

            data.forEach(item => {
                const [group, desc, status, date, leak, icon] = item;

                const safeGroup = group || "";
                const safeDesc = desc || "";
                const safeStatus = status || "";
                const safeDate = date || "";
                const safeLeak = leak || "";
                const safeIcon = icon || "";

                const shortDesc = safeDesc.length > 70 ? safeDesc.substring(0, 70) + "..." : safeDesc;

                const badgeColor =
                    safeStatus.toLowerCase() === "active" ? "#ff0033" :
                    safeStatus.toLowerCase() === "inactive" ? "#555" :
                    "#0066ff";

                const iconHTML = safeIcon
                    ? `<img src="${safeIcon}" style="width:24px;height:24px;margin-right:6px;border-radius:4px;">`
                    : `<div style="width:24px;height:24px;background:#333;margin-right:6px;border-radius:4px;"></div>`;

                const leakHTML = safeLeak
                    ? `<a href="${safeLeak}" target="_blank" style="color:#0ff;font-size:12px;">Leak Site</a>`
                    : `<span style="color:#555;font-size:12px;">No Leak Site</span>`;

                const itemDiv = document.createElement("div");
                itemDiv.className = "ransom-item";
                itemDiv.style = `
                    background:#111;
                    border:1px solid #333;
                    padding:10px;
                    margin-bottom:10px;
                    border-radius:6px;
                    font-size:14px;
                    cursor:pointer;
                `;

                itemDiv.dataset.group = safeGroup;
                itemDiv.dataset.desc = safeDesc;
                itemDiv.dataset.status = safeStatus;
                itemDiv.dataset.date = safeDate;
                itemDiv.dataset.leak = safeLeak;
                itemDiv.dataset.icon = safeIcon;

                itemDiv.onclick = () => showRansomPopup(itemDiv.dataset);

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
                            ${safeGroup}
                        </div>
                    </div>

                    <div>${shortDesc}</div>

                    <div style="margin-top:6px;font-size:11px;color:#888;">
                        Status: ${safeStatus} — Added: ${safeDate}
                    </div>

                    <div style="margin-top:4px;">
                        ${leakHTML}
                    </div>
                `;

                box.appendChild(itemDiv);
            });

            if (!box.innerHTML.trim()) {
                box.innerHTML = "<div style='color:#888;'>Nessun gruppo ransomware disponibile</div>";
            }

        } catch (e) {
            console.error("Errore Ransomware Tracker:", e);
            box.innerHTML = "<div style='color:#888;'>Impossibile caricare i gruppi ransomware</div>";
        }
    }

    loadRansom();
}

startRansomTracker();

function showRansomPopup(data) {
    const popup = document.createElement("div");
    popup.style = `
        position:fixed;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%);
        background:#000;
        border:1px solid #0ff;
        padding:20px;
        border-radius:10px;
        color:#0ff;
        width:320px;
        z-index:9999;
        font-family:monospace;
    `;

    const group = data.group || "";
    const desc = data.desc || "";
    const status = data.status || "";
    const date = data.date || "";
    const leak = data.leak || "";
    const icon = data.icon || "";

    const iconBlock = icon
        ? `<img src="${icon}" style="width:32px;height:32px;margin-bottom:10px;border-radius:4px;">`
        : "";

    popup.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:flex-start;">
            <div style="font-size:18px;margin-bottom:10px;">${group}</div>

            ${iconBlock}

            <div style="font-size:12px;color:#ccc;margin-bottom:10px;">
                ${desc}
            </div>

            <div style="font-size:12px;margin-bottom:10px;">
                Status: ${status}<br>
                Added: ${date}
            </div>

            <div style="margin-bottom:10px;">
                ${leak ? `<a href="${leak}" target="_blank" style="color:#0ff;">Leak Site</a>` : "No Leak Site"}
            </div>

            <button style="
                background:#0ff;
                color:#000;
                border:none;
                padding:6px 10px;
                cursor:pointer;
                border-radius:4px;
                align-self:flex-end;
            ">Close</button>
        </div>
    `;

    const btn = popup.querySelector("button");
    btn.onclick = () => popup.remove();

    document.body.appendChild(popup);
}

