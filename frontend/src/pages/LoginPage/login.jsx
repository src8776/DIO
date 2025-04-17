import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Button, CircularProgress } from '@mui/material';

/**
 * login.jsx
 * 
 * This React component renders the login page for the application. It provides a simple interface for users
 * to log in using RIT's Single Sign-On (SSO) system. The component handles login initiation, displays a loading
 * spinner during the login process, and provides error feedback if the login fails.
 * 
 * Key Features:
 * - Displays a login button for initiating the SSO login process.
 * - Redirects users to the SAML login route when the login button is clicked.
 * - Shows a loading spinner while the login process is in progress.
 * - Displays error messages if login fails.
 * 
 * Props:
 * - None
 * 
 * Dependencies:
 * - React, Material-UI components.
 * 
 * Functions:
 * - handleLogin: Initiates the login process by redirecting the user to the SAML login route.
 * 
 * Hooks:
 * - React.useState: Manages state for the login process (`isLoggingIn`) and error messages (`loginError`).
 * 
 * @component
 */
export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Redirects the user to the SAML login route
  const handleLogin = () => {
    setIsLoggingIn(true);
    setLoginError(null);  // Reset previous errors

    // Redirect to SAML login
    window.location.href = '/saml2/login';
  };

  return (
    <Container sx={{ width: { xs: '100%', md: '50%' }, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper component="form" sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', p: 2, gap: 2 }}>
        <Typography variant="h5">Login to Your Account</Typography>

        {/* Show a loading spinner if logging in */}
        {isLoggingIn ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {loginError && (
              <Typography color="error" variant="body2">{loginError}</Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" onClick={handleLogin} sx={{ width: '100%' }}>
                Login with RIT SSO
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
