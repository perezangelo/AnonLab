function initHackerActivity() {
    const box = document.getElementById("hacker-activity");
    if (!box) return;

    fetch("https://angelonline.altervista.org/backend/hacker-activity.php?ts=" + Date.now())
        .then(response => response.text())
        .then(html => {
            box.innerHTML = html;
        })
        .catch(err => {
            box.innerHTML = "<p style='color:#ff7b00;'>Errore caricamento dati CTI</p>";
            console.error("CTI error:", err);
        });
}

