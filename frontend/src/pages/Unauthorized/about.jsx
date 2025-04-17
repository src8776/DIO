import React from 'react';
import { Box, Container, Typography, Grid, List, ListItem } from '@mui/material';

/**
 * about.jsx
 * 
 * This React component renders the "About" page for the application. It provides information about the project,
 * including the team members who contributed to its development and a footer with additional details.
 * 
 * Key Features:
 * - Displays a title and description about the project and its contributors.
 * - Lists the names of the team members who developed the project.
 * - Includes a footer with the project name and copyright information.
 * 
 * Props:
 * - None
 * 
 * Dependencies:
 * - React, Material-UI components.
 * 
 * Functions:
 * - None
 * 
 * @component
 */
const AboutPage = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>

      {/* About Content */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Grid container justifyContent="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom color="text.primary" textAlign="center">
              About
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" gutterBottom>
              An RIT Senior Development Project created by the 2024-2025 Dream Team:<br />
              Ethan Butts<br />
              Sophia Castiglione<br />
              Charles Coleman<br />
              Daniel Mot<br />
              Menna Nicola<br />
              Lennard Szyperski<br />
              Adam Wang
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h6" color="primary" fontWeight="bold">
                RIT DIO Membership Tracker
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} RIT Diversity and Initiatives Office (DIO). All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPage;
