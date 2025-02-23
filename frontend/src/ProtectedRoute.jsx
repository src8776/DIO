import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// Function to check if the user is authenticated by making a request to the backend
const checkAuth = async () => {
  try {
    const response = await fetch('/api/me', {
      method: 'GET',
      credentials: 'same-origin', // Ensure the session cookie is sent
    });
    if (response.ok) {
      return true;  // User is authenticated
    }
    return false;  // User is not authenticated
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;  // Assume not authenticated in case of error
  }
};

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const check = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
    };

    check();  // Check authentication on component mount
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;  // Loading state while checking auth status
  }

  return isAuthenticated ? element : <Navigate to="/saml2/login" replace />;
};

export default ProtectedRoute;

