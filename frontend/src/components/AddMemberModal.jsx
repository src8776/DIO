import * as React from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddMemberPage from '../pages/AddMember/AddMemberPage';



export default function AddMemberModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<AddIcon />}
      >
        Add Member
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box >
          <AddMemberPage/>
        </Box>
      </Modal>
    </>
  );
}
