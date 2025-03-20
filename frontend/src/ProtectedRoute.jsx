import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Function to check if the user is authenticated by making a request to the backend
export const checkAuth = async () => {
  try {
    const response = await fetch('/saml2/api/me', {
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
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
    };

    check();  // Check authentication on component mount
  }, []);

  if (isAuthenticated === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return element;
  } else {
    return location.pathname === '/' ? <Navigate to="/welcome" replace /> : <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

