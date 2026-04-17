fetch("/data/news.json")
  .then(res => res.json())
  .then(news => {
    const ticker = document.getElementById("ticker-track");
    if (!ticker) return;

    const items = news
      .map(item => `<a href="${item.url}">${item.title}</a>`)
      .join("");

    ticker.innerHTML = items + items;
  });
