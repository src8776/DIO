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

function AddMember() {

  return (
    <Container >
      <Paper elevation={1} sx={style}>
        <Typography variant="h5">
          New Member Form
        </Typography>
        {/* Form Elements */}
        <Box component={"form"} sx={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2}}>
            <TextField
              required
              id="outlined-required"
              label="First Name"
            /> 
            <TextField
              required
              id="outlined-required"
              label="Last Name"
            />
            <TextField
              required
              id="outlined-required"
              label="Email"
            />
        </Box>
        {/* Save Button */}
        {/* TODO: Make this save the field inputs as a new member in the database */}
        {/* TODO: Form validation: 
                  make sure no duplicates get added, 
                  valid rit email, etc. */}
        <Button
          variant='contained'>
          Save
        </Button>
      </Paper>
    </Container>
  );
}

export default AddMember;