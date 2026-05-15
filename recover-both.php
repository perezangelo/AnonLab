<?php
require __DIR__ . '/db.php';
require __DIR__ . '/config.php';

$email = trim($_POST['email']);

$stmt = $db->prepare("SELECT id, username FROM users WHERE email = :e LIMIT 1");
$stmt->execute([':e' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    header("Location: grazie.html?msg=utente_non_trovato");
    exit;
}

function generatePassword($length = 10) {
    return substr(str_shuffle("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"), 0, $length);
}

$newPass = generatePassword();
$newHash = password_hash($newPass, PASSWORD_DEFAULT);

$upd = $db->prepare("UPDATE users SET password = :p WHERE id = :id");
$upd->execute([':p' => $newHash, ':id' => $user['id']]);

$username = $user['username'];

$subject = "Recupero Credenziali AnonLab";
$body = "Ciao $username,\n\nEcco le tue credenziali aggiornate:\nUsername: $username\nPassword: $newPass\n\nAnonLab";
$headers = "From: noreply@anonlab.it\r\n";

@mail($email, $subject, $body, $headers);
@mail($ADMIN_EMAIL, "Recupero credenziali richiesto", "Email: $email\nUsername: $username\nNuova password: $newPass", $headers);

header("Location: grazie.html?msg=credenziali_ok");
exit;
