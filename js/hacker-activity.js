/* ============================================================
   Hacker Activity Intelligence – Versione Dinamica
   Compatibile con backend AlterVista (HTML)
   ============================================================ */

const HACKER_API_URL =
    "https://angelonline.altervista.org/backend/hacker-activity.php";

/* --- Anti-cache AlterVista con timeout sicuro --- */
async function fetchHackerActivity() {
    const url = HACKER_API_URL + "?ts=" + Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const r = await fetch(url, {
            method: "GET",
            headers: { "Accept": "text/html" },
            signal: controller.signal
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
        return await r.text();
    } finally {
        clearTimeout(timeoutId);
    }
}

function initHackerActivity() {
    const box = document.getElementById("hacker-activity");
    if (!box) return;

    let started = false;

    function update() {
        if (document.hidden) return;
        fetchHackerActivity()
            .then(html => {
                box.innerHTML = html;
            })
            .catch(() => {
                if (!box.innerHTML.trim()) {
                    box.innerHTML =
                        "<p style='color:#ff7b00;'>Dati CTI temporaneamente non disponibili</p>";
                }
            });
    }

    function startWidget() {
        if (started) return;
        started = true;
        update();
        setInterval(update, 30000);
    }

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            if (entries.some(e => e.isIntersecting)) {
                obs.disconnect();
                startWidget();
            }
        }, { rootMargin: "500px" });
        observer.observe(box);
    } else {
        startWidget();
    }
}

/* --- Avvio widget --- */
document.addEventListener("DOMContentLoaded", initHackerActivity);
