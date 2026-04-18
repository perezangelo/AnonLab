<?php
header("Content-Type: application/json");
echo json_encode([
    "name" => "AnonLab Speedtest Server",
    "server" => "https://anonlab.it/speedtest/",
    "dlURL" => "garbage.php",
    "ulURL" => "backend.php",
    "pingURL" => "empty.php",
    "getIpURL" => "getIP.php"
]);
?>
