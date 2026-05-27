// new-ticket.js
// Gestione AJAX per INFO, FAQ e REGISTRAZIONE

document.addEventListener("DOMContentLoaded", () => {

  async function inviaForm(formId, statusId, endpoint) {
    const form = document.getElementById(formId);
    const status = document.getElementById(statusId);

    // Se il form non esiste, esci
    if (!form || !status) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      status.textContent = "Invio in corso...";

      const formData = new FormData(form);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData
        });

        // Tenta di leggere JSON
        const json = await response.json();

        // Mostra il messaggio restituito dal PHP
        status.textContent = json.message;

        // Reset del form se tutto ok
        if (json.status === "success") {
          form.reset();
        }

      } catch (error) {
        status.textContent = "Errore di connessione.";
      }
    });
  }

  // Attivazione AJAX per i 3 form
  inviaForm("info-form", "info-status", "https://angelonline.altervista.org/backend/send-info.php");
  inviaForm("faq-form", "faq-status", "https://angelonline.altervista.org/backend/send-faq.php");
  inviaForm("register-form", "register-status", "https://angelonline.altervista.org/backend/send-register.php");

});
