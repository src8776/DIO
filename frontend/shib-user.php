<?php
// Accessing Shibboleth attributes
$uid = $_SERVER['uid'] ?? 'Not provided';
$givenName = $_SERVER['givenName'] ?? 'Not provided';
$sn = $_SERVER['sn'] ?? 'Not provided';
$mail = $_SERVER['mail'] ?? 'Not provided';

echo "<h1>Shibboleth Attributes</h1>";
echo "<p>UID: $uid</p>";
echo "<p>Given Name: $givenName</p>";
echo "<p>Surname: $sn</p>";
echo "<p>Email: $mail</p>";
?>
