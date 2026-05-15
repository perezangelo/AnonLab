<?php
// Email privata (non visibile nel sito)
$to = "perez.angelo@alice.it";

// Dati dal form
$question = isset($_POST['question']) ? trim($_POST['question']) : '';
$details  = isset($_POST['details']) ? trim($_POST['details']) : '';

// Controllo minimo
if ($question === '') {
    die("Errore: domanda mancante.");
}

// Oggetto email
$subject = "Nuova domanda dal sito AnonLab";

// Corpo email
$message = "Domanda: " . $question . "\n\n";
$message .= "Dettagli: " . $details . "\n";

// Header
$headers = "From: noreply@anonlab.it\r\n";
$headers .= "Reply-To: noreply@anonlab.it\r\n";

// Invio email
mail($to, $subject, $message, $headers);

// Risposta per l’utente
echo "Domanda inviata correttamente. Ti risponderemo al più presto.";
?>
