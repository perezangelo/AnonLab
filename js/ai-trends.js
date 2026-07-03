async function initAITrends() {
    const list = document.getElementById("ai-trends-list");
    if (!list) return;

    try {
        const res = await fetch("/data/ai-trends.json?cache=" + Date.now());
        const items = await res.json();

        let index = 0;

        function updateTrend() {
            list.style.opacity = 0;

            setTimeout(() => {
                list.innerHTML = `<li>${items[index]}</li>`;
                list.style.opacity = 1;
                index = (index + 1) % items.length;
            }, 300);
        }

        updateTrend();               // prima voce
        setInterval(updateTrend, 4000); // cambia ogni 4 secondi

    } catch (err) {
        list.innerHTML = "<li>Errore caricamento AI Trends</li>";
        console.error(err);
    }
}
