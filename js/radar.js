async function initTechRadar() {
    const list = document.getElementById("tech-radar-list");
    if (!list) return;

    try {
        const res = await fetch("https://angelonline.altervista.org/api/tech-radar.php?cache=" + Date.now());
        const items = await res.json();

        let index = 0;

        function updateRadar() {
            list.style.opacity = 0;

            setTimeout(() => {
                list.innerHTML = `<li>${items[index].trend}</li>`;
                list.style.opacity = 1;
                index = (index + 1) % items.length;
            }, 300);
        }

        updateRadar();
        setInterval(updateRadar, 4000);

    } catch (err) {
        list.innerHTML = "<li>Errore caricamento radar</li>";
        console.error(err);
    }
}
