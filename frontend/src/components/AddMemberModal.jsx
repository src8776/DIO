import * as React from 'react';
import { Box, Button, Modal, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddMemberPage from '../pages/AddMember/AddMemberPage';
import axios from 'axios';

// TODO: Implement handleSave function to save member data to database 
// TODO: display success message
// TODO: display error message if member already exists
// OPTIONAL TODO: display member details modal if member already exists
//comment

export default function AddMemberModal({ selectedSemester }) {
  const [open, setOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [memberData, setMemberData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    semesterID: selectedSemester.semesterID,
  });

  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setMemberData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Adding new member with info:", memberData);
    try {
      const response = axios.post('/api/members/add', {
        ...memberData,
        organizationID: selectedSemester.organizationID,
        semesterID: selectedSemester.semesterID,
      });
      setSnackbar({ open: true, message: 'Member added successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error adding member:', error);
      setSnackbar({ open: true, message: 'Failed to add member.', severity: 'error' });
    }
    handleClose();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<AddIcon />}
        sx={{maxWidth: '280px'}}
      >
        Add Member
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          <AddMemberPage
            memberData={memberData}
            handleChange={handleChange}
            handleSave={handleSave}
          />
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
