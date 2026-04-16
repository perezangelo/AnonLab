fetch("/data/news.json")
  .then(res => res.json())
  .then(news => {
    const container = document.getElementById("news-container");
    if (!container) return;

    container.innerHTML = news.map(item => `
      <article class="news-card">
        <img src="${item.image}" alt="">
        <div class="news-content">
          <span class="category">${item.category}</span>
          <h2>${item.title}</h2>
          <p>${item.excerpt}</p>
          <span class="time">${item.time}</span>
        </div>
      </article>
    `).join("");
  });
