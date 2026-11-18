document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("trending-list");
  if (!list) return;

  // Stile inline per il contenitore lista (rimuove i pallini e azzera il padding)
  list.style.listStyle = "none";
  list.style.padding = "0";
  list.style.margin = "0";

  const ENDPOINT = "https://angelonline.altervista.org/newsops/trendingtopics.php";
  let isLoading = false;

  async function loadTrending(force = false) {
    if (isLoading || (!force && document.hidden)) return;
    isLoading = true;

    try {
      const res = await fetch(ENDPOINT, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (!res.ok) {
        throw new Error(`Errore HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Nessun dato valido ricevuto");
      }

      const fragment = document.createDocumentFragment();

      data.forEach(item => {
        // 1. Elemento contenitore notizia (stile scheda scura con bordo ciano)
        const li = document.createElement("li");
        li.style.cssText = "margin-bottom: 14px; padding: 12px 14px; background: rgba(255, 255, 255, 0.03); border-left: 3px solid #00e5ff; border-radius: 4px; font-family: inherit;";

        // 2. Badge della Fonte (Krebs, BleepingComputer, ecc.)
        if (item.source) {
          const badge = document.createElement("span");
          badge.textContent = item.source;
          badge.style.cssText = "display: inline-block; font-size: 11px; font-weight: 700; color: #00e5ff; background: rgba(0, 229, 255, 0.15); padding: 2px 6px; border-radius: 3px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;";
          li.appendChild(badge);
        }

        // 3. Titolo cliccabile (elimina il blu e la sottolineatura di default)
        const a = document.createElement("a");
        a.textContent = item.title || "News";
        a.style.cssText = "display: block; color: #f1f5f9; text-decoration: none; font-size: 14px; font-weight: 700; line-height: 1.35; margin-bottom: 6px;";

        if (typeof item.link === "string" && /^https?:\/\//i.test(item.link)) {
          a.href = item.link;
          a.target = "_blank";
          a.rel = "noopener noreferrer";

          // Effetto hover inline (diventa ciano al passaggio del mouse)
          a.onmouseenter = () => { a.style.color = "#00e5ff"; };
          a.onmouseleave = () => { a.style.color = "#f1f5f9"; };
        }
        li.appendChild(a);

        // 4. Descrizione leggibile sotto al titolo
        if (item.desc) {
          const desc = document.createElement("p");
          desc.textContent = item.desc;
          desc.style.cssText = "margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.45;";
          li.appendChild(desc);
        }

        fragment.appendChild(li);
      });

      list.replaceChildren(fragment);
    } catch (err) {
      console.error("Errore Trending Topics:", err);
      if (list.textContent.includes("Caricamento")) {
        const li = document.createElement("li");
        li.textContent = "Impossibile caricare i trending topics";
        li.style.cssText = "color: #ef4444; list-style: none;";
        list.replaceChildren(li);
      }
    } finally {
      isLoading = false;
    }
  }

  loadTrending(true);
  setInterval(() => loadTrending(false), 5 * 60 * 1000);
});
