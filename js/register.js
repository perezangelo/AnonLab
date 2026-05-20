document.getElementById("register-form").addEventListener("submit", async function (e) {

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    // HASH PASSWORD (SHA-256)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password_hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // INVIO A GITHUB (DATABASE)
    await fetch("https://api.github.com/repos/perezangelo/AnonLab/dispatches", {
        method: "POST",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer GITHUB_TOKEN_DA_INSERIRE"
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

    // Web3Forms prosegue normalmente
});
