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
// ================================
// ULTIME DAL MONDO CYBER (RSS)
// ================================

async function loadCyberFeed() {
  const rssUrl = "https://thehackernews.com/rss.xml";
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const container = document.getElementById("cyber-feed-list");
    container.innerHTML = "";

    data.items.slice(0, 5).forEach(item => {
      const div = document.createElement("div");
      div.innerHTML = `
        <a href="${item.link}" target="_blank">${item.title}</a>
        <div class="time">${new Date(item.pubDate).toLocaleString("it-IT")}</div>
      `;
      container.appendChild(div);
    });

  } catch (error) {
    console.error("Errore nel caricamento del feed cyber:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadCyberFeed);
