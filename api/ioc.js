export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const data = [
    { ioc: "malicious-domain.com", type: "domain", source: "URLhaus" },
    { ioc: "192.168.10.55", type: "ip", source: "ThreatFox" },
    { ioc: "badfile.exe", type: "hash", source: "URLhaus" }
  ];

  res.status(200).json(data);
}
