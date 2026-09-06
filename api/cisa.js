export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const url = "https://www.cisa.gov/news.xml";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
          + "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/xml,text/xml,*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });

    const xml = await response.text();

    if (!xml.includes("<rss")) {
      return res.status(200).json({
        alerts: [
          {
            title: "Feed CISA non valido (HTML ricevuto).",
            summary: "Il feed XML non è stato riconosciuto come RSS."
          },
          {
            title: "Cloudflare ha bloccato la richiesta.",
            summary: "La richiesta è stata filtrata dal sistema di protezione."
          },
          {
            title: "Proxy Vercel attivo, ma feed non parsabile.",
            summary: "Il contenuto ricevuto non è convertibile in XML."
          }
        ]
      });
    }

    const { XMLParser } = require("fast-xml-parser");
    const parser = new XMLParser();
    const data = parser.parse(xml);

    const items = data.rss.channel.item.slice(0, 5);

    const alerts = items.map(item => ({
      title: item.title,
      summary: item.description || "Nessun sommario disponibile."
    }));

    return res.status(200).json({ alerts });

  } catch (error) {
    return res.status(200).json({
      alerts: [
        {
          title: "Errore nel proxy Vercel.",
          summary: error.toString()
        }
      ]
    });
  }
}
