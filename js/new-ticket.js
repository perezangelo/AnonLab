<form id="register-form" action="https://angelonline.altervista.org/send-ticket.php" method="POST">
  <!-- Web3Forms -->
  <input type="hidden" name="access_key" value="9d55bc37-731e-405c-b3c2-b24c3feffb8c">
  <input type="hidden" name="subject" value="Nuova Registrazione Utente - AnonLab">
  <input type="hidden" name="from_name" value="AnonLab">
  <input type="hidden" name="redirect" value="https://anonlab.it/grazie.html">

  <!-- Honeypot -->
  <input type="checkbox" name="botcheck" style="display:none;">

  <!-- Campi utente -->
  <input type="text" id="reg-username" name="Username" placeholder="Username" required>
  <input type="email" id="reg-email" name="Email" placeholder="Email" required>
  <input type="password" id="reg-password" name="Password" placeholder="Password" required>

  <button type="submit">Registrati</button>
</form>
