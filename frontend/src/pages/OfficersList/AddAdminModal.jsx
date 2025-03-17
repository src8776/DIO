import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddAdminPage from './AddAdminPage';

// TODO: Implement handleSave function to save member data to database 
// TODO: display success message
// TODO: display error message if member already exists
// OPTIONAL TODO: display member details modal if member already exists

export default function AddMemberModal({orgID}) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSave = () => {
    console.log("Adding new member with info:", memberData);
    // TODO: Implement backend call to save member data
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
