import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddAdminPage from './AddAdminPage';

// TODO: display success message
// TODO: display error message if member already exists
// OPTIONAL TODO: display member details modal if member already exists

export default function AddMemberModal({orgID}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = (members) => {
    console.log("Adding new members:", members);

    members.forEach((user) => {
      fetch(`/api/admin/setOfficer?organizationID=${orgID}&memberID=${user.MemberID}`, {
        method: 'POST'
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log("Member added successfully:", data);
        // Reload the page after the member is added successfully
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
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
