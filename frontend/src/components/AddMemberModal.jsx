import * as React from 'react';
import { Box, Button, Modal, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddMemberPage from '../pages/AddMember/AddMemberPage';


export default function AddMemberModal({ selectedSemester, orgID }) {
  const [open, setOpen] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

  const initialMemberData = {
    firstName: "",
    lastName: "",
    email: "",
    semesterID: selectedSemester ? selectedSemester.SemesterID : null,
  };
  
  const [memberData, setMemberData] = React.useState(initialMemberData);
  
  // Update semesterID when selectedSemester changes
  React.useEffect(() => {
    setMemberData(prevData => ({
      ...prevData,
      semesterID: selectedSemester ? selectedSemester.SemesterID : null,
    }));
  }, [selectedSemester]);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  // Handle input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setMemberData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSave = async () => {
    console.log("Adding new member with info:", memberData);
    try {
      const response = await fetch('/api/admin/members/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...memberData,
          organizationID: orgID, // use the passed orgID
          semesterID: memberData.semesterID,
        }),
      });
      if (response.ok) {
        setSnackbar({ open: true, message: 'Member added successfully!', severity: 'success' });
      } else {
        console.error('Server error:', response.statusText);
        setSnackbar({ open: true, message: 'Failed to add member.', severity: 'error' });
      }
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
      <Button onClick={handleOpen} variant="contained" startIcon={<AddIcon />} sx={{ maxWidth: '280px' }}>
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
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
