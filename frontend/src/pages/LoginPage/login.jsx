import React from 'react';

const LoginPage = () => {
    const handleLogin = () => {
        window.location.href = '/saml2/login';
      };

  return (
    <div className="login-page">
      <button onClick={handleLogin}>Login with SAML</button>
    </div>
  );
};

export default LoginPage;
