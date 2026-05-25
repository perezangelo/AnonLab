document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const status = document.getElementById("register-status");

    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();

    if (!username || !email) {
        status.textContent = "Compila tutti i campi.";
        return;
    }

    // Prepara i dati da inviare al backend PHP
    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);

    try {
        const response = await fetch("/backend/register.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.status === "success") {
            // 🔥 REDIRECT ALLA PAGINA DI RINGRAZIAMENTO
            window.location.href = "/grazie.html";
        } else {
            status.textContent = result.message;
        }

    } catch (error) {
        status.textContent = "Errore di connessione. Riprova.";
    }
});
