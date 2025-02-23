import React from 'react';

const LoginPage = () => {
  const handleLogin = async () => {
    try {
      const response = await fetch('/saml2/login', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        console.log("Redirecting to SAML login...");
      } else {
        console.error("Login failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  return (
    <div className="login-page">
      <button onClick={handleLogin}>Login with SAML</button>
    </div>
  );
};

export default LoginPage;
