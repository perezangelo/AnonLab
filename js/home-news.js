fetch("/data/news.json")
  .then(res => res.json())
  .then(news => {
    const container = document.getElementById("home-news");
    if (!container) return;

    const latest = news.slice(0, 4);

    container.innerHTML = latest.map(renderCard).join("");
  });

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
