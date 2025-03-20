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

// Function to check the user's role by making a request to the backend
export const checkRole = async () => {
  try {
    const response = await fetch('/memberRole', {
      method: 'GET',
      credentials: 'same-origin', // Ensure the session cookie is sent
    });
    if (response.ok) {
      const data = await response.json();
      return data.role;  // Return the user's role
    }
    return null;  // Role not found
  } catch (error) {
    console.error("Role check failed:", error);
    return null;  // Assume no role in case of error
  }
};

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
      if (authStatus) {
        const userRole = await checkRole();
        setRole(userRole);
      }
    };

    check();  // Check authentication and role on component mount
  }, []);

  if (isAuthenticated === null || (isAuthenticated && role === null)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    if (location.pathname.startsWith('/admin')) {
      if (role === 3) {
        return element;  // Allow access if role is 3
      } else {
        return <Navigate to="/unauthorized" replace />;  // Deny access if role is not 3
      }
    }
    return element;  // Allow access for non-admin routes
  } else {
    return location.pathname === '/' ? <Navigate to="/welcome" replace /> : <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

