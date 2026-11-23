document.getElementById("reset-password-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const status = document.getElementById("reset-status");

    if (!token) {
        status.textContent = "Token mancante o non valido. Controlla il link ricevuto via email.";
        status.style.color = "#ff4d4d";
        return;
    }

    const pass1 = document.getElementById("new-password").value;
    const pass2 = document.getElementById("confirm-password").value;

    if (pass1 !== pass2) {
        status.textContent = "Le password non coincidono.";
        status.style.color = "#ff4d4d";
        return;
    }

    if (pass1.length < 8) {
        status.textContent = "La password deve contenere almeno 8 caratteri.";
        status.style.color = "#ff4d4d";
        return;
    }

    status.textContent = "Aggiornamento in corso...";
    status.style.color = "#7dfcff";

    try {
        const response = await fetch("https://angelonline.altervista.org/backend/conferma-reset.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: token,
                password: pass1
            })
        });

        const result = await response.json();

        if (result.success) {
            status.textContent = "Password aggiornata con successo! Reindirizzamento al login...";
            status.style.color = "#00ff88";
            setTimeout(() => {
                window.location.href = "/login.html";
            }, 2500);
        } else {
            status.textContent = result.message || "Errore durante il reset.";
            status.style.color = "#ff4d4d";
        }
    } catch (err) {
        status.textContent = "Errore di connessione con il server Altervista. Riprova più tardi.";
        status.style.color = "#ff4d4d";
    }
});
