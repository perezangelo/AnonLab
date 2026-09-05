export default function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const data = [
    { country: "USA", attacks: 120 },
    { country: "Germany", attacks: 80 },
    { country: "Italy", attacks: 45 },
    { country: "France", attacks: 60 },
    { country: "China", attacks: 150 }
  ];

  res.status(200).json(data);
}
