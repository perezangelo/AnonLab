async function initTrending() {
    const list = document.getElementById("trending-list");
    if (!list) return;

    try {
        const res = await fetch("/data/trending.json?cache=" + Date.now());
        const items = await res.json();

        list.innerHTML = "";

        items.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${item.title}:</strong> ${item.desc}`;
            list.appendChild(li);
        });

    } catch (err) {
        console.error("Errore Trending Topics:", err);
        list.innerHTML = "<li>Impossibile caricare i trending topics</li>";
    }
}
