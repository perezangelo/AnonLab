async function initHeatmap() {
    const list = document.getElementById("heatmap-list");
    if (!list) return;

    try {
        const res = await fetch("/data/heatmap.json?cache=" + Date.now());
        const items = await res.json();

        list.innerHTML = "";

        items.forEach(item => {
            const li = document.createElement("li");

            li.innerHTML = `
                <strong>${item.region}:</strong> ${item.text}
            `;

            list.appendChild(li);
        });

    } catch (err) {
        list.innerHTML = "<li>Errore caricamento dati</li>";
        console.error(err);
    }
}
