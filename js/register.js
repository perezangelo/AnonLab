// register.js — versione finale e corretta

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("register-form");

    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Controllo campi
        const nome = document.getElementById("reg-nome")?.value.trim();
        const username = document.getElementById("reg-username")?.value.trim();
        const email = document.getElementById("reg-email")?.value.trim();

        if (!nome || !username || !email) {
            const status = document.getElementById("register-status");
            if (status) status.textContent = "Compila tutti i campi.";
            return;
        }

        // Invio normale del form → il backend gestisce tutto
        form.submit();
    });
});
