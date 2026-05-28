document.getElementById("reset-password-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const status = document.getElementById("reset-status");

    if (!token) {
        status.textContent = "Token mancante o non valido.";
        return;
    }

    const pass1 = document.getElementById("new-password").value;
    const pass2 = document.getElementById("confirm-password").value;

    if (pass1 !== pass2) {
        status.textContent = "Le password non coincidono.";
        return;
    }

    // HASH PASSWORD (SHA-256)
    const encoder = new TextEncoder();
    const data = encoder.encode(pass1);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password_hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // INVIO A GITHUB (SENZA TOKEN)
    await fetch("https://api.github.com/repos/perezangelo/AnonLab/dispatches", {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            event_type: "reset_password",
            client_payload: {
                token,
                password_hash
            }
        })
    });

    status.textContent = "Password aggiornata. Puoi chiudere questa pagina.";
});
