import * as React from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MemberDetailsPage from '../pages/MemberDetails/MemberDetailsPage';



export default function IndividualDataModal({ memberID }) {
  const [open, setOpen] = React.useState(false);
  const handleOpen = (event) => {
    event.stopPropagation();
    setOpen(true);
  };
  const handleClose = (event) => {
    event.stopPropagation();
    setOpen(false)
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="member details"
        size="large"
      >
        <InfoIcon fontSize="inherit" />
      </IconButton>
      <Modal open={open} onClose={handleClose}>
        <Box >
          <MemberDetailsPage
            memberID={memberID}
          />
        </Box>
      </Modal>
    </>
  );
}
