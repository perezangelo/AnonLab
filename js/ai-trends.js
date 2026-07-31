fetch('/api/ai-trends.php')
  .then(r => r.json())
  .then(data => {
    const box = document.getElementById('ai-trends');

    data.slice(0, 6).forEach(item => {
      box.innerHTML += `
        <div class="ai-card">
          <img src="${item.image}" class="ai-thumb">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <a href="${item.link}" target="_blank">Leggi su Wired →</a>
          <span class="ai-date">${item.date}</span>
        </div>
      `;
    });
  });
