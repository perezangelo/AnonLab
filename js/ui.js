function loadPartial(id, file) {
  return fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    // Carica i partials IN ORDINE
    await loadPartial("header", "/partials/header.html");
    await loadPartial("ticker", "/partials/ticker.html");   // ticker prima!
    await loadPartial("sidebar", "/partials/sidebar.html");
    await loadPartial("footer", "/partials/footer.html");

    // Ora il ticker ESISTE nel DOM
    if (typeof loadTicker === "function") {
        loadTicker();
    }

    loadMeteo();
    loadWorldFeed();
    loadCVEToday();
    loadCyberAlerts();
});
