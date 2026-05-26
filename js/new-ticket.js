// new-ticket.js
// Gestione AJAX per INFO, FAQ e REGISTRAZIONE

document.addEventListener("DOMContentLoaded", () => {

  // --- FUNZIONE GENERICA DI INVIO ---
  async function inviaForm(formId, statusId, endpoint) {
    const form = document.getElementById(formId);
    const status = document.getElementById(statusId);

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      status.textContent = "Invio in corso...";

      const formData = new FormData(form);

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData
        });

        const text = await response.text();
        status.textContent = text;

        if (text.includes("correttamente") || text.includes("Registrazione completata")) {
          form.reset();
        }

      } catch (error) {
        status.textContent = "Errore di connessione.";
      }
    });
  }

  // --- ATTIVA I FORM ---
  inviaForm("info-form", "info-status", "https://angelonline.altervista.org/send-info.php");
  inviaForm("faq-form", "faq-status", "https://angelonline.altervista.org/send-faq.php");
  inviaForm("register-form", "register-status", "https://angelonline.altervista.org/send-register.php");

});
