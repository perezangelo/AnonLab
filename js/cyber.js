fetch("/data/news.json")
  .then(res => res.json())
  .then(news => {
    const container = document.getElementById("cyber-container");
    if (!container) return;

    // Categorie considerate "cyber"
    const cyberCategories = [
      "cyber",
      "security",
      "threat",
      "ai",
      "strategy",
      "regulations",
      "intelligence"
    ];

    const filtered = news.filter(n =>
      cyberCategories.some(cat =>
        n.category.toLowerCase().includes(cat)
      )
    );

    container.innerHTML = filtered.map(item => `
      <article class="news-card">
        <img src="${item.img}" class="news-thumb" alt="${item.title}">
        <div class="news-content">
          <span class="news-category">${item.category}</span>
          <h3 class="news-title">${item.title}</h3>
          <p class="news-excerpt">${item.excerpt}</p>
          <span class="news-time">${item.time}</span>
          <a href="${item.link}" class="news-link">Leggi di più →</a>
        </div>
      </article>
    `).join("");
  })
  .catch(err => console.error("Errore nel caricamento delle news:", err));
