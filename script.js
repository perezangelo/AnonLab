// ===============================
// MENU MOBILE
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    // ===============================
    // SKILL BAR ANIMATION
    // ===============================
    const skills = document.querySelectorAll(".skill-fill");
    skills.forEach(skill => {
        const fill = skill.getAttribute("data-fill");
        skill.style.width = fill + "%";
    });

    // ===============================
    // REVEAL ANIMATION
    // ===============================
    const reveals = document.querySelectorAll(".reveal");
    const revealOnScroll = () => {
        const trigger = window.innerHeight * 0.85;

        reveals.forEach(el => {
            const top = el.getBoundingClientRect().top;
            if (top < trigger) {
                el.classList.add("visible");
            }
        });
    };

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

    // ===============================
    // WIDGETS
    // ===============================
    loadCyberNews();
    loadWeather();
    loadHoroscope();
});


// ===============================
// WIDGET: CYBER NEWS
// ===============================
function loadCyberNews() {
    const box = document.getElementById("cyber");
    if (!box) return;

    box.innerHTML += `
        <h3>Cyber News</h3>
        <ul>
            <li>• Nuove vulnerabilità rilevate oggi</li>
            <li>• Aggiornamenti software consigliati</li>
            <li>• Trend di sicurezza della settimana</li>
        </ul>
    `;
}


// ===============================
// WIDGET: METEO
// ===============================
function loadWeather() {
    const box = document.getElementById("meteo");
    if (!box) return;

    box.innerHTML += `
        <h3>Meteo</h3>
        <p>15°C — Sereno</p>
        <p>Vento: 7 km/h</p>
    `;
}


// ===============================
// WIDGET: OROSCOPO
// ===============================
function loadHoroscope() {
    const box = document.getElementById("oroscopo");
    if (!box) return;

    box.innerHTML += `
        <h3>Oroscopo</h3>
        <p>Giornata positiva per nuove idee.</p>
        <p>Consiglio: mantieni la mente aperta.</p>
    `;
}
