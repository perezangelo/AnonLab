<!-- FORM — REGISTRAZIONE UTENTE -->
<div class="sidebar-box" aria-label="Registrazione utente">
  <img src="/img/register.png" class="sidebar-icon" alt="Icona registrazione utente">
  <h3>Registrazione Utente</h3>

  <form id="register-form" action="https://angelonline.altervista.org/backend/register.php" method="POST">
    <input type="checkbox" name="botcheck" style="display:none;">

    <!-- ID CORRETTI PER register.js -->
    <input id="reg-username" type="text" name="username" placeholder="Username" required>
    <input id="reg-email" type="email" name="email" placeholder="Email" required>

    <button type="submit">Registrati</button>
  </form>

  <p id="register-status"></p>
</div>

<script>
document.getElementById("register-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const status = document.getElementById("register-status");

    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();

    if (!username || !email) {
        status.textContent = "Compila tutti i campi.";
        return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);

    try {
        const response = await fetch("https://angelonline.altervista.org/backend/register.php", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.status === "success") {
            window.location.href = "/grazie.html";
        } else {
            status.textContent = result.message;
        }

    } catch (error) {
        status.textContent = "Errore di connessione. Riprova.";
    }
});
</script>

<!-- FORM — LOGIN -->
<div class="sidebar-box" aria-label="Login utente">
  <img src="/img/Pc.png" class="sidebar-icon" alt="Icona login">
  <h3>Login</h3>

  <form action="https://angelonline.altervista.org/backend/login.php" method="POST">
    <input type="text" name="login" placeholder="Username o Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Accedi</button>
  </form>
</div>
