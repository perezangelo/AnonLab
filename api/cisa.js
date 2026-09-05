export default async function handler(req, res) {
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
      return res.status(200).json([
        { source: "CISA", title: "Feed CISA non valido (HTML ricevuto)." },
        { source: "CISA", title: "Cloudflare ha bloccato la richiesta." },
        { source: "CISA", title: "Proxy Vercel attivo, ma feed non parsabile." }
      ]);
    }

    const { XMLParser } = require("fast-xml-parser");
    const parser = new XMLParser();
    const data = parser.parse(xml);

    const items = data.rss.channel.item.slice(0, 5);

    const out = items.map(item => ({
      source: "CISA",
      title: item.title
    }));

    return res.status(200).json(out);

  } catch (error) {
    return res.status(200).json([
      { source: "CISA", title: "Errore nel proxy Vercel." },
      { source: "CISA", title: error.toString() }
    ]);
  }
}
