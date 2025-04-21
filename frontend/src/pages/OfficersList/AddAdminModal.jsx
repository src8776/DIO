import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddAdminPage from './AddAdminPage';

/**
 * AddAdminModal.jsx
 * 
 * This React component renders a modal interface for adding new administrators or e-board members to an organization.
 * It provides a button to open the modal, where users can select members and assign them roles as either "Admin" or "Eboard."
 * The component handles the submission of role assignments and updates the backend accordingly.
 * 
 * Key Features:
 * - Displays a button to open the modal for adding new administrators or e-board members.
 * - Renders the `AddAdminPage` component inside the modal for selecting and assigning roles.
 * - Sends role assignment data to the backend and reloads the page upon successful submission.
 * - Handles errors during the role assignment process and provides feedback in the console.
 * 
 * Props:
 * - orgID: String or number representing the organization ID.
 * 
 * Dependencies:
 * - React, Material-UI components, and Material-UI icons.
 * - AddAdminPage: A custom component for selecting members and assigning roles.
 * 
 * Functions:
 * - handleOpen: Opens the modal when the button is clicked.
 * - handleClose: Closes the modal.
 * - handleSave: Processes the selected members, assigns roles, and sends data to the backend.
 * 
 * Hooks:
 * - React.useState: Manages the open state of the modal.
 * 
 * @component
 */
export default function AddMemberModal({orgID}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = (members) => {
    members.forEach((user) => {
      const endpoint = user.role === 'Admin' ? 'setAdmin' : 'setEboard';
  
      fetch(`/api/admin/${endpoint}?organizationID=${orgID}&memberID=${user.MemberID}`, {
        method: 'POST'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          window.location.reload();
        })
        .catch((error) => {
          console.error(`Error adding ${user.role.toLowerCase()}:`, error);
        });
    });
  
    handleClose();
  };  

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<AddIcon />}
      >
        New Admin
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          <AddAdminPage
            orgID={orgID}
            handleSave={handleSave}
          />
        </Box>
      </Modal>
    </>
  );
}
