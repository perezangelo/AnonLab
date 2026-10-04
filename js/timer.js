document.addEventListener("DOMContentLoaded", () => {

    const timer = document.getElementById("session-timer");
    if (!timer) return;

    const startTime = Date.now();

    function updateTimer() {

        const elapsed = Math.floor((Date.now() - startTime) / 1000);

        const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
        const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
        const s = String(elapsed % 60).padStart(2, "0");

        timer.textContent =
    "█ ONLINE SESSION █ ${hours}:${minutes}:${seconds}";
    }

    updateTimer();
    setInterval(updateTimer, 1000);

});
