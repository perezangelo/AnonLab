document.getElementById("recover-password-form").addEventListener("submit", async function (e) {

    const email = document.getElementById("recover-password-email").value.trim();

    // INVIO A GITHUB (SENZA TOKEN)
    await fetch("https://api.github.com/repos/perezangelo/AnonLab/dispatches", {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            event_type: "recover_password",
            client_payload: {
                email
            }
        })
    });

    // Web3Forms prosegue normalmente
});
