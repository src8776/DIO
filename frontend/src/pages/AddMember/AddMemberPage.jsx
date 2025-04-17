import React from 'react';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';

const style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 3,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  width: { xs: '90%', sm: '500px', md: '600px' },
  maxWidth: '100%',
};

/**
 * AddMemberPage.jsx
 * 
 * This React component renders a form for adding a new member to an organization.
 * It allows users to input member details such as first name, last name, and email.
 * The component is designed to be used within a modal or standalone container.
 * 
 * Key Features:
 * - Displays a form with input fields for member details.
 * - Validates required fields to ensure all necessary information is provided.
 * - Provides a "Save" button to trigger the save action.
 * 
 * Props:
 * - memberData: Object containing the current values for the form fields.
 * - handleChange: Function to handle changes in the form fields.
 * - handleSave: Function to handle the save action when the "Save" button is clicked.
 * 
 * Dependencies:
 * - React, Material-UI components.
 * 
 * @component
 */
function AddMemberPage({ memberData, handleChange, handleSave }) {

  return (
    <Container >
      <Paper elevation={1} sx={style}>
        <Typography variant="h5">
          New Member Form
        </Typography>
        {/* Form Elements */}
        <Box component={"form"} sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
          <TextField
            required
            id="outlined-required"
            label="First Name"
            name="firstName"
            value={memberData.firstName}
            onChange={handleChange}
          />
          <TextField
            required
            id="outlined-required"
            label="Last Name"
            name="lastName"
            value={memberData.lastName}
            onChange={handleChange}
          />
          <TextField
            required
            id="outlined-required"
            label="Email"
            name="email"
            value={memberData.email}
            onChange={handleChange}
          />
        </Box>

        <Button
          variant='contained'
          onClick={handleSave}
        >
          Save
        </Button>
      </Paper>
    </Container>
  );
}

export default AddMemberPage;