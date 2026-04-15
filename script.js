// MENU MOBILE
document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.getElementById("navToggle");
    const navLinks = document.getElementById("navLinks");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", () => {
            navLinks.classList.toggle("active");
        });
    }

    // ANIMAZIONE SKILL BAR
    const skills = document.querySelectorAll(".skill-fill");
    skills.forEach(skill => {
        const fill = skill.getAttribute("data-fill");
        skill.style.width = fill + "%";
    });

    // REVEAL ANIMATIONS
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
});
