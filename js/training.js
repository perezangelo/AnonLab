const questions = [
{
    q: "Quale porta TCP utilizza HTTPS?",
    a: ["22","25","443","3389"],
    correct: 2
},
{
    q: "Quale protocollo usa la porta 22?",
    a: ["FTP","SSH","SMTP","SNMP"],
    correct: 1
},
{
    q: "Cosa significa OSINT?",
    a: [
        "Open Source Intelligence",
        "Open Security Interface",
        "Online Security Intel",
        "Operating System Intelligence"
    ],
    correct: 0
}
];

let xp = Number(localStorage.getItem("anonlabXP")) || 0;

function badgeFromXP() {

    if (xp >= 500) return "Threat Hunter";

    if (xp >= 250) return "SOC Analyst";

    if (xp >= 100) return "Security Operator";

    return "Rookie Analyst";
}

function renderStatus() {

    document.getElementById("status").innerHTML = `
    <pre>
Livello: ${badgeFromXP()}
XP: ${xp}
Badge: ${badgeFromXP()}
    </pre>
    `;
}

function loadQuestion() {

    const q =
        questions[Math.floor(Math.random() * questions.length)];

    document.getElementById("question").innerHTML = `
    <pre>

[MISSIONE]

${q.q}

    </pre>
    `;

    const answers = document.getElementById("answers");

    answers.innerHTML = "";

    q.a.forEach((text,index)=>{

        const btn = document.createElement("button");

        btn.textContent =
            String.fromCharCode(65+index) +
            ") " +
            text;

        btn.onclick = ()=>{

            if(index === q.correct){

                xp += 10;

                localStorage.setItem(
                    "anonlabXP",
                    xp
                );

                alert("✔ Risposta corretta (+10 XP)");

            }else{

                alert("✘ Risposta errata");

            }

            renderStatus();
            loadQuestion();
        };

        answers.appendChild(btn);
    });
}

renderStatus();
loadQuestion();
