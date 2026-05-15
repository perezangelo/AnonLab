<?php
require __DIR__ . '/db.php';

$adminEmail = "perez.angelo@alice.it";
$email = trim($_POST['email']);

$stmt = $db->prepare("SELECT id, username FROM users WHERE email = :e LIMIT 1");
$stmt->execute([':e' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    header("Location: /grazie.html?msg=utente_non_trovato");
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

// Email all’utente
$subjectUser = "Recupero Password AnonLab";
$bodyUser  = "Ciao $username,\n\n";
$bodyUser .= "La tua nuova password è:\n\n";
$bodyUser .= "Password: $newPass\n\n";
$bodyUser .= "AnonLab — Cybersecurity & Cultura Digitale";

$headers = "From: noreply@anonlab.it\r\n";
@mail($email, $subjectUser, $bodyUser, $headers);

// Email a te
@mail($adminEmail, "Recupero password richiesto", "Email: $email\nUsername: $username\nNuova password: $newPass", $headers);

header("Location: /grazie.html?msg=password_ok");
exit;
