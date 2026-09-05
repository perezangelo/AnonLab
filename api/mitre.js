export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const data = [
    { id: "T1059", name: "Command & Scripting Interpreter" },
    { id: "T1078", name: "Valid Accounts" },
    { id: "T1566", name: "Phishing" },
    { id: "T1021", name: "Remote Services" }
  ];

  res.status(200).json(data);
}
