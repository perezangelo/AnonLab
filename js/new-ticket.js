document.addEventListener("DOMContentLoaded", () => {

    // FORM INFO
    const infoForm = document.getElementById("info-form");
    if (infoForm) {
        infoForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            await sendTicket("info", "info-name", "info-email", "info-message", "info-status");
        });
    }

    // FORM FAQ
    const faqForm = document.getElementById("faq-form");
    if (faqForm) {
        faqForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            await sendTicket("faq", null, "faq-email", "faq-question", "faq-status");
        });
    }

});

// FUNZIONE GENERICA PER INVIARE TICKET
async function sendTicket(type, nameField, emailField, messageField, statusField) {

    const status = document.getElementById(statusField);

    const name = nameField ? document.getElementById(nameField).value.trim() : "";
    const email = document.getElementById(emailField).value.trim();
    const message = document.getElementById(messageField).value.trim();

    if (!email || !message) {
        status.textContent = "Compila tutti i campi.";
        return;
    }

    const response = await fetch("https://api.github.com/repos/perezangelo/AnonLab/dispatches", {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            event_type: "new_ticket",
            client_payload: {
                type,
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
}
