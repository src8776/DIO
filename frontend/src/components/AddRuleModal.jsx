import * as React from 'react';
import { Box, Button, Modal } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AddRulePage from '../pages/OrganizationSetup/AddRulePage';

export default function AddRuleModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        startIcon={<AddIcon/>}
      >
        Add Event
      </Button>
      <Modal open={open} onClose={handleClose}>
        <Box>
          <AddRulePage/>
        </Box>
      </Modal>
    </>
  );
}
