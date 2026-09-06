export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
          + "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/json,*/*",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    const json = await response.json();

    let alerts = [];

    if (json.vulnerabilities && Array.isArray(json.vulnerabilities)) {
      alerts = json.vulnerabilities.slice(0, 5).map(v => ({
        source: "CISA KEV",
        title: v.cveID || "Vulnerabilità",
        summary: v.shortDescription || "Nessuna descrizione disponibile."
      }));
    }

    return res.status(200).json({ alerts });

  } catch (error) {
    return res.status(200).json({
      alerts: [
        {
          source: "CISA",
          title: "Errore nel proxy Vercel",
          summary: error.toString()
        }
      ]
    });
  }
}
