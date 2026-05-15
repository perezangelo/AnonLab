<?php
// Email privata (non visibile nel sito)
$to = "perez.angelo@alice.it";

// Dati dal form
$name    = isset($_POST['name']) ? trim($_POST['name']) : '';
$email   = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Controllo minimo
if ($name === '' || $email === '' || $message === '') {
    die("Errore: tutti i campi sono obbligatori.");
}

// Oggetto email
$subject = "Richiesta informazioni da AnonLab";

// Corpo email
$body  = "Nome: " . $name . "\n";
$body .= "Email: " . $email . "\n\n";
$body .= "Messaggio:\n" . $message . "\n";

// Header
$headers = "From: noreply@anonlab.it\r\n";
$headers .= "Reply-To: " . $email . "\r\n";

// Invio email
mail($to, $subject, $body, $headers);

// Risposta per l’utente
echo "Richiesta inviata correttamente. Ti risponderemo al più presto.";
?>
