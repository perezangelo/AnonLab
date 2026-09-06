function startRansomTracker() {
    const container = document.getElementById("ransom-tracker-container");
    const box = document.getElementById("ransom-tracker");

    if (!box) return setTimeout(startRansomTracker, 200);

    container.style.maxHeight = "300px";
    container.style.overflowY = "auto";
    container.style.paddingRight = "6px";

    async function loadRansom() {
        try {
            const res = await fetch("https://angelonline.altervista.org/newsops/ransomindex.php?t=" + Date.now());
            const data = await res.json();

            box.innerHTML = "";

            data.forEach(item => {
                const [group, desc, status, date, leak, icon] = item;

                const shortDesc = desc.length > 70 ? desc.substring(0, 70) + "..." : desc;

                const badgeColor =
                    status.toLowerCase() === "active" ? "#ff0033" :
                    status.toLowerCase() === "inactive" ? "#555" :
                    "#0066ff";

                const iconHTML = icon
                    ? `<img src="${icon}" style="width:24px;height:24px;margin-right:6px;border-radius:4px;">`
                    : `<div style="width:24px;height:24px;background:#333;margin-right:6px;border-radius:4px;"></div>`;

                const leakHTML = leak
                    ? `<a href="${leak}" target="_blank" style="color:#0ff;font-size:12px;">Leak Site</a>`
                    : `<span style="color:#555;font-size:12px;">No Leak Site</span>`;

                box.innerHTML += `
                    <div style="
                        background:#111;
                        border:1px solid #333;
                        padding:10px;
                        margin-bottom:10px;
                        border-radius:6px;
                        font-size:14px;
                        cursor:pointer;
                    " onclick="showRansomPopup('${group}', '${desc.replace(/'/g, "\\'")}', '${status}', '${date}', '${leak}', '${icon}')">

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
                                ${group}
                            </div>
                        </div>

                        <div>${shortDesc}</div>

                        <div style="margin-top:6px;font-size:11px;color:#888;">
                            Status: ${status} — Added: ${date}
                        </div>

                        <div style="margin-top:4px;">
                            ${leakHTML}
                        </div>
                    </div>
                `;
            });

        } catch (e) {
            console.error("Errore Ransomware Tracker:", e);
            box.innerHTML = "<div style='color:#888;'>Impossibile caricare i gruppi ransomware</div>";
        }
    }

    loadRansom();
}

startRansomTracker();

// POPUP DETTAGLI
function showRansomPopup(group, desc, status, date, leak, icon) {
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
        width:300px;
        z-index:9999;
        font-family:monospace;
    `;

    popup.innerHTML = `
        <div style="font-size:18px;margin-bottom:10px;">${group}</div>

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

        <button onclick="this.parentNode.remove()" style="
            background:#0ff;
            color:#000;
            border:none;
            padding:6px 10px;
            cursor:pointer;
            border-radius:4px;
        ">Close</button>
    `;

    document.body.appendChild(popup);
}
