document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("trending-list");
  if (!list) return;

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
        const li = document.createElement("li");

        const strong = document.createElement("strong");
        strong.textContent = `${item.title || "News"}: `;

        if (typeof item.link === "string" && /^https?:\/\//i.test(item.link)) {
          const a = document.createElement("a");
          a.href = item.link;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.appendChild(strong);
          li.appendChild(a);
        } else {
          li.appendChild(strong);
        }

        if (item.desc) {
          li.appendChild(document.createTextNode(item.desc));
        }

        fragment.appendChild(li);
      });

      list.replaceChildren(fragment);
    } catch (err) {
      console.error("Errore Trending Topics:", err);
      if (list.textContent.includes("Caricamento")) {
        const li = document.createElement("li");
        li.textContent = "Impossibile caricare i trending topics";
        list.replaceChildren(li);
      }
    } finally {
      isLoading = false;
    }
  }

  loadTrending(true);
  setInterval(() => loadTrending(false), 5 * 60 * 1000);
});
