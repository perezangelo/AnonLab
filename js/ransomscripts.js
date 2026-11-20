<?php
$allowedOrigins = ["https://anonlab.it", "https://www.anonlab.it"];
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: https://anonlab.it");
}
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

$cacheFile = __DIR__ . "/cache_ransomindex.json";
$cacheTtl  = 1800; // 30 minuti

// Se in futuro Ransomware.live richiede API-PRO (api-pro.ransomware.live),
// puoi inserire qui la tua chiave gratuita da my.ransomware.live:
$apiKey = ""; // es. "la-tua-api-key"

function getURL($url, $apiKey = "") {
    if (!function_exists("curl_init")) {
        return false;
    }

    $headers = [
        "Accept: application/json",
        "User-Agent: AnonLab-NewsOps/1.0 (+https://anonlab.it)"
    ];
    if ($apiKey !== "") {
        $headers[] = "X-API-KEY: " . $apiKey;
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_CONNECTTIMEOUT => 6,
        CURLOPT_TIMEOUT        => 12,
        CURLOPT_HTTPHEADER     => $headers
    ]);

    $out  = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($out === false || $code < 200 || $code >= 300) {
        return false;
    }

    return $out;
}

// 1) Cache valida
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTtl) {
    $cached = @file_get_contents($cacheFile);
    if ($cached) {
        echo $cached;
        exit;
    }
}

// 2) Chiamata live (prima v2/pro, poi fallback v1)
$groupsRaw = false;
if ($apiKey !== "") {
    $groupsRaw = getURL("https://api-pro.ransomware.live/groups", $apiKey);
}
if (!$groupsRaw) {
    $groupsRaw = getURL("https://api.ransomware.live/v2/groups");
}
if (!$groupsRaw) {
    $groupsRaw = getURL("https://api.ransomware.live/v1/groups");
}

$groups = $groupsRaw ? json_decode($groupsRaw, true) : null;

// Se l'API fallisce o restituisce 429/errore, usa la cache scaduta prima di dare errore
if (!is_array($groups) || empty($groups)) {
    if (file_exists($cacheFile)) {
        $stale = @file_get_contents($cacheFile);
        if ($stale) {
            echo $stale;
            exit;
        }
    }
    echo json_encode([
        ["Nessun dato", "API temporaneamente non raggiungibile", "Unknown", "N/A", "", ""]
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$parsed = [];

foreach ($groups as $g) {
    if (!is_array($g)) continue;

    $group = trim((string)($g["name"] ?? "Unknown"));
    if ($group === "") $group = "Unknown";

    // Descrizione: prova description, poi meta
    $desc = trim((string)($g["description"] ?? ""));
    if ($desc === "" || strcasecmp($desc, "No description available") === 0) {
        $meta = trim((string)($g["meta"] ?? ""));
        $desc = ($meta !== "") ? $meta : "Nessuna descrizione disponibile nel feed.";
    }

    // Stato reale e Leak Site calcolati da locations[]
    $locations = (isset($g["locations"]) && is_array($g["locations"])) ? $g["locations"] : [];
    $hasOnline = false;
    $bestLeak  = "";
    $latestLocDate = "";

    foreach ($locations as $loc) {
        if (!is_array($loc)) continue;

        $avail = !empty($loc["available"]);
        if ($avail) {
            $hasOnline = true;
        }

        // Ricava URL completo (preferendo slug o aggiungendo http:// a fqdn)
        $candidateUrl = "";
        if (!empty($loc["slug"]) && preg_match('#^https?://#i', $loc["slug"])) {
            $candidateUrl = $loc["slug"];
        } elseif (!empty($loc["fqdn"])) {
            $candidateUrl = "http://" . ltrim($loc["fqdn"], "/");
        }

        // Preferisci la location attiva se presente
        if ($candidateUrl !== "" && ($bestLeak === "" || $avail)) {
            $bestLeak = $candidateUrl;
        }

        $locUpdated = substr((string)($loc["updated"] ?? $loc["lastscrape"] ?? ""), 0, 10);
        if ($locUpdated !== "" && strcmp($locUpdated, $latestLocDate) > 0) {
            $latestLocDate = $locUpdated;
        }
    }

    if (!empty($g["status"]) && strcasecmp($g["status"], "Unknown") !== 0) {
        $status = $g["status"];
    } elseif ($hasOnline) {
        $status = "Active";
    } elseif (!empty($locations)) {
        $status = "Inactive";
    } else {
        $status = "Unknown";
    }

    // Data: added / added_date oppure ultima data di locations
    $rawDate = (string)($g["added"] ?? $g["added_date"] ?? "");
    $date = $rawDate !== "" ? substr($rawDate, 0, 10) : ($latestLocDate !== "" ? $latestLocDate : "N/D");

    // Se non c'è leak site onion, usa almeno la scheda pubblica ransomware.live se presente
    if ($bestLeak === "" && !empty($g["url"]) && preg_match('#^https?://#i', $g["url"])) {
        $bestLeak = $g["url"];
    }

    // Icona valida solo se URL http/https
    $icon = "";
    if (!empty($g["logo"]) && preg_match('#^https?://#i', $g["logo"])) {
        $icon = $g["logo"];
    }

    $parsed[] = [
        "row"      => [$group, $desc, $status, $date, $bestLeak, $icon],
        "isActive" => ($status === "Active") ? 1 : 0,
        "hasDesc"  => ($desc !== "Nessuna descrizione disponibile nel feed.") ? 1 : 0,
        "sortDate" => ($date !== "N/D") ? $date : "0000-00-00"
    ];
}

// Ordina: prima i gruppi Active, poi data più recente, poi chi ha descrizione
usort($parsed, function ($a, $b) {
    if ($a["isActive"] !== $b["isActive"]) {
        return $b["isActive"] <=> $a["isActive"];
    }
    $cmpDate = strcmp($b["sortDate"], $a["sortDate"]);
    if ($cmpDate !== 0) {
        return $cmpDate;
    }
    return $b["hasDesc"] <=> $a["hasDesc"];
});

// Limita ai primi 50 gruppi più rilevanti per mantenere veloce il DOM
$final = array_map(function ($entry) {
    return $entry["row"];
}, array_slice($parsed, 0, 50));

$jsonOut = json_encode($final, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($jsonOut !== false) {
    @file_put_contents($cacheFile, $jsonOut, LOCK_EX);
    echo $jsonOut;
} else {
    echo json_encode([]);
}
