async function loadCisaAlerts() {
  const endpoint = "https://angelonline.altervista.org/api/cisa.php";

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    const data = await response.json();

    if (!data.alerts || !Array.isArray(data.alerts)) {
      console.error("Formato JSON non valido:", data);
      return;
    }

    // Rendering nel widget
    const container = document.getElementById("cisa-alerts");
    if (!container) return;

    container.innerHTML = "";

    data.alerts.forEach(alert => {
      const item = document.createElement("div");
      item.className = "cisa-item";

      item.innerHTML = `
        <strong>${alert.title}</strong><br>
        <span>${alert.summary}</span>
      `;

      container.appendChild(item);
    });

  } catch (error) {
    console.error("Errore nel caricamento CISA:", error);
  }
}

// Avvio automatico
loadCisaAlerts();
