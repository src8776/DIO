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

<script>
  const userData = {
    uid: "<?php echo $uid; ?>",
    givenName: "<?php echo $givenName; ?>",
    surname: "<?php echo $sn; ?>",
    email: "<?php echo $mail; ?>"
  };

  fetch('/api/shib-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  .then(response => response.json())
  .then(data => console.log('Backend Response:', data))
  .catch(error => console.error('Error:', error));
</script>