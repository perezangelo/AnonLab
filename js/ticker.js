function loadTicker() {
  // Carica le news dal JSON e popola il ticker
  fetch("/data/news.json")
    .then(res => res.json())
    .then(news => {
      const track = document.querySelector(".ticker-track");
      if (!track) return;

      // Genera i titoli (senza URL, usa solo title)
      const items = news
        .map(item => `<span class="ticker-item">${item.title}</span>`)
        .join("");

      // Inserisce gli elementi una sola volta
      track.innerHTML = items;

      // Duplica automaticamente per loop infinito fluido
      const clone = track.cloneNode(true);
      track.parentElement.appendChild(clone);
    })
    .catch(err => console.error("Errore nel caricamento delle news:", err));
}

// Avvia il ticker quando il DOM è pronto
document.addEventListener("DOMContentLoaded", loadTicker);
