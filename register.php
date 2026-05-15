<?php
require __DIR__ . '/db.php';

// Email admin
$adminEmail = "perez.angelo@alice.it";

// Dati form
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$email    = isset($_POST['email']) ? trim($_POST['email']) : '';

if ($username === '' || $email === '') {
    die("Errore: tutti i campi sono obbligatori.");
}

// Genera password casuale
function generatePassword($length = 10) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return substr(str_shuffle($chars), 0, $length);
}

$passwordPlain = generatePassword();
$passwordHash  = password_hash($passwordPlain, PASSWORD_DEFAULT);

// Salva utente nel database
$stmt = $db->prepare("INSERT INTO users (username, email, password, created_at) VALUES (:u, :e, :p, :c)");
try {
    $stmt->execute([
        ':u' => $username,
        ':e' => $email,
        ':p' => $passwordHash,
        ':c' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    die("Errore: username o email già registrati.");
}

// 1) Email a te
$subjectAdmin = "Nuova registrazione utente su AnonLab";
$bodyAdmin  = "Nuovo utente registrato:\n\n";
$bodyAdmin .= "Username: $username\n";
$bodyAdmin .= "Email: $email\n";
$bodyAdmin .= "Password generata: $passwordPlain\n";

$headersAdmin  = "From: noreply@anonlab.it\r\n";
$headersAdmin .= "Reply-To: noreply@anonlab.it\r\n";

@mail($adminEmail, $subjectAdmin, $bodyAdmin, $headersAdmin);

// 2) Email all’utente
$subjectUser = "Benvenuto su AnonLab — Le tue credenziali";
$bodyUser  = "Ciao $username,\n\n";
$bodyUser .= "La tua registrazione è avvenuta con successo.\n";
$bodyUser .= "Ecco le tue credenziali personali:\n\n";
$bodyUser .= "Username: $username\n";
$bodyUser .= "Password: $passwordPlain\n\n";
$bodyUser .= "Ti consigliamo di conservarle in un luogo sicuro.\n\n";
$bodyUser .= "AnonLab — Cybersecurity & Cultura Digitale";

$headersUser  = "From: noreply@anonlab.it\r\n";
$headersUser .= "Reply-To: noreply@anonlab.it\r\n";

@mail($email, $subjectUser, $bodyUser, $headersUser);

echo "Registrazione completata. Controlla la tua email.";
