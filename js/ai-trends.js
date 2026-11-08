fetch('https://angelonline.altervista.org/api/ai-trends.php')
  .then(r => r.json())
  .then(data => {
    const box = document.getElementById('ai-trends');
    if (!box) return;

    let html = "";

    data.slice(0, 6).forEach(item => {
      html += `
        <div class="widget-mini" style="display:flex;align-items:flex-start;gap:15px;margin-bottom:20px;">
          
          <!-- IMMAGINE CON LAZY LOADING PER RISPARMIARE BANDA -->
          <img src="${item.image}" 
               alt="${item.title || 'AI trend'}"
               width="90" height="60"
               loading="lazy"
               decoding="async"
               class="tech-thumb"
               style="width:90px;height:auto;border-radius:6px;flex-shrink:0;">

          <!-- TESTO A DESTRA -->
          <div class="box-content" style="flex:1;">
            <h3 style="margin-top:0;">${item.title}</h3>
            <p>${item.description}</p>

            <!-- LINK ACCESSIBILE E SICURO -->
            <a href="${item.link}" 
               target="_blank" 
               rel="noopener"
               aria-label="Leggi su Wired: ${item.title}"
               style="color:#ff7b00;font-weight:bold;">
               Leggi su Wired →
            </a>

            <br>
            <small style="color:#888;">${item.date}</small>
          </div>

        </div>
      `;
    });

    box.innerHTML = html;
  })
  .catch(err => console.error("Errore AI trends:", err));
