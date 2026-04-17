function loadPartial(id, file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadPartial("header", "/partials/header.html");
    loadPartial("ticker", "/partials/ticker.html");
    loadPartial("sidebar", "/partials/sidebar.html");
    loadPartial("footer", "/partials/footer.html");

    loadTicker();
    loadMeteo();
    loadWorldFeed();
    loadCVEToday();
    loadCyberAlerts();
});

