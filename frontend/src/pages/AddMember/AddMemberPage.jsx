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