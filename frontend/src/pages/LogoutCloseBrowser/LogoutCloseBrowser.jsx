import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
