<?php
require __DIR__ . '/db.php';

$adminEmail = "perez.angelo@alice.it";

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
if ($email === '') {
    header("Location: /grazie.html?msg=errore_email");
    exit;
}

// Cerca utente
$stmt = $db->prepare("SELECT id, username FROM users WHERE email = :e LIMIT 1");
$stmt->execute([':e' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    header("Location: /grazie.html?msg=utente_non_trovato");
    exit;
}

// Genera nuova password
function generatePassword($length = 10) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return substr(str_shuffle($chars), 0, $length);
}

$newPasswordPlain = generatePassword();
$newPasswordHash  = password_hash($newPasswordPlain, PASSWORD_DEFAULT);

// Aggiorna password nel database
$upd = $db->prepare("UPDATE users SET password = :p WHERE id = :id");
$upd->execute([
    ':p'  => $newPasswordHash,
    ':id' => $user['id']
]);

$username = $user['username'];

// 1) Email all’utente
$subjectUser = "Recupero credenziali AnonLab";
$bodyUser  = "Ciao $username,\n\n";
$bodyUser .= "Hai richiesto il recupero delle tue credenziali.\n";
$bodyUser .= "Ecco i tuoi dati aggiornati:\n\n";
$bodyUser .= "Username: $username\n";
$bodyUser .= "Nuova password: $newPasswordPlain\n\n";
$bodyUser .= "Ti consigliamo di conservarla in un luogo sicuro.\n\n";
$bodyUser .= "AnonLab — Cybersecurity & Cultura Digitale";

$headersUser  = "From: noreply@anonlab.it\r\n";
$headersUser .= "Reply-To: noreply@anonlab.it\r\n";

@mail($email, $subjectUser, $bodyUser, $headersUser);

// 2) Email a te
$subjectAdmin = "Recupero credenziali richiesto";
$bodyAdmin  = "Un utente ha richiesto il recupero credenziali:\n\n";
$bodyAdmin .= "Email: $email\n";
$bodyAdmin .= "Username: $username\n";
$bodyAdmin .= "Nuova password generata: $newPasswordPlain\n";

$headersAdmin  = "From: noreply@anonlab.it\r\n";
$headersAdmin .= "Reply-To: noreply@anonlab.it\r\n";

@mail($adminEmail, $subjectAdmin, $bodyAdmin, $headersAdmin);

// Redirect finale
header("Location: /grazie.html?msg=recupero_ok");
exit;
