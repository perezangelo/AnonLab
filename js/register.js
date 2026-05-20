document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const status = document.getElementById("register-status");

    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;

    if (!username || !email || !password) {
        status.textContent = "Compila tutti i campi.";
        return;
    }

    // HASH PASSWORD (SHA-256)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password_hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // INVIO A GITHUB ACTIONS (salvataggio utente)
    await fetch("https://api.github.com/repos/perezangelo/AnonLab/dispatches", {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            event_type: "register_user",
            client_payload: {
                username,
                email,
                password_hash
            }
        })
    });

    // INVIA EMAIL (Web3Forms)
    this.submit();
});
