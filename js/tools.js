/* ============================================================
   ACCORDION — APERTURA / CHIUSURA
============================================================ */
document.addEventListener("click", e => {
  if (!e.target.closest(".tool-toggle")) return;

  const box = e.target.closest(".tool-box");
  box.classList.toggle("open");
});

/* ============================================================
   1) WHOIS LOOKUP
============================================================ */
async function runWhois() {
  const domain = document.getElementById("whois-input").value.trim();
  const out = document.getElementById("whois-output");

  if (!domain) return out.textContent = "Inserisci un dominio.";

  out.textContent = "Caricamento...";

  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=https://api.hackertarget.com/whois/?q=${domain}`);
    out.textContent = await res.text();
  } catch {
    out.textContent = "Errore durante la richiesta.";
  }
}

/* ============================================================
   2) DNS LOOKUP
============================================================ */
async function runDNS() {
  const domain = document.getElementById("dns-input").value.trim();
  const type = document.getElementById("dns-type").value;
  const out = document.getElementById("dns-output");

  if (!domain) return out.textContent = "Inserisci un dominio.";

  out.textContent = "Caricamento...";

  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=https://api.hackertarget.com/dnslookup/?q=${domain}`);
    out.textContent = await res.text();
  } catch {
    out.textContent = "Errore durante la richiesta.";
  }
}

/* ============================================================
   3) IP GEOLOCATION
============================================================ */
async function runGeo() {
  const ip = document.getElementById("geo-input").value.trim();
  const out = document.getElementById("geo-output");

  if (!ip) return out.textContent = "Inserisci un IP.";

  out.textContent = "Caricamento...";

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    out.textContent = JSON.stringify(await res.json(), null, 2);
  } catch {
    out.textContent = "Errore durante la richiesta.";
  }
}

/* ============================================================
   4) PASSWORD STRENGTH CHECKER
============================================================ */
function checkPassword() {
  const pwd = document.getElementById("pwd-input").value;
  const out = document.getElementById("pwd-output");

  if (!pwd) return out.textContent = "Inserisci una password.";

  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const levels = ["Debole", "Media", "Buona", "Forte"];
  out.textContent = "Robustezza: " + levels[score - 1] || "Debole";
}

/* ============================================================
   5) HASH GENERATOR
============================================================ */
async function runHash() {
  const text = document.getElementById("hash-input").value;
  const type = document.getElementById("hash-type").value;
  const out = document.getElementById("hash-output");

  if (!text) return out.textContent = "Inserisci un testo.";

  const enc = new TextEncoder().encode(text);
  const algo = type.replace("-", "");

  const buf = await crypto.subtle.digest(algo, enc);
  const hash = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

  out.textContent = hash;
}

/* ============================================================
   6) BASE64
============================================================ */
function runB64Encode() {
  const text = document.getElementById("b64-input").value;
  document.getElementById("b64-output").textContent = btoa(text);
}

function runB64Decode() {
  const text = document.getElementById("b64-input").value;
  try {
    document.getElementById("b64-output").textContent = atob(text);
  } catch {
    document.getElementById("b64-output").textContent = "Base64 non valido.";
  }
}

/* ============================================================
   7) PORT SCAN (MOCK)
============================================================ */
function runPortScan() {
  const ip = document.getElementById("portscan-input").value.trim();
  const out = document.getElementById("portscan-output");

  if (!ip) return out.textContent = "Inserisci un IP.";

  out.textContent =
    `Simulazione porte aperte su ${ip}:\n\n` +
    "22/tcp  OPEN (SSH)\n" +
    "80/tcp  OPEN (HTTP)\n" +
    "443/tcp OPEN (HTTPS)\n" +
    "\n*Nota: simulazione sicura, nessuna connessione reale.*";
}

