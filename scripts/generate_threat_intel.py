import requests
import json
from datetime import datetime

def safe_get_json(url):
    try:
        return requests.get(url, timeout=20).json()
    except:
        return None

def safe_get_text(url):
    try:
        return requests.get(url, timeout=20).text
    except:
        return ""

# ============================
# 1) CISA KEV (zero-day reali)
# ============================
cisa = safe_get_json("https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json")
zero_day_count = len(cisa.get("vulnerabilities", [])) if cisa else 0

# ============================
# 2) ExploitDB (exploit pubblici)
# ============================
exploitdb = safe_get_text("https://gitlab.com/exploit-database/exploitdb/-/raw/main/files_exploits.csv")
exploit_count = len(exploitdb.splitlines()) if exploitdb else 0

# ============================
# 3) NVD CVE feed (minacce attive)
# ============================
nvd = safe_get_json("https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=200")
threat_level = len(nvd.get("vulnerabilities", [])) % 100 if nvd else 0

# ============================
# 4) Timestamp aggiornamento
# ============================
updated = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

# ============================
# 5) Salva JSON reale
# ============================
data = {
    "threatLevel": threat_level,
    "zeroDay": zero_day_count,
    "exploits": exploit_count,
    "updated": updated
}

with open("data/threat-intel.json", "w") as f:
    json.dump(data, f, indent=2)
