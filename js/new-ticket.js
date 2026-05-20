document.getElementById("info-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const status = document.getElementById("info-status");

    const name = document.getElementById("info-name").value.trim();
    const email = document.getElementById("info-email").value.trim();
    const message = document.getElementById("info-message").value.trim();

    if (!name || !email || !message) {
        status.textContent = "Compila tutti i campi.";
        return;
    }

    // INVIO A GITHUB ACTIONS
    const response = await fetch("https://api.github.com/repos/perezangelo/AnonLab/dispatches", {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            event_type: "new_ticket",
            client_payload: {
                type: "info",
                name,
                email,
                message
            }
        })
    });

    if (response.ok) {
        status.textContent = "Richiesta inviata correttamente.";
    } else {
        status.textContent = "Errore durante l'invio.";
    }
});
