import requests
import json

points = []

# ============================
# 1) FeodoTracker (botnet)
# ============================
try:
    feodo = requests.get("https://feodotracker.abuse.ch/downloads/ipblocklist.json").json()
    for entry in feodo["data"][:20]:
        ip = entry["ip_address"]
        geo = requests.get(f"https://ipapi.co/{ip}/json/").json()
        if "latitude" in geo and "longitude" in geo:
            points.append({
                "lat": geo["latitude"],
                "lon": geo["longitude"],
                "intensity": 0.7,
                "src": "botnet"
            })
except:
    pass

# ============================
# 2) URLHaus (malware)
# ============================
try:
    urlhaus = requests.get("https://urlhaus.abuse.ch/downloads/json/").json()
    for entry in urlhaus["urls"][:20]:
        domain = entry["url"].split("/")[2]
        geo = requests.get(f"https://ipapi.co/{domain}/json/").json()
        if "latitude" in geo and "longitude" in geo:
            points.append({
                "lat": geo["latitude"],
                "lon": geo["longitude"],
                "intensity": 0.6,
                "src": "malware"
            })
except:
    pass

# ============================
# 3) Spamhaus DROP (reti malevole)
# ============================
try:
    drop = requests.get("https://www.spamhaus.org/drop/drop.txt").text.splitlines()
    for line in drop[:20]:
        ip = line.split(";")[0].strip()
        geo = requests.get(f"https://ipapi.co/{ip}/json/").json()
        if "latitude" in geo and "longitude" in geo:
            points.append({
                "lat": geo["latitude"],
                "lon": geo["longitude"],
                "intensity": 0.8,
                "src": "spamhaus"
            })
except:
    pass

# ============================
# 4) Tor Exit Nodes
# ============================
try:
    tor = requests.get("https://check.torproject.org/torbulkexitlist").text.splitlines()
    for ip in tor[:20]:
        geo = requests.get(f"https://ipapi.co/{ip}/json/").json()
        if "latitude" in geo and "longitude" in geo:
            points.append({
                "lat": geo["latitude"],
                "lon": geo["longitude"],
                "intensity": 0.4,
                "src": "tor"
            })
except:
    pass

# ============================
# Salva il file JSON
# ============================
with open("data/heatmap.json", "w") as f:
    json.dump(points, f, indent=2)
