import requests
import json
import sys

points = []

def safe_json(url):
    try:
        return requests.get(url, timeout=20).json()
    except:
        return None

def safe_text(url):
    try:
        return requests.get(url, timeout=20).text.splitlines()
    except:
        return []

def geo(ip):
    try:
        g = requests.get(f"https://ipapi.co/{ip}/json/", timeout=20).json()
        if "latitude" in g and "longitude" in g:
            return g["latitude"], g["longitude"]
    except:
        pass
    return None, None

try:
    # 1) FeodoTracker
    feodo = safe_json("https://feodotracker.abuse.ch/downloads/ipblocklist.json")
    if feodo and "data" in feodo:
        for entry in feodo["data"][:20]:
            lat, lon = geo(entry["ip_address"])
            if lat and lon:
                points.append({"lat": lat, "lon": lon, "intensity": 0.7, "src": "botnet"})

    # 2) URLHaus
    urlhaus = safe_json("https://urlhaus.abuse.ch/downloads/json/")
    if urlhaus and "urls" in urlhaus:
        for entry in urlhaus["urls"][:20]:
            domain = entry["url"].split("/")[2]
            lat, lon = geo(domain)
            if lat and lon:
                points.append({"lat": lat, "lon": lon, "intensity": 0.6, "src": "malware"})

    # 3) Spamhaus DROP
    drop = safe_text("https://www.spamhaus.org/drop/drop.txt")
    for line in drop[:20]:
        ip = line.split(";")[0].strip()
        lat, lon = geo(ip)
        if lat and lon:
            points.append({"lat": lat, "lon": lon, "intensity": 0.8, "src": "spamhaus"})

    # 4) Tor Exit Nodes
    tor = safe_text("https://check.torproject.org/torbulkexitlist")
    for ip in tor[:20]:
        lat, lon = geo(ip)
        if lat and lon:
            points.append({"lat": lat, "lon": lon, "intensity": 0.4, "src": "tor"})

    # Salva JSON
    with open("data/heatmap.json", "w") as f:
        json.dump(points, f, indent=2)

except Exception as e:
    print("HEATMAP ERROR:", e)
    sys.exit(0)

