/* ============================================================
   TICKER — VERSIONE "TRENO DI NEWS" (continua + immagini)
============================================================ */

let tickerNews = [];
let pos = 0;
let speed = 1.4;          // velocità scorrimento
let tickerFrame = null;

/* ============================================================
   CARICAMENTO NEWS
============================================================ */
async function loadTickerNews() {
    try {
        const url = "https://raw.githubusercontent.com/perezangelo/AnonLab/refs/heads/main/data/news.json?cache=" + Date.now();
        const res = await fetch(url);
        const data = await res.json();

        tickerNews = Array.isArray(data) && data.length > 0
            ? data
            : [{ title: "Nessuna notizia disponibile", link: "#", image: "" }];

        buildTickerTrain();
    } catch (e) {
        console.error("Errore ticker:", e);
        tickerNews = [{ title: "Errore nel caricamento delle news", link: "#", image: "" }];
        buildTickerTrain();
    }
}

/* ============================================================
   COSTRUZIONE "TRENO" DI NEWS
============================================================ */
function buildTickerTrain() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    const wrapper = el.parentElement;
    wrapper.style.overflow = "hidden";

    const colors = ["#00ffff", "#ff00ff", "#ff8800", "#00ff88", "#ff4444"];
    const icons = ["◆", "◉", "✦", "❯"];

    // Costruisco una stringa unica con TUTTE le news concatenate
    let html = "";

    tickerNews.forEach((item, idx) => {
        const neon = colors[idx % colors.length];
        const icon = icons[idx % icons.length];

        const img = item.image && item.image.trim() !== ""
            ? item.image
            : "https://picsum.photos/40/40?random=" + idx;

        html += `
            <a href="${item.link || "#"}" style="
                color:#ffffff;
                text-decoration:none;
                font-weight:600;
                font-family:inherit;
                display:inline-flex;
                align-items:center;
                white-space:nowrap;
                margin-right:40px;
                text-shadow:0 0 8px ${neon};
            ">
                <img src="${img}" style="
                    height:20px;width:20px;object-fit:cover;
                    border-radius:4px;margin-right:6px;
                ">
                <span style="margin-right:6px;">${icon}</span>
                <span>${item.title}</span>
            </a>
        `;
    });

    // Duplico il contenuto per avere un loop continuo
    el.innerHTML = html + html;

    el.style.display = "inline-block";
    el.style.whiteSpace = "nowrap";
    el.style.transform = "translateX(0px)";

    // posizione iniziale
    pos = 0;

    if (tickerFrame) cancelAnimationFrame(tickerFrame);
    startContinuousScroll();
}

/* ============================================================
   SCORRIMENTO CONTINUO SENZA FERMARSI
============================================================ */
function startContinuousScroll() {
    const el = document.getElementById("ticker-text");
    if (!el) return;

    const contentWidth = el.scrollWidth;
    const tickerEl = document.querySelector(".ticker");
    if (!tickerEl) return;

    const tickerWidth = tickerEl.getBoundingClientRect().width;

    function step() {
        pos -= speed;

        // quando metà del contenuto è uscita a sinistra,
        // riportiamo la posizione avanti di metà larghezza
        // così il "treno" è sempre continuo
        if (pos <= -contentWidth / 2) {
            pos += contentWidth / 2;
        }

        el.style.transform = `translateX(${pos}px)`;
        tickerFrame = requestAnimationFrame(step);
    }

    tickerFrame = requestAnimationFrame(step);
}
