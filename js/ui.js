// Carica un partial HTML e restituisce una Promise
function loadPartial(id, file) {
  return fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
}

document.addEventListener("DOMContentLoaded", async () => {

    // Caricamento ordinato dei partials
    await loadPartial("header", "/partials/header.html");
    await loadPartial("ticker", "/partials/ticker.html");
    await loadPartial("sidebar", "/partials/sidebar.html");
    await loadPartial("footer", "/partials/footer.html");

    // Ora gli elementi ESISTONO nel DOM
    if (typeof loadTicker === "function") loadTicker();
    if (typeof loadMeteo === "function") loadMeteo();
    if (typeof loadWorldFeed === "function") loadWorldFeed();
    if (typeof loadCVEToday === "function") loadCVEToday();
    if (typeof loadCyberAlerts === "function") loadCyberAlerts();
});
