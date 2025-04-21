import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * unauthorized.jsx
 * 
 * This React component renders a page displayed when a user attempts to access a restricted area without proper authorization.
 * It provides a message informing the user that they are not authorized and includes a button to navigate back to the landing page.
 * 
 * Key Features:
 * - Displays an error message indicating lack of authorization.
 * - Provides a button to redirect the user back to the landing page.
 * - Uses Material-UI components for styling and layout.
 * 
 * Dependencies:
 * - React, Material-UI components, and React Router.
 * 
 * Functions:
 * - handleGoBack: Navigates the user back to the landing page.
 * 
 * Hooks:
 * - React Router's `useNavigate`: Used to programmatically navigate to the landing page.
 * 
 * @component
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();

  // navigate to the landing page
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          You are not authorized to log in.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Please contact support or check your credentials.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={handleGoBack}>
            Go Back to Landing Page
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
