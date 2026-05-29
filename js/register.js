// register.js — versione corretta e sicura

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("register-form");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        const nome = document.getElementById("reg-nome")?.value.trim();
        const username = document.getElementById("reg-username")?.value.trim();
        const email = document.getElementById("reg-email")?.value.trim();

        // Se mancano campi → blocca il submit
        if (!nome || !username || !email) {
            const status = document.getElementById("register-status");
            if (status) status.textContent = "Compila tutti i campi.";
            e.preventDefault();
            return;
        }

        // Disabilita il pulsante per evitare doppi invii
        const button = form.querySelector("button");
        if (button) button.disabled = true;

        // NON usare preventDefault
        // NON usare form.submit()
        // Lascia che il browser invii il form normalmente
    });
});
