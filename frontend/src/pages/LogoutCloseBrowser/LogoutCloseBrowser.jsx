import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * LogoutCloseBrowser.jsx
 * 
 * This React component renders a page instructing users to close their browser to fully log out of the application.
 * It provides a message explaining the need to close all browser windows to complete the logout process and includes
 * a button to navigate back to the landing page.
 * 
 * Key Features:
 * - Displays a message instructing users to close their browser to log out completely.
 * - Provides a button to navigate back to the landing page.
 * - Uses Material-UI for styling and layout.
 * 
 * Props:
 * - None
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
export default function CloseBrowserPage() {
  const navigate = useNavigate();

  // navigate to the landing page
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Container sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          Close your browser to logout!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
            You will need to close all open windows of your current web browser to completely log out. If you do not properly quit your browser you will remain logged in
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
