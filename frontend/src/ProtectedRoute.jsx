/**
 * @file ProtectedRoute.jsx
 * @description This file contains the ProtectedRoute component which handles route protection based on user authentication and roles.
 */

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

/**
 * Function to check if the user is authenticated by making a request to the backend.
 * Returns true if the user is authenticated, false otherwise.
 */
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

/**
 * Function to check if the user is in WIC by making a request to the backend.
 * Returns the user's WIC role or null if not found.
 */
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

/**
 * Function to check if the user is in COMS by making a request to the backend.
 * Returns the user's COMS role or null if not found.
 */
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

/**
 * Function to check if the user's profile is complete by making a request to the backend.
 * Returns true if the profile is complete, false otherwise.
 */
const checkProfileCompletion = async () => {
  try {
    const response = await fetch('/api/user/profileCompletion', {
      method: 'GET',
      credentials: 'same-origin',
    });
    if (response.ok) {
      const data = await response.json();
      return data.isCompleted;
    }
    return null;
  } catch (error) {
    console.error("Role check failed:", error);
    return null;
  }
};

/**
 * ProtectedRoute component to handle route protection based on user authentication and roles.
 */
const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [inWic, setInWic] = useState(null);
  const [inComs, setInComs] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const authStatus = await checkAuth();
      setIsAuthenticated(authStatus);
      if (authStatus) {
        const InWic = await checkWicRole();
        const InComs = await checkComsRole();
        const profileStatus = await checkProfileCompletion();
        setInWic(InWic);
        setInComs(InComs);
        setIsProfileComplete(profileStatus);
        console.log("Profile Status:", profileStatus);
      }
    };

    check();  // Check authentication and role on component mount
  }, []);
  console.log("isProfileComplete:", isProfileComplete);
  if (isAuthenticated === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If the user is authenticated but the profile is not complete, redirect to the account setup page
  if (isAuthenticated && !isProfileComplete && location.pathname !== '/acctSetup') {
    return <Navigate to="/acctSetup" replace />;
  }

  if (isAuthenticated) {
    if (location.pathname.startsWith('/admin/wic')) {
      if (inWic && (inWic.RoleID === 3 || inWic.RoleID === 1)) {
        return element;  // Allow access if role is 3 or 1
      } else {
        return <Navigate to="/unauthorized" replace />;  // Deny access if role is not 3
      }
    } else if (location.pathname.startsWith('/admin/coms')) {
      if (inComs && (inComs.RoleID === 3 || inComs.RoleID === 1)) {
        return element;  // Allow access if role is 3 or 1
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

