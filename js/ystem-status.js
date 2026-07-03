async function initSystemStatus() {
    const serverEl = document.getElementById("status-server");
    const apiEl = document.getElementById("status-api");
    const newsEl = document.getElementById("status-news");

    if (!serverEl || !apiEl || !newsEl) return;

    try {
        const res = await fetch("/data/system-status.json?cache=" + Date.now());
        const status = await res.json();

        function setStatus(el, value) {
            el.textContent = value;

            if (value.toLowerCase() === "online" ||
                value.toLowerCase() === "operative" ||
                value.toLowerCase() === "attivo") {
                el.className = "ok";
            } else {
                el.className = "down";
            }
        }

        setStatus(serverEl, status.server);
        setStatus(apiEl, status.api);
        setStatus(newsEl, status.news);

    } catch (err) {
        serverEl.textContent = "Errore";
        apiEl.textContent = "Errore";
        newsEl.textContent = "Errore";

        serverEl.className = "down";
        apiEl.className = "down";
        newsEl.className = "down";

        console.error(err);
    }
}
