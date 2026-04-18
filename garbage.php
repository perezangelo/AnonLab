
<?php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Content-Type: application/octet-stream");
$size = 1000000;
echo str_repeat("0", $size);
?>
