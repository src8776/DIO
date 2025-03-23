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
    const response = await fetch('/api/user/memberRole', {
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

export const checkWicRole = async () => {
  try {
    const response = await fetch('/api/user/inWic', {
      method: 'GET',
      credentials: 'same-origin', // Ensure the session cookie is sent
    });
    if (response.ok) {
      const data = await response.json();
      return data.inWic;  // Return the user's role
    }
    return null;  // Role not found
  } catch (error) {
    console.error("Role check failed:", error);
    return null;  // Assume no role in case of error
  }
};

export const checkComsRole = async () => {
  try {
    const response = await fetch('/api/user/inComs', {
      method: 'GET',
      credentials: 'same-origin', // Ensure the session cookie is sent
    });
    if (response.ok) {
      const data = await response.json();
      return data.inComs;  // Return the user's role
    }
    return null;  // Role not found
  } catch (error) {
    console.error("Role check failed:", error);
    return null;  // Assume no role in case of error
  }
};

const fetchProfileStatus = async (email) => {
  try {
    const response = await fetch('/api/user/profile-status');
    if (!response.ok) throw new Error('Failed to fetch profile status');
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile status:', error);
    return null;
  }
};

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [role, setRole] = useState(null);
  const [inWic, setInWic] = useState(null);
  const [inComs, setInComs] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
      if (authStatus) {
        const userRole = await checkRole();
        const InWic = await checkWicRole();
        const InComs = await checkComsRole();
        setRole(userRole);
        setInWic(InWic);
        setInComs(InComs);

        const profileStatus = await fetchProfileStatus(authStatus.email);
        setIsProfileComplete(profileStatus.isProfileComplete);
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

  /*
  if (isAuthenticated && !isProfileComplete) {
    return <Navigate to="/acctSetup" replace />;
  }
*/
  if (isAuthenticated) {
    if (location.pathname.startsWith('/admin/wic')) {
      if ((role === 3 || role === 1) && inWic !== null) {
        return element;  // Allow access if role is 3
      } else {
        return <Navigate to="/unauthorized" replace />;  // Deny access if role is not 3
      }
    } else if (location.pathname.startsWith('/admin/coms')) {
      if ((role === 3 || role === 1) && inComs !== null) {
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

