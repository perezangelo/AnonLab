export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const level = {
    status: "Elevated",
    color: "orange",
    description: "Aumento dell'attività di phishing e scansioni di rete."
  };

  res.status(200).json(level);
}
