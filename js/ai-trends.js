fetch('https://angelonline.altervista.org/api/ai-trends.php')
  .then(r => r.json())
  .then(data => {
    const box = document.getElementById('ai-trends');

    data.slice(0, 6).forEach(item => {
      box.innerHTML += `
        <div class="widget-mini" style="display:flex;align-items:flex-start;gap:15px;margin-bottom:20px;">
          
          <!-- IMMAGINE PICCOLA A SINISTRA -->
          <img src="${item.image}" 
               alt="" 
               class="tech-thumb" 
               style="width:90px;height:auto;border-radius:6px;flex-shrink:0;">

          <!-- TESTO A DESTRA -->
          <div class="box-content" style="flex:1;">
            <h3>${item.title}</h3>
            <p>${item.description}</p>

            <!-- LINK ARANCIONE BEN VISIBILE -->
            <a href="${item.link}" 
               target="_blank" 
               style="color:#ff7b00;font-weight:bold;">
               Leggi su Wired →
            </a>

            <br>
            <small>${item.date}</small>
          </div>

        </div>
      `;
    });
  });
