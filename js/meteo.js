fetch("/data/meteo.json")
  .then(res => res.json())
  .then(m => {
    const box = document.getElementById("meteo-box");
    if (!box) return;

    box.innerHTML = `
      <div class="meteo-city">${m.city}</div>
      <div class="meteo-temp">${m.temp}</div>
      <div class="meteo-desc">${m.desc}</div>
    `;
  });
