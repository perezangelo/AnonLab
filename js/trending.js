document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("trending-list");
  if (!list) return;

  // Stile inline base del contenitore
  list.style.cssText = "list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;";

  const ENDPOINT = "https://angelonline.altervista.org/newsops/trendingtopics.php";
  let isLoading = false;

  async function loadTrending(force = false) {
    if (isLoading || (!force && document.hidden)) return;
    isLoading = true;

    try {
      const res = await fetch(ENDPOINT + "?t=" + Date.now(), {
        headers: { "Accept": "application/json" }
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) throw new Error("Dati non validi");

      const fragment = document.createDocumentFragment();

      data.forEach(item => {
        // Scheda / Card Notizia
        const li = document.createElement("li");
        li.style.cssText = "background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(0, 243, 255, 0.12); border-left: 3px solid #00f3ff; border-radius: 5px; padding: 12px 14px; transition: all 0.2s ease;";

        // Effetto hover sulla scheda intera
        li.onmouseenter = () => {
          li.style.background = "rgba(0, 243, 255, 0.04)";
          li.style.borderLeftColor = "#38bdf8";
        };
        li.onmouseleave = () => {
          li.style.background = "rgba(255, 255, 255, 0.02)";
          li.style.borderLeftColor = "#00f3ff";
        };

        // Badge della Fonte (Sophos, Krebs, THN...)
        if (item.source) {
          const badge = document.createElement("span");
          badge.textContent = item.source;
          badge.style.cssText = "display: inline-block; font-size: 10px; font-weight: 700; color: #00f3ff; background: rgba(0, 243, 255, 0.1); border: 1px solid rgba(0, 243, 255, 0.25); padding: 2px 7px; border-radius: 3px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;";
          li.appendChild(badge);
        }

        // Titolo (Link pulito, senza blu e senza sottolineature sgradevoli)
        const a = document.createElement("a");
        a.textContent = item.title || "Notizia";
        a.style.cssText = "display: block; color: #f8fafc; font-size: 14px; font-weight: 600; line-height: 1.4; text-decoration: none; margin-bottom: 5px; transition: color 0.15s ease;";

        if (item.link) {
          a.href = item.link;
          a.target = "_blank";
          a.rel = "noopener noreferrer";

          a.onmouseenter = (e) => {
            e.stopPropagation();
            a.style.color = "#00f3ff";
          };
          a.onmouseleave = (e) => {
            e.stopPropagation();
            a.style.color = "#f8fafc";
          };
        }
        li.appendChild(a);

        // Descrizione
        if (item.desc) {
          const p = document.createElement("p");
          p.textContent = item.desc;
          p.style.cssText = "margin: 0; color: #94a3b8; font-size: 12.5px; line-height: 1.45;";
          li.appendChild(p);
        }

        fragment.appendChild(li);
      });

      list.replaceChildren(fragment);

    } catch (err) {
      console.error("Errore Trending Topics:", err);
      if (list.textContent.includes("Caricamento")) {
        const li = document.createElement("li");
        li.textContent = "Feed temporaneamente non disponibili";
        li.style.cssText = "color: #ef4444; font-size: 13px; list-style: none;";
        list.replaceChildren(li);
      }
    } finally {
      isLoading = false;
    }
  }

  loadTrending(true);
  // Controllo automatico ogni 60 secondi
  setInterval(() => loadTrending(false), 60000);
});
