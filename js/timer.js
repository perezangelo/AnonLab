/*
 * AnonLab - Footer Session Timer
 * Mostra il tempo trascorso dall'apertura della sessione.
 */

document.addEventListener("DOMContentLoaded", () => {
    const timerElement = document.getElementById("session-timer");

    if (!timerElement) {
        return;
    }

    const startTime = Date.now();

    function updateTimer() {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

        const hours = String(
            Math.floor(elapsedSeconds / 3600)
        ).padStart(2, "0");

        const minutes = String(
            Math.floor((elapsedSeconds % 3600) / 60)
        ).padStart(2, "0");

        const seconds = String(
            elapsedSeconds % 60
        ).padStart(2, "0");

        timerElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateTimer();

    setInterval(updateTimer, 1000);
});
