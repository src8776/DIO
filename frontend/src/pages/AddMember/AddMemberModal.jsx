import * as React from 'react';
import { Box, Button, Modal, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddMemberPage from './AddMemberPage';

/**
 * AddMemberModal.jsx
 * 
 * This React component provides a modal interface for adding a new member to an organization.
 * It allows users to input member details such as first name, last name, email, and semester ID.
 * The component handles form submission, updates the backend, and displays success or error messages.
 * 
 * Key Features:
 * - Opens a modal to display the AddMemberPage component for member input.
 * - Dynamically updates the semester ID when the selected semester changes.
 * - Sends member data to the backend API for saving.
 * - Displays success or error messages using a Snackbar component.
 * 
 * Props:
 * - selectedSemester: Object representing the currently selected semester.
 * - orgID: String representing the organization ID.
 * - onUploadSuccess: Callback function triggered after a successful member addition.
 * - buttonProps: Object containing additional props for the "Add Member" button.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - AddMemberPage: A child component for rendering the member input form.
 * 
 * Functions:
 * - handleOpen: Opens the modal.
 * - handleClose: Closes the modal.
 * - handleChange: Updates member data based on user input.
 * - handleSave: Sends the member data to the backend API and handles the response.
 * - handleSnackbarClose: Closes the Snackbar notification.
 * 
 * @component
 */
export default function AddMemberModal({ selectedSemester, orgID, onUploadSuccess, buttonProps = {} }) {
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
        onUploadSuccess?.();
      } else {
        const errorRes = await response.json();
        setSnackbar({ open: true, message: errorRes.error || 'Failed to add member.', severity: 'error' });
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
      <Button
        onClick={handleOpen}
        startIcon={<AddIcon />}
        {...buttonProps}
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
      <Snackbar open={snackbar.open} autoHideDuration={snackbar.severity === 'success' ? 6000 : undefined} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
