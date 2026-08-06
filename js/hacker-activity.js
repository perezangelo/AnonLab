/* ============================================================
   Hacker Activity Intelligence – Versione Dinamica
   Compatibile con backend AlterVista (HTML)
   ============================================================ */

const HACKER_API_URL =
    "https://angelonline.altervista.org/backend/hacker-activity.php";

/* --- Anti-cache AlterVista --- */
function fetchHackerActivity() {
    const url = HACKER_API_URL + "?ts=" + Date.now();

    return fetch(url, {
        method: "GET",
        headers: { "Accept": "text/html" }
    })
    .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
    });
}

function initHackerActivity() {
    const box = document.getElementById("hacker-activity");
    if (!box) return;

    function update() {
        fetchHackerActivity()
            .then(html => {
                box.innerHTML = html;
            })
            .catch(err => {
                box.innerHTML =
                    "<p style='color:#ff7b00;'>Errore caricamento dati CTI</p>";
                console.error("Hacker Activity error:", err);
            });
    }

    /* --- Primo caricamento --- */
    update();

    /* --- Auto-refresh ogni 30 secondi --- */
    setInterval(update, 30000);
}

/* --- Avvio widget --- */
document.addEventListener("DOMContentLoaded", initHackerActivity);
