import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
