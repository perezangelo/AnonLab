<?php
require __DIR__ . '/db.php';
require __DIR__ . '/config.php';

$email = trim($_POST['email']);

$stmt = $db->prepare("SELECT username FROM users WHERE email = :e LIMIT 1");
$stmt->execute([':e' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    header("Location: grazie.html?msg=utente_non_trovato");
    exit;
}

$username = $user['username'];

$subject = "Recupero Username AnonLab";
$body = "Ciao,\n\nLa tua username è:\n$username\n\nAnonLab";
$headers = "From: noreply@anonlab.it\r\n";

@mail($email, $subject, $body, $headers);
@mail($ADMIN_EMAIL, "Recupero username richiesto", "Email: $email\nUsername: $username", $headers);

header("Location: grazie.html?msg=username_ok");
exit;