/* ============================================================
   8) HEADER ANALYZER
============================================================ */
async function runHeaderAnalyzer() {
  const url = document.getElementById("header-input").value.trim();
  const out = document.getElementById("header-output");

  if (!url) return out.textContent = "Inserisci un URL.";

  out.textContent = "Caricamento...";

  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${url}`);
    const headers = [...res.headers.entries()]
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    out.textContent = headers;
  } catch {
    out.textContent = "Errore durante la richiesta.";
  }
}

/* ============================================================
   9) URL EXPANDER
============================================================ */
async function runURLExpand() {
  const url = document.getElementById("expand-input").value.trim();
  const out = document.getElementById("expand-output");

  if (!url) return out.textContent = "Inserisci un URL.";

  out.textContent = "Caricamento...";

  try {
    const res = await fetch(url, { redirect: "follow" });
    out.textContent = "URL finale: " + res.url;
  } catch {
    out.textContent = "Errore durante la richiesta.";
  }
}

/* ============================================================
   10) QR CODE GENERATOR
============================================================ */
function runQR() {
  const text = document.getElementById("qr-input").value;
  const out = document.getElementById("qr-output");

  if (!text) return out.textContent = "Inserisci un testo.";

  out.innerHTML =
    `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}">`;
}

/* ============================================================
   11) JSON FORMATTER
============================================================ */
function formatJSON() {
  const text = document.getElementById("json-input").value;
  const out = document.getElementById("json-output");

  try {
    out.textContent = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    out.textContent = "JSON non valido.";
  }
}

function minifyJSON() {
  const text = document.getElementById("json-input").value;
  const out = document.getElementById("json-output");

  try {
    out.textContent = JSON.stringify(JSON.parse(text));
  } catch {
    out.textContent = "JSON non valido.";
  }
}

/* ============================================================
   12) REGEX TESTER
============================================================ */
function runRegex() {
  const pattern = document.getElementById("regex-pattern").value;
  const text = document.getElementById("regex-text").value;
  const out = document.getElementById("regex-output");

  try {
    const re = new RegExp(pattern, "g");
    const matches = text.match(re);
    out.textContent = matches ? matches.join("\n") : "Nessuna corrispondenza.";
  } catch {
    out.textContent = "Regex non valida.";
  }
}

/* ============================================================
   13) UUID GENERATOR
============================================================ */
function runUUID() {
  document.getElementById("uuid-output").textContent = crypto.randomUUID();
}

/* ============================================================
   14) LOREM IPSUM
============================================================ */
function runLorem() {
  const type = document.getElementById("lorem-type").value;
  const out = document.getElementById("lorem-output");

  const short = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const medium = short + " Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  const long = medium + " Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  out.textContent =
    type === "short" ? short :
    type === "medium" ? medium :
    long;
}

/* ============================================================
   15) TIMESTAMP CONVERTER
============================================================ */
function runTimestamp() {
  const ts = document.getElementById("ts-input").value.trim();
  const out = document.getElementById("ts-output");

  if (!ts) return out.textContent = "Inserisci un timestamp.";

  const date = new Date(ts * 1000);
  out.textContent = date.toString();
}

/* ============================================================
   16) TEXT DIFF TOOL
============================================================ */
function runDiff() {
  const a = document.getElementById("diff-a").value;
  const b = document.getElementById("diff-b").value;
  const out = document.getElementById("diff-output");

  const linesA = a.split("\n");
  const linesB = b.split("\n");

  let diff = "";

  for (let i = 0; i < Math.max(linesA.length, linesB.length); i++) {
    if (linesA[i] !== linesB[i]) {
      diff += `- ${linesA[i] || ""}\n+ ${linesB[i] || ""}\n\n`;
    }
  }

  out.textContent = diff || "I testi sono identici.";
}

/* ============================================================
   17) STRUMENTI CYBER
============================================================ */
async function initTools() {
    const list = document.getElementById("tools-list");
    if (!list) return;

    try {
        const res = await fetch("/data/tools.json?cache=" + Date.now());
        const tools = await res.json();

        list.innerHTML = "";

        tools.forEach(tool => {
            const li = document.createElement("li");
            li.className = "tool-item";

            li.innerHTML = `
                <img src="${tool.icon}" alt="${tool.name}" width="32" height="32">
                <div class="tool-info">
                    <strong>${tool.name}</strong>
                    <span>${tool.desc}</span>
                </div>
                <a href="${tool.url}" style="color:#ff7b00; font-weight:bold;">Apri →</a>
            `;

            list.appendChild(li);
        });

    } catch (err) {
        list.innerHTML = "<li>Errore caricamento strumenti</li>";
        console.error(err);
    }
}
