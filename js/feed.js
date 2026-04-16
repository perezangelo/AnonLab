fetch("/data/feed.json")
  .then(res => res.json())
  .then(feed => {
    const list = document.getElementById("feed-list");
    const ticker = document.getElementById("ticker-feed");

    if (list) {
      list.innerHTML = feed.map(item => `
        <div class="feed-item">
          <span class="feed-time">${item.time}</span>
          <p>${item.text}</p>
        </div>
      `).join("");
    }

    if (ticker) {
      ticker.innerHTML = feed.map(item => `
        <span class="ticker-item">${item.text}</span>
      `).join(" • ");
    }
  });
