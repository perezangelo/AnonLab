function animateNumbers() {
  const numbers = document.querySelectorAll(".dash-number");
  numbers.forEach(num => {
    num.style.opacity = "0";
    setTimeout(() => {
      num.style.opacity = "1";
    }, 200);
  });
}

setInterval(animateNumbers, 5000);
