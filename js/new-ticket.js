// new-ticket.js
// Gestione AJAX per INFO, FAQ e REGISTRAZIONE

document.addEventListener("DOMContentLoaded", () => {

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

        const json = await response.json();

        status.textContent = json.message;

        if (json.status === "success") {
          form.reset();
        }

      } catch (error) {
        status.textContent = "Errore di connessione.";
      }
    });
  }

  inviaForm("info-form", "info-status", "https://angelonline.altervista.org/send-info.php");
  inviaForm("faq-form", "faq-status", "https://angelonline.altervista.org/send-faq.php");
  inviaForm("register-form", "register-status", "https://angelonline.altervista.org/send-register.php");

});
