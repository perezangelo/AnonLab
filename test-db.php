<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$db = new SQLite3(__DIR__ . '/database/users.db');

if ($db) {
    echo "OK: Connessione al database riuscita<br>";

    $result = $db->query("SELECT * FROM users LIMIT 1");
    $row = $result->fetchArray(SQLITE3_ASSOC);

    if ($row) {
        echo "Utente trovato:<br>";
        echo "Username: " . $row['username'] . "<br>";
        echo "Email: " . $row['email'] . "<br>";
    } else {
        echo "Nessun utente trovato nella tabella.";
    }
} else {
    echo "ERRORE: impossibile aprire il database.";
}
?>
