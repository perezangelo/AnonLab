<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Content-Type: text/plain");
$input = fopen("php://input", "rb");
while (!feof($input)) fread($input, 8192);
fclose($input);
echo "OK";
?>
