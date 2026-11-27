import csv
import time
import requests
import xml.etree.ElementTree as ET
from urllib.parse import urljoin, urlparse
from collections import deque
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

BASE_URL = "https://anonlab.it"
SITEMAP_URL = "https://anonlab.itsitemap.xml"
OUTPUT_CSV = "report_pagine_js_anonlab.csv"

ESTENSIONI_ESCLUSE = (
    '.webp', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
    '.css', '.js', '.pdf', '.zip', '.xml', '.json', '.mp4', '.mp3'
)

def normalizza_url(url):
    """Pulisce l'URL rimuovendo ancore (#) e uniformando il percorso."""
    parsed = urlparse(url)
    path = parsed.path if parsed.path else "/"
    return f"{parsed.scheme}://{parsed.netloc}{path}"

def legge_sitemap(sitemap_url):
    """Estrae gli URL dalla sitemap.xml come punto di partenza."""
    urls_trovati = set()
    try:
        resp = requests.get(sitemap_url, timeout=10)
        if resp.status_code == 200 and 'xml' in resp.headers.get('Content-Type', ''):
            root = ET.fromstring(resp.text)
            for elem in root.iter():
                if elem.tag.endswith('loc') and elem.text:
                    loc = elem.text.strip()
                    if loc.endswith('.xml'):
                        urls_trovati.update(legge_sitemap(loc))
                    else:
                        urls_trovati.add(normalizza_url(loc))
    except Exception:
        pass
    return urls_trovati

def esegui_audit_con_js(start_url, max_pagine=2000):
    dominio_base = urlparse(start_url).netloc
    pagine_visitate = set()
    report_righe = []

    urls_iniziali = legge_sitemap(SITEMAP_URL)
    urls_iniziali.add(normalizza_url(start_url))
    
    coda = deque([(u, "Sitemap/Start") for u in urls_iniziali])
    urls_in_coda = set(urls_iniziali)

    print(f"Avvio browser headless per scansione JS su {dominio_base}...\n")

    with sync_playwright() as p:
        # Avvia Chromium in modalità invisibile
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        # Blocca il caricamento di immagini, font e media per velocizzare moltissimo la navigazione
        page.route("**/*", lambda route: route.abort() 
                   if route.request.resource_type in ["image", "media", "font"] 
                   else route.continue_())

        while coda and len(pagine_visitate) < max_pagine:
            url_corrente, pagina_origine = coda.popleft()
            
            if url_corrente in pagine_visitate:
                continue

            try:
                # Attende che la rete sia inattiva (networkidle) per dare tempo a JS di caricare i dati
                response = page.goto(url_corrente, wait_until="networkidle", timeout=15000)
                status_code = response.status if response else "NESSUNA_RISPOSTA"
            except PlaywrightTimeoutError:
                pagine_visitate.add(url_corrente)
                report_righe.append({
                    'Stato': 'TIMEOUT_JS',
                    'URL': url_corrente,
                    'Titolo': 'Timeout caricamento pagina',
                    'Trovato_In': pagina_origine
                })
                print(f"[TIMEOUT] {url_corrente} (trovato in: {pagina_origine})")
                continue
            except Exception as e:
                pagine_visitate.add(url_corrente)
                report_righe.append({
                    'Stato': 'ERRORE_NAVIGAZIONE',
                    'URL': url_corrente,
                    'Titolo': str(e)[:80],
                    'Trovato_In': pagina_origine
                })
                print(f"[ERRORE] {url_corrente} (trovato in: {pagina_origine})")
                continue

            pagine_visitate.add(url_corrente)

            # Intercetta errori 404, 500, ecc.
            if status_code != 200:
                report_righe.append({
                    'Stato': status_code,
                    'URL': url_corrente,
                    'Titolo': 'Pagina non trovata / Errore HTTP',
                    'Trovato_In': pagina_origine
                })
                print(f"[{status_code} ROTTO] {url_corrente} (trovato in: {pagina_origine})")
                continue

            # Piccola pausa extra opzionale per animazioni/script ritardati
            page.wait_for_timeout(500)

            titolo = page.title().strip() or "Nessun titolo"
            report_righe.append({
                'Stato': status_code,
                'URL': url_corrente,
                'Titolo': titolo,
                'Trovato_In': pagina_origine
            })
            print(f"[200 OK] ({len(pagine_visitate)}) {url_corrente} -> {titolo[:40]}")

            # Estrae tutti gli attributi href dal DOM renderizzato tramite JavaScript
            hrefs = page.eval_on_selector_all("a[href]", "elements => elements.map(e => e.getAttribute('href'))")

            for href in hrefs:
                if not href:
                    continue
                href = href.strip()
                if href.startswith(('mailto:', 'tel:', 'javascript:', '#')):
                    continue

                url_assoluto = urljoin(url_corrente, href)
                parsed = urlparse(url_assoluto)

                # Filtra solo i link interni al dominio anonlab.it
                if parsed.scheme in ('http', 'https') and parsed.netloc == dominio_base:
                    url_pulito = normalizza_url(url_assoluto)
                    if (not parsed.path.lower().endswith(ESTENSIONI_ESCLUSE) and 
                        url_pulito not in pagine_visitate and 
                        url_pulito not in urls_in_coda):
                        coda.append((url_pulito, url_corrente))
                        urls_in_coda.add(url_pulito)

        browser.close()

    return report_righe

def salva_report_csv(righe, nome_file):
    with open(nome_file, mode='w', newline='', encoding='utf-8-sig') as file:
        campi = ['Stato', 'URL', 'Titolo', 'Trovato_In']
        writer = csv.DictWriter(file, fieldnames=campi, delimiter=';')
        writer.writeheader()
        writer.writerows(righe)

if __name__ == "__main__":
    righe = esegui_audit_con_js(BASE_URL)
    salva_report_csv(righe, OUTPUT_CSV)
    
    pagine_ok = [r for r in righe if r['Stato'] == 200]
    pagine_errore = [r for r in righe if r['Stato'] != 200]
    
    print("\n" + "="*50)
    print(f"SCANSIONE JS COMPLETATA!")
    print(f"- Pagine interne valide (200 OK): {len(pagine_ok)}")
    print(f"- Link interni rotti (404/errori): {len(pagine_errore)}")
    print(f"- Report salvato in: {OUTPUT_CSV}")
    print("="*50)
