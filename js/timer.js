(() => {
    function initTimer() {
        const timer = document.getElementById('session-timer');

        if (!timer) return;

        const startTime = Date.now();

        function update() {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);

            const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
            const seconds = String(elapsed % 60).padStart(2, '0');

            timer.textContent = `${hours}:${minutes}:${seconds}`;
        }

        update();
        setInterval(update, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTimer);
    } else {
        initTimer();
    }
})();
