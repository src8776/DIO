import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddAdminPage from './AddAdminPage';

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
