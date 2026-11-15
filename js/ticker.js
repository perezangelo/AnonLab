/* ============================================================
   TICKER — VERSIONE "TRENO DI NEWS" (ZERO FORCED REFLOW)
============================================================ */

let tickerNews = [];

function optimizeTickerImage(rawImg) {
    if (!rawImg) return "";
    if (/blogger\.googleusercontent\.com|bp\.blogspot\.com/i.test(rawImg)) {
        return rawImg
            .replace(/\/s\d+(?:-[^/]+)?\//i, "/s80-rw/")
            .replace(/=s\d+(?:-[^&]+)?$/i, "=s80-rw");
    }
    if (/^https?:\/\/(www\.)?anonlab\.it\//i.test(rawImg) || rawImg.startsWith("/")) {
        return rawImg;
    }
return `https://wsrv.nl/?url=${encodeURIComponent(rawImg)}&w=40&h=40&fit=cover&output=webp`;
}

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
        console.warn("Errore ticker:", e);
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
    if (wrapper) wrapper.style.overflow = "hidden";

    if (!document.getElementById("anonlab-ticker-keyframes")) {
        const style = document.createElement("style");
        style.id = "anonlab-ticker-keyframes";
        style.textContent = `
            @keyframes anonlabTickerScroll {
                0%   { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
            }
        `;
        document.head.appendChild(style);
    }

    const colors = ["#00ffff", "#ff00ff", "#ff8800", "#00ff88", "#ff4444"];
    const icons = ["◆", "◉", "✦", "❯"];

    let html = "";

    tickerNews.forEach((item, idx) => {
        const neon = colors[idx % colors.length];
        const icon = icons[idx % icons.length];

        const rawImg = item.image && item.image.trim() !== "" ? item.image.trim() : "";
        const img = optimizeTickerImage(rawImg);

        const cleanTitle = String(item.title || "Notizia cyber")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        const imgTag = img
            ? `<img src="${img}"
                    width="20"
                    height="20"
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    onerror="this.style.display='none'"
                    style="width:20px;height:20px;object-fit:cover;border-radius:4px;margin-right:6px;flex-shrink:0;">`
            : "";

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
                ${imgTag}
                <span style="margin-right:6px;">${icon}</span>
                <span>${cleanTitle}</span>
            </a>
        `;
    });

    el.innerHTML = html + html;
    el.style.display = "inline-block";
    el.style.whiteSpace = "nowrap";
    el.style.willChange = "transform";

    // Durata proporzionale al numero di caratteri (nessuna lettura di scrollWidth -> zero reflow!)
    const totalChars = tickerNews.reduce((sum, item) => sum + String(item.title || "").length + 14, 0);
    const durationSec = Math.max(25, Math.round((totalChars * 8.5) / 80));

    el.style.animation = "none";
    requestAnimationFrame(() => {
        el.style.animation = anonlabTickerScroll ${durationSec}s linear infinite;
    });
}

