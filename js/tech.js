fetch("/data/news.json")
  .then(res => res.json())
  .then(news => {
    const container = document.getElementById("tech-container");
    if (!container) return;

    const filtered = news.filter(n =>
      n.category.toLowerCase().includes("tech")
    );

    container.innerHTML = filtered.map(item => `
      <article class="news-card">
        <img src="${item.image}">
        <div class="news-content">
          <span class="category">${item.category}</span>
          <h2>${item.title}</h2>
          <p>${item.excerpt}</p>
          <span class="time">${item.time}</span>
        </div>
      </article>
    `).join("");
  });
