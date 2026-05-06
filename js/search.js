let allNews = [];

fetch("/data/news.json")
  .then(res => res.json())
  .then(news => {
    allNews = news;
  })
  .catch(err => console.error("Errore nel caricamento news:", err));

const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("search-results");

if (searchInput && resultsContainer) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();

    if (!q) {
      resultsContainer.innerHTML = "";
      return;
    }

    if (!allNews.length) return;

    const filtered = allNews.filter(item => {
      const inTitle = item.title.toLowerCase().includes(q);
      const inCategory = item.category.toLowerCase().includes(q);
      const inTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
      return inTitle || inCategory || inTags;
    });

    resultsContainer.innerHTML = filtered.length
      ? filtered.map(renderCard).join("")
      : `<p class="no-results">Nessun risultato trovato.</p>`;
  });
}

function renderCard(item) {
  const tags = item.tags && item.tags.length
    ? `<div class="tags">${item.tags.map(t => `<span>${t}</span>`).join("")}</div>`
    : "";

  const image = item.img || "/img/default-news.jpg";
  const link = item.link || "#";

  return `
    <article class="news-card">
      <img src="${image}" alt="${item.title}" class="news-thumb">
      <div class="news-content">
        <span class="news-category">${item.category}</span>
        <h3 class="news-title"><a href="${link}">${item.title}</a></h3>
        <p class="news-excerpt">${item.excerpt}</p>
        ${tags}
        <span class="news-time">${item.time}</span>
      </div>
    </article>
  `;
}
