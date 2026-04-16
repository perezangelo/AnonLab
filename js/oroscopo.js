fetch("/data/oroscopo.json")
  .then(res => res.json())
  .then(o => {
    const box = document.getElementById("oroscopo-box");
    if (!box) return;

    box.innerHTML =
      o.status === "error"
        ? `<p>${o.message}</p>`
        : `<p>${o.text}</p>`;
  });
