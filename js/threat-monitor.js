/* ============================================================
   Threat Monitor – Versione compatibile con backend AlterVista
   ============================================================ */

// URL del backend AlterVista che restituisce il JSON
const THREAT_API_URL = 'https://angelonline.altervista.org/api/threat-monitor.php';

// Funzione principale
function initThreatMonitor() {
    // Controllo rapido: se il container non esiste, esco
    const widget = document.querySelector('.widget-large .threat-bars');
    if (!widget) {
        console.warn('Threat Monitor widget not found in DOM.');
        return;
    }

    // Fetch verso AlterVista (CORS deve essere configurato lato PHP)
    fetch(THREAT_API_URL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        // Aggiorna il widget con i dati ricevuti
        updateThreatWidget(data);
    })
    .catch(error => {
        console.error('Error fetching Threat Monitor data:', error);
    });
}

// Funzione che aggiorna il DOM
function updateThreatWidget(data) {
    // Helper per aggiornare una barra
    function setBar(labelId, barId, value, suffix = '%') {
        const labelEl = document.getElementById(labelId);
        const barEl = document.getElementById(barId);

        if (!barEl) {
            console.warn('Bar element not found:', barId);
            return;
        }

        // Normalizza valore
        let v = Number(value);
        if (isNaN(v)) v = 0;
        if (v < 0) v = 0;
        if (v > 100) v = 100;

        // Aggiorna larghezza
        barEl.style.width = v + '%';

        // Aggiorna testo interno
        const valueSpan = barEl.querySelector('.bar-value');
        if (valueSpan) {
            valueSpan.textContent = v + suffix;
        } else {
            barEl.textContent = v + suffix;
        }

        // Aggiorna label (opzionale)
        if (labelEl) {
            // Mantiene il titolo, aggiunge valore
            const baseTitle = labelEl.getAttribute('data-title') || labelEl.textContent;
            labelEl.textContent = baseTitle + ': ' + v + suffix;
        }
    }

    // Mappatura campi JSON → widget
    // Adatta i nomi se il tuo JSON è diverso
    setBar('label-global',       'bar-global',       data.global);
    setBar('label-baseScoreAvg', 'bar-baseScoreAvg', data.baseScoreAvg);
    setBar('label-highCount',    'bar-highCount',    data.highCount);
    setBar('label-networkCount', 'bar-networkCount', data.networkCount);
    setBar('label-confImpact',   'bar-confImpact',   data.confImpact);
    setBar('label-availImpact',  'bar-availImpact',  data.availImpact);

    // Aggiorna timestamp
    const tsEl = document.getElementById('threat-last-update');
    if (tsEl && data.last_update) {
        try {
            const d = new Date(data.last_update);
            const formatted = d.toLocaleString('it-IT', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            tsEl.textContent = 'Last Update: ' + formatted;
        } catch (e) {
            tsEl.textContent = 'Last Update: ' + data.last_update;
        }
    }
}

// Hook su DOMContentLoaded (GitHub Pages)
document.addEventListener('DOMContentLoaded', function () {
    if (typeof initThreatMonitor === 'function') {
        initThreatMonitor();
    }
});
