<?php
require __DIR__ . '/db.php';

$adminEmail = "perez.angelo@alice.it";
$email = trim($_POST['email']);

$stmt = $db->prepare("SELECT username FROM users WHERE email = :e LIMIT 1");
$stmt->execute([':e' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    header("Location: /grazie.html?msg=utente_non_trovato");
    exit;
}

$username = $user['username'];

// Email all’utente
$subjectUser = "Recupero Username AnonLab";
$bodyUser  = "Ciao,\n\n";
$bodyUser .= "La tua username registrata è:\n\n";
$bodyUser .= "Username: $username\n\n";
$bodyUser .= "AnonLab — Cybersecurity & Cultura Digitale";

$headers = "From: noreply@anonlab.it\r\n";
@mail($email, $subjectUser, $bodyUser, $headers);

// Email a te
@mail($adminEmail, "Recupero username richiesto", "Email: $email\nUsername: $username", $headers);

header("Location: /grazie.html?msg=username_ok");
exit;
