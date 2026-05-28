// forms.js — gestione AJAX per info, faq, register

document.addEventListener("DOMContentLoaded", () => {
  initInfoForm();
  initFaqForm();
  initRegisterForm();
});

/* ============================
   UTILITÀ COMUNE
============================ */
function setStatus(el, message, isError = false) {
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? "#ff4d4d" : "#00ff88";
}

async function sendForm(url, formData) {
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  // Se il server risponde con JSON valido
  const data = await response.json();
  return data;
}

/* ============================
   FORM INFO
============================ */
function initInfoForm() {
  const form = document.getElementById("info-form");
  const statusEl = document.getElementById("info-status");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Botcheck
    const botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      setStatus(statusEl, "Rilevato traffico sospetto.", true);
      return;
    }

    setStatus(statusEl, "Invio in corso...", false);

    try {
      const formData = new FormData(form);
      const data = await sendForm(form.action, formData);

      if (data.status === "success") {
        setStatus(statusEl, data.message || "Richiesta inviata correttamente!");
        form.reset();
      } else {
        setStatus(statusEl, data.message || "Si è verificato un errore.", true);
      }
    } catch (err) {
      console.error("Errore invio INFO:", err);
      setStatus(statusEl, "Errore di comunicazione con il server.", true);
    }
  });
}

/* ============================
   FORM FAQ
============================ */
function initFaqForm() {
  const form = document.getElementById("faq-form");
  const statusEl = document.getElementById("faq-status");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      setStatus(statusEl, "Rilevato traffico sospetto.", true);
      return;
    }

    setStatus(statusEl, "Invio in corso...", false);

    try {
      const formData = new FormData(form);
      const data = await sendForm(form.action, formData);

      if (data.status === "success") {
        setStatus(statusEl, data.message || "Domanda inviata correttamente!");
        form.reset();
      } else {
        setStatus(statusEl, data.message || "Si è verificato un errore.", true);
      }
    } catch (err) {
      console.error("Errore invio FAQ:", err);
      setStatus(statusEl, "Errore di comunicazione con il server.", true);
    }
  });
}

/* ============================
   FORM REGISTRAZIONE
============================ */
function initRegisterForm() {
  const form = document.getElementById("register-form");
  const statusEl = document.getElementById("register-status");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const botcheck = form.querySelector('input[name="botcheck"]');
    if (botcheck && botcheck.checked) {
      setStatus(statusEl, "Rilevato traffico sospetto.", true);
      return;
    }

    setStatus(statusEl, "Registrazione in corso...", false);

    try {
      const formData = new FormData(form);
      const data = await sendForm(form.action, formData);

      if (data.status === "success") {
        setStatus(statusEl, data.message || "Registrazione completata!");
        form.reset();
      } else {
        setStatus(statusEl, data.message || "Si è verificato un errore.", true);
      }
    } catch (err) {
      console.error("Errore registrazione:", err);
      setStatus(statusEl, "Errore di comunicazione con il server.", true);
    }
  });
}
