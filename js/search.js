let allNews = [];

fetch("/data/news.json")
  .then(res => res.json())
  .then(news => {
    allNews = news;
  });

const searchInput = document.getElementById("search-input");
const resultsContainer = document.getElementById("search-results");

if (searchInput && resultsContainer) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      resultsContainer.innerHTML = "";
      return;
    }

    const filtered = allNews.filter(item => {
      const inTitle = item.title.toLowerCase().includes(q);
      const inCategory = item.category.toLowerCase().includes(q);
      const inTags = (item.tags || []).some(t => t.toLowerCase().includes(q));
      return inTitle || inCategory || inTags;
    });

    resultsContainer.innerHTML = filtered.map(renderCard).join("");
  });
}

function renderCard(item) {
  const tags = item.tags && item.tags.length
    ? `<div class="tags">${item.tags.map(t => `<span>${t}</span>`).join("")}</div>`
    : "";

  return `
    <article class="news-card">
      <img src="${item.image}" alt="${item.title}">
      <div class="news-content">
        <span class="category">${item.category}</span>
        <h2><a href="${item.url}">${item.title}</a></h2>
        <p>${item.excerpt}</p>
        ${tags}
        <span class="time">${item.time}</span>
      </div>
    </article>
  `;
}
